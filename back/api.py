from typing import List

from erg_service import set_erg_mode
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import Sensor
from node_manager import start_node
from sensor_service import (connect_sensor, get_all_sensor_data,
                            get_sensor_data, scan_sensors)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "null"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    start_node()

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/sensors", response_model=List[Sensor])
def list_sensors():
    return scan_sensors(5.0)


@app.post("/sensors/{sensor_name}/connect")
def connect_sensor_endpoint(sensor_name: str):
    result = connect_sensor(sensor_name)
    sensor_info = result["sensor"]
    return {
        "status": "connected",
        "sensor": sensor_info.pretty,
        "channel": result["channel"],
    }


@app.get("/sensors/{sensor_name}/data")
def get_sensor_data_endpoint(sensor_name: str):
    return get_sensor_data(sensor_name)


@app.get("/sensors/data")
def get_all_sensor_data_endpoint():
    return get_all_sensor_data()


@app.post("/sensors/{sensor_identifier}/erg/{target_watts}")
def set_erg_mode_endpoint(sensor_identifier: str, target_watts: int):
    return set_erg_mode(sensor_identifier, target_watts)
