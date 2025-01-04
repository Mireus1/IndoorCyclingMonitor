import threading
import time

import streamlit as st
from openant.devices import ANTPLUS_NETWORK_KEY
from openant.devices.common import DeviceType
from openant.devices.heart_rate import HeartRate, HeartRateData
from openant.devices.power_meter import PowerData, PowerMeter
# from openant.devices.scanner import Scanner
from openant.easy.node import Node

# Streamlit app setup
st.title("Indoor Cycling Monitor")
st.write("Monitoring your metrics using ANT+ device...")

# Placeholder for displaying heart rate
heart_rate_placeholder = st.empty()

def on_scanner_found(device_tuple):
    device_id, device_type, device_trans = device_tuple
    print(
        f"Found new device #{device_id} {DeviceType(device_type)}; device_type: {device_type}, transmission_type: {device_trans}"
    )

# Function to read power
def start_power_monitor(device_id, update_queue):
    node = Node()
    node.set_network_key(0x00, ANTPLUS_NETWORK_KEY)
    device = PowerMeter(node, device_id=device_id)

    # scanner = Scanner(node, device_id=0, device_type=0)

    def on_found():
        print(f"Device {device} found and receiving")

    def on_device_data(page: int, page_name: str, data):
        print('data', data)
        if isinstance(data, PowerData):
            print('data', data.instantaneous_power)
            update_queue.append(data.instantaneous_power)

    device.on_found = on_found
    device.on_device_data = on_device_data

    # scanner.on_found = on_scanner_found

    try:
        print(f"Starting {device}, press Ctrl-C to finish")
        node.start()
    except KeyboardInterrupt:
        print("Closing ANT+ device...")
    finally:
        device.close_channel()
        # scanner.close_channel()
        node.stop()

# Function to read heart rate
def start_heart_rate_monitor(device_id, update_queue):
    node = Node()
    node.set_network_key(0x00, ANTPLUS_NETWORK_KEY)
    device = HeartRate(node, device_id=device_id)

    # scanner = Scanner(node, device_id=0, device_type=0)

    def on_found():
        print(f"Device {device} found and receiving")

    def on_device_data(page: int, page_name: str, data):
        if isinstance(data, HeartRateData):
            print('data HR', data.heart_rate)
            update_queue.append(data.heart_rate)

    device.on_found = on_found
    device.on_device_data = on_device_data

    # scanner.on_found = on_scanner_found

    try:
        print(f"Starting {device}, press Ctrl-C to finish")
        node.start()
    except KeyboardInterrupt:
        print("Closing ANT+ device...")
    finally:
        device.close_channel()
        # scanner.close_channel()
        node.stop()

# Thread-safe update mechanism
class UpdateQueue:
    def __init__(self):
        self.queue = []
        self.lock = threading.Lock()

    def append(self, value):
        with self.lock:
            self.queue.append(value)

    def get_latest(self):
        with self.lock:
            if self.queue:
                return self.queue[-1]
            return None

# Global update queue
update_queue = UpdateQueue()

# Start the heart rate monitor in a separate thread
def start_monitoring():
    device_id = 42494  # Replace with your actual device ID
    start_heart_rate_monitor(device_id, update_queue)
    start_power_monitor(7504, update_queue)

thread = threading.Thread(target=start_monitoring)
thread.daemon = True
thread.start()

# Main Streamlit update loop
while True:
    latest_heart_rate = update_queue.get_latest()
    if latest_heart_rate is not None:
        heart_rate_placeholder.write(f"Current Heart Rate: {latest_heart_rate} bpm")
    time.sleep(0.5)
