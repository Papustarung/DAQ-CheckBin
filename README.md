# CHECKBIN
## 🧍 Team Members 
Pasin Tongtip 6710545741 – Software and Knowledge Engineering, Faculty of Engineering, Kasetsart University

Amornrit Sirikham 6710545989 – Software and Knowledge Engineering, Faculty of Engineering, Kasetsart University

## Project Overview
Checkbin is an IoT-based waste bin monitoring project using KidBright32 to collect bin fill-level and nearby activity data. It combines sensor readings with survey responses and external weather data to analyze bin usage patterns and likely overflow periods. The project provides an API and dashboard for monitoring current status, trends, and simple predictive insights.

### 1️⃣ Primary data source
1. IoT sensor data

Bin fill level from HC-SR04 ultrasonic sensor
Nearby motion/activity from HC-SR501 PIR sensor

Collection method: KidBright32 reads sensor values at fixed intervals and sends timestamped data to the backend/database.

2. Survey data

* Frequency of bin use
* Whether users have seen overflow
* Cleanliness satisfaction
* Whether users avoid nearly full bins
* Preferred bin placement

Collection method: Collected through a Google Form or online questionnaire and stored in the backend for analysis.

### 2️⃣ Secondary data source
Weather data from Open-Meteo API
Used to add external context such as rainfall, temperature, and humidity, which may affect bin usage and odor conditions.

Link: [Open-Meteo API](https://open-meteo.com/en/docs)

### 3️⃣ API provided
The API will provide integrated and derived information, not just raw source data.

It will answer questions such as:
* How full is the bin right now?
* At what times is the bin used most often?
* Which periods have the highest risk of overflow?
* Do rain or humidity relate to changes in bin usage?
* Do user complaints match the actual monitored bin condition?
* When should the bin be emptied based on recent usage trends?

### 4️⃣ Sensors used
* HC-SR04 — 1x
* HC-SR501 — 1x

