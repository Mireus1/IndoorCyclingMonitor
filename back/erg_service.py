import time

import state
from fastapi import HTTPException
from openant.devices.fitness_equipment import FitnessEquipment
from sensor_service import get_session_by_identifier


def _send_erg_command(trainer: FitnessEquipment, target_watts: int) -> None:
    retries = 3

    for attempt in range(1, retries + 1):
        try:
            if attempt == 1 and hasattr(trainer, "set_basic_resistance"):
                try:
                    trainer.set_basic_resistance(0)
                except Exception:
                    pass

            trainer.set_target_power(target_watts)
            return
        except Exception as exc:
            error_text = str(exc)
            should_retry = (
                "Timed out while waiting for message" in error_text
                or "Failed to get acknowledgement" in error_text
            )
            if not should_retry or attempt == retries:
                raise
            time.sleep(0.4 * attempt)


def _get_trainer_capable_session(preferred_identifier: str):
    session = get_session_by_identifier(preferred_identifier)
    if hasattr(session.dev, "set_target_power"):
        return session

    for candidate in state.sessions.values():
        if hasattr(candidate.dev, "set_target_power"):
            return candidate

    raise HTTPException(
        status_code=400,
        detail="No connected Fitness Equipment device supports ERG control",
    )


def set_erg_mode(sensor_identifier: str, target_watts: int):
    session = _get_trainer_capable_session(sensor_identifier)

    trainer = getattr(session, "dev", None)
    if trainer is None or not hasattr(trainer, "set_target_power"):
        raise HTTPException(
            status_code=400,
            detail="Selected sensor does not support ERG mode / target power",
        )

    if target_watts < 0:
        raise HTTPException(
            status_code=400, detail="Target power must be a positive integer"
        )

    try:
        _send_erg_command(trainer, target_watts)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - hardware/USB issues
        raise HTTPException(
            status_code=500, detail=f"Failed to set ERG mode: {exc}"
        ) from exc

    return {
        "status": "ok",
        "sensor": sensor_identifier,
        "mode": "ERG",
        "target_watts": target_watts,
    }
