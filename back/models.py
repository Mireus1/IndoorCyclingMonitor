from pydantic import BaseModel


class Sensor(BaseModel):
    name: str
    id: int
    type: int
    trans: int
    pretty: str
