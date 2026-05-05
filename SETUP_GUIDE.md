# SmartFire IoT System - Setup Guide

## 📋 Project Structure

```
iot-sfd/
├── smart-fire-detector.cpp                 # Original hardware code
├── PROJECT_PLAN.md                         # Project planning document
├── hardware-firebase/
│   └── smart-fire-detector-firebase.cpp   # Hardware code with Firebase
├── website-project/                        # Frontend React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   ├── Overview/
│   │   │   ├── LiveMonitor/
│   │   │   ├── History/
│   │   │   ├── EventLog/
│   │   │   ├── Settings/
│   │   │   └── Shared/
│   │   ├── services/
│   │   │   └── firebase.ts              # Firebase integration
│   │   ├── hooks/
│   │   │   └── useFirebaseListener.ts   # Real-time listeners
│   │   ├── types/
│   │   │   └── index.ts                 # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
```

## 🚀 Quick Start

### 1. Firebase Setup

Buat Firebase project:

1. Pergi ke [Firebase Console](https://console.firebase.google.com)
2. Buat project baru: "SmartFire"
3. Enable Realtime Database
4. Buat database di lokasi yang dekat

```json
{
  "device": {
    "id": "ESP32-WH-01-21",
    "zone": "Warehouse A",
    "lastUpdate": 0,
    "online": false,
    "firmwareVersion": "v2.4.1-stable"
  },
  "sensors": {
    "current": {
      "temperature": 0,
      "humidity": 0,
      "waterLevel": 0,
      "waterVolume": 0,
      "flameSensor": "CLEAR",
      "pumpState": "IDLE",
      "servoPosition": 0,
      "timestamp": 0
    },
    "history": {}
  },
  "events": {},
  "settings": {
    "automation": {
      "sprayDuration": 15,
      "cooldownPeriod": 300,
      "waterLevelThreshold": 10,
      "telemetryInterval": 5
    }
  },
  "systemHealth": {
    "status": "OFFLINE",
    "uptime": 0,
    "signalStrength": 0,
    "lastHeartbeat": 0
  }
}
```

### 2. Hardware Setup (ESP32)

Update file: `hardware-firebase/smart-fire-detector-firebase.cpp`

```cpp
// Line 8-10 - WiFi Config
#define WIFI_SSID "YOUR_SSID"
#define WIFI_PASSWORD "YOUR_PASSWORD"

// Line 13-17 - Firebase Config
#define FIREBASE_API_KEY "YOUR_API_KEY"
#define FIREBASE_DATABASE_URL "https://YOUR_PROJECT.firebaseio.com"
#define FIREBASE_USER_EMAIL "YOUR_EMAIL"
#define FIREBASE_USER_PASSWORD "YOUR_PASSWORD"
```

Upload ke ESP32:

1. Install Arduino IDE
2. Install ESP32 board package
3. Install Firebase Library: `Firebase Arduino Client Library`
4. Select Board: "ESP32 Dev Module"
5. Upload code

### 3. Frontend Setup

```bash
cd website-project

# Install dependencies
npm install

# Setup Firebase credentials
# Create .env file:
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://YOUR_PROJECT.firebaseio.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID

# Run development server
npm run dev

# Build for production
npm run build
```

## 🌐 Real-time Data Flow

### Hardware → Firebase (Every 5 seconds)

```
ESP32 reads sensors
    ↓
POST /sensors/current
    ↓
Firebase updates in real-time
    ↓
Website listeners triggered
    ↓
UI updates automatically
```

### Event Creation

```
Fire detected (HIGH signal)
    ↓
Debounce 500ms
    ↓
POST /events/{timestamp}
    ↓
Create event record with details
    ↓
Trigger pump activation
    ↓
Website shows notification
```

## 📱 Features

### 1. **Overview**

- Real-time status cards (Temperature, Humidity, Water Level, Flame Status)
- Temperature & Humidity time-series chart
- System health indicators
- Recent activity log

### 2. **Live Monitor**

- Individual sensor detail cards
- Current readings with status
- Sensor-specific information
- Real-time updates

### 3. **History**

- 24-hour historical data
- Multi-sensor time-series chart
- Statistical analysis (min/max/avg)
- System performance metrics

### 4. **Event Log**

- Searchable event table
- Filter by event type
- Status indicators
- Export to CSV (feature ready)

### 5. **Settings**

- Configurable parameters:
  - Spray Duration
  - Cooldown Period
  - Water Level Threshold
  - Telemetry Interval
- Device management:
  - Restart Device
  - Reset to Defaults

## 🔐 Security Notes

- Use environment variables untuk credentials
- Jangan commit `.env` file
- Aktifkan Firebase Security Rules
- Use authentication untuk production

## 📊 Firebase Structure

```
/device
  ├─ id: "ESP32-WH-01-21"
  ├─ zone: "Warehouse A"
  ├─ lastUpdate: timestamp
  ├─ online: boolean
  └─ firmwareVersion: "v2.4.1-stable"

/sensors/current
  ├─ temperature: 29.1
  ├─ humidity: 69.5
  ├─ waterLevel: 48.7
  ├─ waterVolume: 2847.5
  ├─ flameSensor: "CLEAR" | "DETECTED"
  ├─ pumpState: "ON" | "IDLE"
  ├─ servoPosition: 90
  └─ timestamp: 1704067200000

/events/{timestamp}
  ├─ type: "FIRE_DETECTED"
  ├─ status: "NORMAL" | "ALERT"
  ├─ details: "..."
  ├─ source: "ESP32-WH-01-21"
  └─ timestamp: 1704067200000

/settings/automation
  ├─ sprayDuration: 15
  ├─ cooldownPeriod: 300
  ├─ waterLevelThreshold: 10
  └─ telemetryInterval: 5
```

## 🐛 Troubleshooting

### ESP32 tidak connect ke WiFi

- Check SSID dan password
- Verify WiFi frequency (2.4 GHz only)
- Check signal strength

### Firebase connection error

- Verify API key dan database URL
- Check Firebase rules (set to public untuk development)
- Verify internet connection pada ESP32

### Website tidak update real-time

- Check Firebase listener di console
- Verify database rules allow read/write
- Check browser console untuk errors

## 📝 Next Steps

1. ✅ Setup Firebase project
2. ✅ Configure ESP32 WiFi credentials
3. ✅ Upload hardware code
4. ✅ Install frontend dependencies
5. ✅ Add Firebase credentials di `.env`
6. ✅ Run dev server
7. ✅ Monitor real-time data

## 🎯 Usage Tips

- **Overview**: Quick status check
- **Live Monitor**: Detailed real-time readings
- **History**: Trend analysis
- **Event Log**: Troubleshooting
- **Settings**: System configuration
