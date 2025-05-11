import threading

from openant.easy.channel import Channel
from openant.easy.node import Node

available_sensors = {}  # device_id -> sensor info
connected_sensors = {}  # device_id -> Channel

node = Node()
node.start()

def scan_sensors():
    scan_channel = node.new_channel(Channel.Type.BIDIRECTIONAL_RECEIVE)
    scan_channel.set_period(8192)  # Default
    scan_channel.set_search_timeout(255)
    scan_channel.set_rf_freq(57)
    scan_channel.set_id(0, 0, 0)  # Wildcard

    def on_data(data):
        device_id = scan_channel.device_id.device_number
        device_type = scan_channel.device_id.device_type
        available_sensors[device_id] = {
            "device_id": device_id,
            "device_type": device_type,
        }

    scan_channel.on_broadcast_data = on_data
    scan_channel.open()

def connect_to_sensor(device_id: int):
    if device_id in connected_sensors:
        return {"status": "already connected"}

    channel = node.new_channel(Channel.Type.BIDIRECTIONAL_RECEIVE)
    channel.set_period(8070)
    channel.set_search_timeout(255)
    channel.set_rf_freq(57)

    def on_data(data):
        # Do something with the data
        print(f"Data from {device_id}: {data}")

    channel.on_broadcast_data = on_data
    channel.set_id(device_id, 0, 0)  # Wildcard device type/transmission type
    channel.open()

    connected_sensors[device_id] = channel
    return {"status": "connected", "device_id": device_id}
