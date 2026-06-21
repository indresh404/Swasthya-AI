# Smartwatch Risk Agent

## Role

Pulls heart rate, SpO2, and BP data from connected wearables and compares each reading against the patient's own historical baseline — not a generic population average — to detect meaningful anomalies, which are then fed into the same health graph as self-reported symptoms.

## Why It Exists

The most useful early-warning signals often happen quietly, between check-ins, where no one is watching. A resting heart rate that's been gradually climbing for several nights is exactly the kind of pattern a patient wouldn't think to mention — because they haven't noticed it themselves. This agent exists to catch that pattern before the patient has to.

## How It Works

1. The app connects to the patient's wearable data source via Google Health Connect (Android) or Apple Health (iOS).
2. Readings (heart rate, SpO2, BP) sync in at regular intervals.
3. The agent maintains a **personal rolling baseline** for each patient — not a fixed clinical threshold — so what counts as "anomalous" is calibrated to that individual's normal range.
4. When a reading deviates meaningfully from the patient's own baseline, it's flagged and written into the graph, connected to the relevant body zone (e.g. a heart-rate anomaly connects to the chest/heart zone, affecting the body heatmap).
5. The flag is also passed to the Check-In Agent, which can generate a directly relevant follow-up question — about chest comfort or breathlessness — in the patient's next check-in.

## Example Flow

```
Wearable syncs: resting heart rate elevated 3 nights running
        ↓
Compared against patient's own 14-day rolling baseline → anomaly detected
        ↓
Flag written to graph, linked to chest/heart zone
        ↓
Check-In Agent generates: "Have you noticed any chest discomfort
or shortness of breath the past couple of nights?"
```

## What It Writes

| Data | Destination |
|---|---|
| Anomaly flags | Neo4j (linked to relevant body zone) |
| Raw vitals history | Supabase |

## Used By

- **Check-In Agent** — for generating relevant follow-up questions
- **3D Body Heatmap** — anomalies contribute to zone highlighting even without a self-reported symptom
- **Explanation Agent** — wearable anomalies combined with reported symptoms produce stronger, more specific explanations than either signal alone
