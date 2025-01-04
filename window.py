import random
import time
from time import sleep

import streamlit as st
from stqdm import stqdm

# Set page configuration
st.set_page_config(page_title="Indoor Cycling Monitor", layout="wide")

# Sidebar for Cycling Power Zones
st.sidebar.title("Cycling Power Zones")

# Define the cycling zones
cycling_zones = [
    {"zone": "Active Recovery", "power": "<55% FTP", "duration": 1},
    {"zone": "Endurance", "power": "56-75% FTP", "duration": 1},
    {"zone": "Tempo", "power": "76-90% FTP", "duration": 1},
    {"zone": "Lactate Threshold", "power": "91-105% FTP", "duration": 1},
    {"zone": "VO2 Max", "power": "106-120% FTP", "duration": 1},
    {"zone": "Anaerobic Capacity", "power": ">121% FTP", "duration": 1},
]

# Display zones in the sidebar
for zone in cycling_zones:
    st.sidebar.write(f"**{zone['zone']}**: {zone['power']} (Duration: {zone['duration']} min)")

# Main timer display
st.title("Cycling Power Zone Timer")

# User instructions
st.write("Follow the cycling power zones listed on the left. Use the timer below to guide your intervals.")

# Dropdown to select the zone
selected_zone = st.selectbox(
    "Select a workout:",
    [zone["zone"] for zone in cycling_zones]
)

# Get the duration of the selected zone
selected_duration = next(zone["duration"] for zone in cycling_zones if zone["zone"] == selected_zone)

# Timer logic
if st.button("Start Workout"):
    total_seconds = selected_duration * 60

    step_placeholder = st.empty()

    timer_placeholder = st.empty()

    # Create the columns for the other metrics
    cols = st.columns(3)
    heart_rate_placeholder = cols[0].empty()
    power_placeholder = cols[1].empty()
    cadence_placeholder = cols[2].empty()

    # Countdown timer
    for remaining in range(total_seconds, -1, -1):
        step_display = 'Hold 200 watts for 1 min'
        step_placeholder.markdown(f"<h1 style='text-align: center; font-size: 55px; color: #FFFFF;'>{step_display}</h1>", unsafe_allow_html=True)
        # Update the timer display
        minutes, seconds = divmod(remaining, 60)
        timer_display = f"{minutes:02d}:{seconds:02d}"
        timer_placeholder.markdown(f"<h2 style='text-align: center; font-size: 50px; color: #FF5733;'>{timer_display}</h2>", unsafe_allow_html=True)

        # Update the dynamic metrics
        heart_rate = random.randint(60, 120)
        power = random.randint(100, 400)
        cadence = random.randint(70, 120)

        with heart_rate_placeholder:
            st.metric(label="Heart Rate (BPM)", value=heart_rate, delta=random.randint(-5, 5))

        with power_placeholder:
            st.metric(label="Power (Watts)", value=power, delta=random.randint(-10, 10))

        with cadence_placeholder:
            st.metric(label="Cadence (RPM)", value=cadence, delta=random.randint(-3, 3))

        time.sleep(1)

    st.success("Workout complete!")