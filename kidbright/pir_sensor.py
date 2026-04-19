from machine import Pin
import time
import network
import json
import os
try:
    import ntptime
except ImportError:
    print("ntptime module not found. Time sync will fail.")

from umqtt.robust import MQTTClient
from kidbright.config import WIFI_SSID, WIFI_PASS, WIFI_SSID_2, WIFI_PASS_2, MQTT_BROKER, MQTT_USER, MQTT_PASS

# Configuration
BIN_ID = "checkbin_02"
TOPIC = b"b6710545989/checkbin/activity" 
BACKUP_FILE = "offline_data.jsonl"

# Hardware Setup
red_led = Pin(2, Pin.OUT, value=1)
green_led = Pin(12, Pin.OUT, value=1)
pir_sensor = Pin(35, Pin.IN)
wlan = network.WLAN(network.STA_IF)

# State Variables
time_synced = False

# --- Boot: force clear any auto-connected network from flash ---
wlan.active(False)
time.sleep(1.5)
wlan.active(True)
time.sleep(1.0)

def connect_wifi():
    if not wlan.isconnected():
        # Reset radio to clear any bad internal state before reconnecting
        wlan.active(False)
        time.sleep(1.0)
        wlan.active(True)
        time.sleep(0.5)
        for ssid, password in [(WIFI_SSID, WIFI_PASS), (WIFI_SSID_2, WIFI_PASS_2)]:
            print("Trying WiFi: {}".format(ssid))
            red_led.value(0)
            try:
                wlan.connect(ssid, password)
            except OSError as e:
                print("Connect error on {}: {}".format(ssid, e))
                wlan.active(False)
                time.sleep(1.0)
                wlan.active(True)
                time.sleep(0.5)
                continue
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
    # Standard Unix epoch starts at 1970-01-01. The difference is 946684800 seconds.
    if time_synced:
        return time.time() + 946684800
    return None

def save_offline(payload):
    try:
        # Append the payload as a new line in the backup file
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

    print("Found offline data! Forwarding to database...")
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
            # Rewrite only the records that failed
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
            print("Offline data successfully forwarded and cleared.")
    except Exception as e:
        print("Error processing backups:", e)

# --- Main Program ---
print("Starting Activity Sensor...")
sync_time() # Try to get the real time on boot

print("Armed. Waiting for motion...")
idle_ticks = 0

while True:
    if pir_sensor.value() == 1:
        print("Motion detected!")
        green_led.value(0) 
        
        # Build payload with timestamp
        payload = {
            "bin_id": BIN_ID,
            "timestamp": get_unix_timestamp() # Will be None if never synced
        }
        
        if connect_wifi():
            # Retry NTP sync here if it failed at boot
            if not time_synced:
                sync_time()
                payload["timestamp"] = get_unix_timestamp()

            client = MQTTClient(client_id="b6710545989_pir_02",
                                server=MQTT_BROKER, user=MQTT_USER, password=MQTT_PASS, keepalive=60)
            try:
                client.connect()
                
                # Check for and send any old data first
                process_backups(client)
                
                # Send the current data
                client.publish(TOPIC, json.dumps(payload).encode('utf-8'))
                time.sleep(0.5)
                print("Successfully Published Activity!")
                
            except Exception as e:
                print("MQTT failed, saving locally:", e)
                save_offline(payload)
                red_led.value(0)
            finally:
                try:
                    client.disconnect()
                except Exception:
                    pass
        else:
            print("No WiFi, saving locally.")
            save_offline(payload)
                
        # Hardware Cooldown
        time.sleep(4)
        green_led.value(1)
        red_led.value(1)
        idle_ticks = 0
        
    else:
        # Heartbeat logic
        idle_ticks += 1
        if idle_ticks >= 4:
            green_led.value(0)
            time.sleep(0.05)
            green_led.value(1)
            idle_ticks = 0
            time.sleep(0.45)
        else:
            time.sleep(0.5)
