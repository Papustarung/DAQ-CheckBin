from machine import I2C, Pin
import time
import network
import json
import os
try:
    import ntptime
except ImportError:
    print("ntptime module not found. Time sync will fail.")

import vl53l0x
from umqtt.robust import MQTTClient
from kidbright.config import WIFI_SSID, WIFI_PASS, WIFI_SSID_2, WIFI_PASS_2, MQTT_BROKER, MQTT_USER, MQTT_PASS

# Configuration
BIN_ID = "checkbin_02"
TOPIC = b"b6710545989/checkbin/tof"
BACKUP_FILE = "tof_offline.jsonl"
PUBLISH_INTERVAL_MS = 600_000  # 10 minutes

# Hardware Setup
red_led = Pin(2, Pin.OUT, value=1)
green_led = Pin(12, Pin.OUT, value=1)
i2c = I2C(0, scl=Pin(5), sda=Pin(4))
wlan = network.WLAN(network.STA_IF)

# --- Boot: force clear any auto-connected network from flash ---
wlan.active(False)
time.sleep(1.5)
wlan.active(True)
time.sleep(1.0)

# State Variables
time_synced = False

def connect_wifi():
    if not wlan.isconnected():
        for ssid, password in [(WIFI_SSID, WIFI_PASS), (WIFI_SSID_2, WIFI_PASS_2)]:
            print("Trying WiFi: {}".format(ssid))
            red_led.value(0)
            wlan.connect(ssid, password)
            timeout = 0
            while not wlan.isconnected() and timeout < 20:
                time.sleep(0.5)
                timeout += 1
            if wlan.isconnected():
                print("Connected to {}".format(ssid))
                break
            else:
                print("Failed: {}".format(ssid))
                wlan.disconnect()
                time.sleep(1)

    if wlan.isconnected():
        red_led.value(1)
        return True
    return False

def sync_time():
    global time_synced
    if connect_wifi():
        ntptime.timeout = 10
        # Try public NTP first, fall back to KU's server (in case UDP 123 is blocked externally)
        for host in ["ntp.ku.ac.th", "time.cloudflare.com", "pool.ntp.org"]:
            ntptime.host = host
            for attempt in range(2):
                try:
                    ntptime.settime()
                    time_synced = True
                    print("NTP synced via {}".format(host))
                    return
                except Exception as e:
                    print("NTP {} attempt {} failed: {}".format(host, attempt + 1, e))
                    time.sleep(2)
        print("NTP Sync gave up after all servers.")

def get_unix_timestamp():
    # MicroPython ESP32 epoch starts at 2000-01-01.
    # Standard Unix epoch starts at 1970-01-01. Difference is 946684800 seconds.
    if time_synced:
        return time.time() + 946684800
    return None

def save_offline(payload):
    try:
        with open(BACKUP_FILE, "a") as f:
            f.write(json.dumps(payload) + "\n")
        print("-> Saved to local backup file.")
    except Exception as e:
        print("-> Failed to save locally:", e)

def process_backups(client):
    TEMP_FILE = BACKUP_FILE + ".tmp"
    try:
        os.stat(BACKUP_FILE)
    except OSError:
        return  # No backup file, nothing to do

    print("Found offline data! Forwarding...")
    failed_lines = []
    try:
        with open(BACKUP_FILE, "r") as f:
            for line in f:
                data = line.strip()
                if not data:
                    continue
                try:
                    client.publish(TOPIC, data.encode('utf-8'))
                    time.sleep(0.1)
                except Exception as e:
                    print("Backup publish failed, keeping record:", e)
                    failed_lines.append(line)

        if failed_lines:
            with open(TEMP_FILE, "w") as f:
                for line in failed_lines:
                    f.write(line)
            try:
                os.remove(BACKUP_FILE)
            except OSError:
                pass
            os.rename(TEMP_FILE, BACKUP_FILE)
            print("Partial backup forwarded. {} record(s) kept.".format(len(failed_lines)))
        else:
            os.remove(BACKUP_FILE)
            print("Offline data forwarded and cleared.")
    except Exception as e:
        print("Error processing backups:", e)

# --- Main Program ---
print("Starting ToF Distance Sensor...")
sync_time()

print("Initializing VL53L0X...")
sensor = vl53l0x.VL53L0X(i2c)
print("VL53L0X ready.")

print("Running. Publishing every 10 minutes.")
# ticks_add with negative offset so the first reading fires immediately
last_publish = time.ticks_add(time.ticks_ms(), -PUBLISH_INTERVAL_MS)

while True:
    if time.ticks_diff(time.ticks_ms(), last_publish) >= PUBLISH_INTERVAL_MS:
        last_publish = time.ticks_ms()

        # Read sensor
        try:
            distance_mm = sensor.read()
        except Exception as e:
            print("Sensor read error:", e)
            time.sleep(5)
            continue

        if distance_mm > 2000:
            distance_cm = None
            print("Sensor: out of range")
        else:
            distance_cm = round(distance_mm / 10.0, 1)
            print("Distance: {} cm".format(distance_cm))

        payload = {
            "bin_id": BIN_ID,
            "distance_cm": distance_cm,
            "recorded_at": get_unix_timestamp()
        }

        if connect_wifi():
            if not time_synced:
                sync_time()
                payload["recorded_at"] = get_unix_timestamp()

            green_led.value(0)
            client = MQTTClient(client_id="b6710545989_tof_02",
                                server=MQTT_BROKER, user=MQTT_USER, password=MQTT_PASS, keepalive=60)
            try:
                client.connect()
                process_backups(client)
                client.publish(TOPIC, json.dumps(payload).encode('utf-8'))
                time.sleep(0.5)
                print("Published!")
            except Exception as e:
                print("MQTT failed, saving locally:", e)
                save_offline(payload)
                red_led.value(0)
            finally:
                try:
                    client.disconnect()
                except Exception:
                    pass
            green_led.value(1)
            red_led.value(1)
        else:
            print("No WiFi, saving locally.")
            save_offline(payload)

    time.sleep(1)
