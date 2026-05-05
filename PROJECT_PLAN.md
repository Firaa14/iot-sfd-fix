# SmartFire IoT System - Project Plan

## 📱 Sistem Overview

```
ESP32 Hardware
    ↓
    ├─ Temperature/Humidity (DHT22)
    ├─ Flame Detection (IR Sensor)
    ├─ Water Level (Ultrasonic)
    ├─ Relay (Water Pump)
    └─ Servo (Sprayer Direction)

    ↓ WiFi

Firebase Realtime Database
    ├─ /sensors/current (real-time sensor values)
    ├─ /events (event log)
    ├─ /settings (system configuration)
    └─ /history (time-series data)

    ↓ Real-time Sync

Website Dashboard (React)
    ├─ Overview (real-time status)
    ├─ Live Monitor (sensor updates)
    ├─ History (charts & analysis)
    ├─ Event Log (event history)
    └─ Settings (configuration)
```

## 🗄️ Firebase Realtime Database Schema

```json
{
  "device": {
    "id": "ESP32-WH-01-21",
    "zone": "Warehouse A",
    "lastUpdate": 1704067200000,
    "online": true,
    "firmwareVersion": "v2.4.1-stable"
  },
  "sensors": {
    "current": {
      "temperature": 29.1,
      "humidity": 69.5,
      "waterLevel": 48.7,
      "waterVolume": 2847.5,
      "flameSensor": "CLEAR",
      "pumpState": "IDLE",
      "servoPosition": 90,
      "timestamp": 1704067200000
    },
    "history": {
      "2024-01-01T16:50:00Z": {
        "temperature": 29.0,
        "humidity": 69.4,
        "waterLevel": 49.0,
        "timestamp": 1704067200000
      }
    }
  },
  "events": {
    "event1": {
      "type": "FIRE_DETECTED",
      "status": "NORMAL",
      "details": "Automatic system response triggered",
      "source": "ESP32-WH-01-21",
      "timestamp": 1704067200000
    }
  },
  "settings": {
    "automation": {
      "sprayDuration": 15,
      "cooldownPeriod": 300,
      "waterLevelThreshold": 10,
      "telemetryInterval": 5
    }
  },
  "systemHealth": {
    "status": "ONLINE",
    "uptime": 123456789,
    "signalStrength": -65,
    "lastHeartbeat": 1704067200000
  }
}
```

## 📊 Data Flow

### Hardware → Firebase

1. ESP32 membaca sensor setiap 5 detik
2. Update `/sensors/current` dengan real-time values
3. Setiap event (fire, water low) = insert ke `/events`
4. Setiap jam = archive history ke `/sensors/history`

### Firebase → Website

1. Website listener on `/sensors/current` → Live update
2. Website listener on `/events` → Real-time notifications
3. Query `/sensors/history` → Chart rendering
4. Query `/settings` → Load configuration

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Database**: Firebase Realtime Database
- **Real-time**: Firebase SDK (onValue listener)
- **Charts**: Chart.js atau Recharts
- **Icons**: Lucide React
- **Build**: Vite

## 📋 Component Structure

```
website-project/
├── src/
│   ├── components/
│   │   ├── Overview/
│   │   │   ├── StatusCard.tsx
│   │   │   ├── TemperatureChart.tsx
│   │   │   ├── SystemHealth.tsx
│   │   │   └── Overview.tsx
│   │   ├── LiveMonitor/
│   │   ├── History/
│   │   ├── EventLog/
│   │   ├── Settings/
│   │   └── Layout/
│   ├── hooks/
│   │   └── useFirebaseListener.ts
│   ├── services/
│   │   └── firebase.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## 🔄 Next Steps

1. ✅ Setup Firebase project & schema
2. ✅ Modify hardware code untuk Firebase integration
3. ✅ Create React project structure
4. ✅ Implement real-time listeners
5. ✅ Build 5 main features
6. ✅ Styling sesuai design
