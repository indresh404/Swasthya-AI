# Expo Track

**Requirement:** The application must be built using Expo (React Native). Core functionality should run within the Expo ecosystem. A working mobile demo must be provided (APK, Expo Go link, or equivalent).

---

## How Swasthya AI Meets This

The entire patient-facing application — onboarding, voice chatbot, daily check-ins, 3D body heatmap, medicine tracker with conflict checking, family QR system, government scheme matching, and appointment booking — is built natively in **React Native using Expo**, TypeScript, and Expo Router for navigation.

There is no separate native iOS/Android codebase outside the Expo ecosystem. Platform-specific capabilities (camera for document scanning, wearable health data via Google Health Connect / Apple Health, push notifications) are all integrated through Expo's managed workflow and config plugins, not custom native modules that would break Expo compatibility.

---

## What Runs Inside Expo

| Capability | Expo Integration |
|---|---|
| Navigation | Expo Router (file-based routing: `(auth)`, `(onboarding)`, `(tabs)`) |
| Voice I/O | Audio capture/playback via Expo APIs, piped to Sarvam AI |
| 3D Body Heatmap | Three.js + GLB model rendered inside an Expo WebView |
| Camera / Document Scan | Expo Camera, used by the Medical Scan Agent for income certificate capture |
| Wearable Data | Google Health Connect / Apple HealthKit, bridged through Expo-compatible modules |
| Push Notifications | Expo Notifications, for check-in reminders and doctor Q&A responses |
| Build & Distribution | EAS (Expo Application Services) for APK builds |

---

## Why This Matters for the Product

Expo isn't incidental — it's what makes the voice-first, low-friction onboarding actually deliverable to real patients. A managed workflow means the app can be distributed as a single APK or Expo Go link without patients needing a Play Store account or a complex install process, which matters directly for the accessibility goal at the center of the product.

---

## Demo

Mobile demo: *(APK / Expo Go link to be added before submission)*
