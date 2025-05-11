# main.py
import threading
import time
from typing import Dict, List

from fastapi import FastAPI, HTTPException
from openant.devices import ANTPLUS_NETWORK_KEY
from openant.devices.common import DeviceType
from openant.devices.heart_rate import HeartRate, HeartRateData
from openant.devices.scanner import Scanner
from openant.devices.utilities import auto_create_device
from openant.easy.node import Node
from pydantic import BaseModel

app = FastAPI()

# ——— NEW: store last discovery here ———
last_discovered: Dict[str, "Sensor"] = {}

class Sensor(BaseModel):
    name: str    # unique key: "<Type>_<Trans>_<ID>"
    id: int
    type: int
    trans: int
    pretty: str

class AntSession:
    def __init__(self, node: Node, dev):
        self.node = node
        self.dev = dev
        self.last_data = None
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
        t = threading.Thread(target=self.node.start, daemon=True)
        t.start()

    def read(self):
        if self.last_data is None:
            raise HTTPException(500, detail="No data yet")
        return self.last_data

    def close(self):
        try:
            self.dev.close_channel()
        finally:
            self.node.stop()


sessions: Dict[str, AntSession] = {}


def scan_once(timeout: float = 5.0) -> List[Sensor]:
    found: List[Sensor] = []
    node = Node()
    node.set_network_key(0x00, ANTPLUS_NETWORK_KEY)
    scanner = Scanner(node, device_id=0, device_type=0)

    def on_found(t):
        dev_id, dev_type, dev_trans = t
        key = f"{DeviceType(dev_type).name}_{dev_trans}_{dev_id}"
        pretty = f"{DeviceType(dev_type).name}:{dev_id}"
        s = Sensor(name=key, id=dev_id, type=dev_type, trans=dev_trans, pretty=pretty)
        if not any(x.name == key for x in found):
            found.append(s)
            print(f"[scan] found {s.pretty} → key={key}")

    scanner.on_found = on_found

    t = threading.Thread(target=node.start, daemon=True)
    t.start()
    time.sleep(timeout)

    scanner.close_channel()
    node.stop()
    t.join(timeout=1.0)
    print(f"[scan] complete: {len(found)} sensor(s)")
    return found


@app.get("/sensors", response_model=List[Sensor])
def list_sensors():
    global last_discovered
    sensors = scan_once(5.0)
    # update our lookup dict
    last_discovered = {s.name: s for s in sensors}
    return sensors


@app.post("/sensors/{sensor_name}/connect")
def connect_sensor(sensor_name: str):
    # use last_discovered instead of rescanning
    info = last_discovered.get(sensor_name)
    if not info:
        raise HTTPException(status_code=404, detail="Sensor not in last scan; please call GET /sensors first")

    node = Node()
    node.set_network_key(0x00, ANTPLUS_NETWORK_KEY)

    # choose the right class
    if info.type == DeviceType.HeartRate.value:
        dev = HeartRate(node, device_id=info.id)
    else:
        dev = auto_create_device(node, info.id, info.type, info.trans)

    session = AntSession(node, dev)
    session.connect()
    sessions[sensor_name] = session
    return {"status": "connected", "sensor": info.pretty}


@app.get("/sensors/{sensor_name}/data")
def get_sensor_data(sensor_name: str):
    session = sessions.get(sensor_name)
    if not session:
        raise HTTPException(status_code=400, detail="Sensor not connected")
    return session.read()
