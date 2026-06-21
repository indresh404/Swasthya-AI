# Smartwatch / Wearable Tracking

## What It Is

Continuous vitals monitoring — heart rate, SpO2, and blood pressure — pulled from a patient's connected wearable (via Google Health Connect or Apple Health) and fed into the same health graph as self-reported symptoms, so a wearable anomaly can prompt a relevant check-in question before the patient even notices something is off.

## The Problem It Solves

Most of a patient's meaningful health signal happens *between* check-ins, not during them. A resting heart rate that's been creeping up for several nights, or a sleep pattern that's degraded, is a real clinical signal — but if nothing is watching for it, it goes completely unnoticed until the patient happens to mention feeling unwell, by which point the early window for catching it has often passed.

## How It Works

1. The app connects to the patient's wearable data source (Google Health Connect on Android, Apple Health on iOS).
2. Heart rate, SpO2, and BP readings sync into the system at regular intervals.
3. The **Smartwatch Risk Agent** compares incoming readings against the patient's own historical baseline — not a generic population average — to detect meaningful deviation.
4. Anomalies are written into the health graph the same way a self-reported symptom would be, connected to the relevant body zone (e.g. a cardiac anomaly connects to the chest/heart zone on the body heatmap).
5. A flagged anomaly can directly shape the next check-in: if resting heart rate has been elevated, the Check-In Agent will generate a question about chest comfort or breathlessness — without the patient bringing it up first.

## Why This Connects to the Graph, Not a Separate Dashboard

A wearable reading on its own is just a number. Connected into the same graph as the patient's reported symptoms and family history, it becomes part of the same reasoning the rest of the system uses — a cardiac anomaly combined with a family history of heart disease (via the Family Genetics Agent) is a meaningfully different signal than the same anomaly in isolation, and the graph is what makes that combination visible.

## What's Tracked

| Metric | Source |
|---|---|
| Heart rate (resting / active) | Google Health Connect / Apple Health |
| SpO2 | Google Health Connect / Apple Health |
| Blood pressure | Manual entry or connected BP-capable wearable |

## Agent Responsible

**Smartwatch Risk Agent** — ingests wearable data, compares against personal baseline, and writes flagged anomalies into the graph for use by the Check-In Agent and Explanation Agent.
