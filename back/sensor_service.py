import time
from typing import Dict, List, Optional

import state
from fastapi import HTTPException
from models import Sensor
from node_manager import require_node
from openant.devices.common import DeviceType
from openant.devices.fitness_equipment import FitnessEquipment
from openant.devices.heart_rate import HeartRate
from openant.devices.scanner import Scanner
from openant.devices.utilities import auto_create_device
from sessions import AntSession


def _sensor_key(dev_type: int, trans: int, dev_id: int) -> str:
    return f"{DeviceType(dev_type).name}_{trans}_{dev_id}"


def _sensor_label(dev_type: int, dev_id: int) -> str:
    return f"{DeviceType(dev_type).name}:{dev_id}"


def scan_sensors(timeout: float = 5.0) -> List[Sensor]:
    found: Dict[str, Sensor] = {}
    ant_node = require_node()

    def on_found(device_tuple):
        dev_id, dev_type, dev_trans = device_tuple
        key = _sensor_key(dev_type, dev_trans, dev_id)
        if key in found:
            return

        sensor = Sensor(
            name=key,
            id=dev_id,
            type=dev_type,
            trans=dev_trans,
            pretty=_sensor_label(dev_type, dev_id),
        )
        found[key] = sensor
        print(f"[scan] found {sensor.pretty} → key={key}")

    scanner = Scanner(ant_node, device_id=0, device_type=0)
    scanner.on_found = on_found
    scanner.open_channel()
    state.last_discovered = {}
    try:
        require_node()
        time.sleep(timeout)
    finally:
        scanner.close_channel()

    state.last_discovered = found
    print(f"[scan] complete: {len(found)} sensor(s)")
    return list(found.values())


def get_next_free_channel() -> int:
    used = {sess.dev.channel for sess in state.sessions.values()}
    for ch in range(8):
        if ch not in used:
            return ch
    raise HTTPException(status_code=500, detail="No ANT channel available")


def _session_for_sensor_id(sensor_id: int) -> Optional[AntSession]:
    for sess in state.sessions.values():
        if sess.sensor_id == sensor_id:
            return sess
    return None


def connect_sensor(sensor_name: str) -> dict:
    info = state.last_discovered.get(sensor_name)
    if not info:
        raise HTTPException(
            status_code=404,
            detail="Sensor not in last scan; please call GET /sensors first",
        )

    ant_node = require_node()
    channel = get_next_free_channel()
    if info.type == DeviceType.HeartRate.value:
        dev = HeartRate(ant_node, device_id=info.id)
    elif info.type == DeviceType.FitnessEquipment.value:
        dev = FitnessEquipment(
            ant_node, device_id=info.id, trans_type=info.trans or 0
        )
    else:
        dev = auto_create_device(ant_node, info.id, info.type, info.trans)

    session = AntSession(dev, info)
    session.connect()
    state.sessions[sensor_name] = session

    return {"session": session, "sensor": info, "channel": channel}


def get_sensor_data(sensor_name: str):
    session = state.sessions.get(sensor_name)
    if not session:
        raise HTTPException(status_code=400, detail="Sensor not connected")
    return session.read()


def get_all_sensor_data():
    data, errs = {}, {}
    for name, session in state.sessions.items():
        try:
            data[name] = session.read()
        except Exception as exc:
            errs[name] = str(exc)
    return {"data": data, "errors": errs or None}


def get_session_by_identifier(identifier: str) -> AntSession:
    session = state.sessions.get(identifier)
    if session:
        return session

    sensor_match: Optional[Sensor] = state.last_discovered.get(identifier)
    if sensor_match is None:
        sensor_match = next(
            (sensor for sensor in state.last_discovered.values() if sensor.pretty == identifier),
            None,
        )

    if sensor_match:
        session = _session_for_sensor_id(sensor_match.id)
        if session:
            return session

    try:
        device_id = int(identifier)
    except ValueError:
        device_id = None

    if device_id is not None:
        session = _session_for_sensor_id(device_id)
        if session:
            return session

    raise HTTPException(status_code=400, detail="Sensor not connected")
