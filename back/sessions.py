from typing import Optional

from fastapi import HTTPException
from models import Sensor
from openant.devices.heart_rate import HeartRateData


class AntSession:
    def __init__(self, dev, sensor: Optional[Sensor] = None):
        self.dev = dev
        self.sensor = sensor
        self.sensor_id = getattr(sensor, "id", None)
        self.sensor_name = getattr(sensor, "name", None)
        self.sensor_pretty = getattr(sensor, "pretty", None)
        self.last_data: Optional[dict] = None
        dev.on_device_data = self._on_data

    def _on_data(self, device, page_name, data):
        if isinstance(data, HeartRateData) or hasattr(data, "heart_rate"):
            self.last_data = {"heart_rate": data.heart_rate}
        elif hasattr(data, "instantaneous_power"):
            self.last_data = {
                "power": data.instantaneous_power,
                "cadence": getattr(data, "cadence", None),
            }
        else:
            self.last_data = data.__dict__

    def connect(self):
        self.dev.open_channel()

    def read(self):
        if self.last_data is None:
            raise HTTPException(status_code=500, detail="No data yet")
        return self.last_data

    def close(self):
        try:
            self.dev.close_channel()
        except Exception:
            pass
