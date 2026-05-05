# SmartFire IoT System - Complete Documentation

## 📑 Documentation Map

```
iot-sfd/
├── README.md                    ← START HERE (project overview)
├── PROJECT_PLAN.md              ← Architecture & data flow
├── SETUP_GUIDE.md               ← Quick start instructions
├── INTEGRATION_GUIDE.md         ← Detailed integration steps
├── FEATURES.md                  ← This file (features reference)
│
├── smart-fire-detector.cpp      # Original code
├── hardware-firebase/
│   └── smart-fire-detector-firebase.cpp
│
└── website-project/
    ├── src/...
    ├── README.md
    ├── .env.example
    └── package.json
```

---

## 🎯 Quick Summary

**SmartFire** adalah sistem fire detection IoT dengan:

- **Hardware**: ESP32 + 4 sensors
- **Database**: Firebase Realtime Database
- **Frontend**: React + TypeScript
- **Real-time**: WebSocket via Firebase

**3 komponen utama**:

1. **Hardware** (ESP32) → Send sensor data
2. **Database** (Firebase) → Store & sync data
3. **Website** (React) → Real-time dashboard

---

## 🌟 5 Main Features

### 1️⃣ Overview - Dashboard Utama

**Tampilan**: Real-time status overview

- **Status Cards**:
  - Current Status (NORMAL/ALERT)
  - Last Fire Detected
  - Pump State
  - Water Level

- **Charts**:
  - Temperature & Humidity time-series (last 10 min)

- **System Health**:
  - Device Online/Offline
  - Uptime
  - Signal Strength
  - Firmware Version

- **Recent Activity**:
  - Last 5 events
  - Event type icons
  - Timestamps

**Update Frequency**: Real-time (instant)

### 2️⃣ Live Monitor - Real-time Sensor Detail

**Tampilan**: Detailed individual sensor readings

- **Main Sensors Grid**: 4 large cards
  - Temperature (°C)
  - Humidity (%)
  - Water Level (cm)
  - Flame Sensor (CLEAR/DETECTED)

- **Detailed Cards**: 6 additional cards
  - Temperature details + status
  - Humidity details + status
  - Water Level (distance + volume)
  - Flame Sensor status
  - Pump State
  - Servo Position

- **Zone Info**: "Warehouse A"
- **Last Update**: Timestamp

**Update Frequency**: Real-time (instant)

### 3️⃣ History - Trend Analysis

**Tampilan**: Historical data dengan analysis

- **Stats Cards**: 3 cards
  - Average Temperature (24h)
  - Average Humidity (24h)
  - Total Pump Runtime

- **Time Period Selector**: 24h / 7d / 30d / 90d

- **Charts**: Multi-sensor time-series
  - Temperature line
  - Humidity line
  - Water Level line
  - 7 data points (untuk 24h display)

- **Statistics**: 4 cards
  - Max Temperature
  - Min Temperature
  - Fire Incidents
  - System Uptime

**Update Frequency**: Every hour (batched)

### 4️⃣ Event Log - Activity History

**Tampilan**: Searchable event table

- **Search Bar**: Filter events
- **Filter Tabs**: By event type
  - All
  - FIRE_DETECTED
  - WATER_LEVEL_LOW
  - PUMP_ACTIVATED
  - PUMP_DEACTIVATED

- **Table Columns**:
  - Timestamp (date + time)
  - Event Type (with icon)
  - Status (NORMAL/ALERT/WARNING badge)
  - Details (description)
  - Source (device ID)

- **Export**: Download CSV button
- **Show Count**: "Showing X of Y events"

**Update Frequency**: Real-time (new events)

### 5️⃣ Settings - System Configuration

**Tampilan**: Configuration panel

- **Automated Suppression Section**:
  - Spray Duration (5-60 seconds)
  - Cooldown Period (60-600 seconds)
  - Water Level Threshold (5-20 cm)
  - Telemetry Interval (1-60 seconds)
  - Save Changes button

- **Danger Zone Section**:
  - Restart Device button (dengan warning modal)
  - Reset to Defaults button (dengan warning modal)

- **Modal Dialogs**:
  - Confirm action required
  - Warning message
  - Cancel/Confirm buttons

**Update Frequency**: On-demand (manual save)

---

## 📡 Data Sensors

### DHT22 (Temperature & Humidity)

- **Range**: -10 to +50°C (Temp), 0-100% (Humidity)
- **Accuracy**: ±0.5°C, ±2%
- **Read Rate**: Every 5 seconds
- **Pin**: GPIO 4

### IR Flame Detector

- **Detection Range**: ~100cm
- **Output**: HIGH (fire) / LOW (no fire)
- **Read Rate**: Every 5 seconds (with debounce 500ms)
- **Pin**: GPIO 34

### Ultrasonic Sensor (Water Level)

- **Range**: 2-400cm
- **Accuracy**: ±3cm
- **Read Rate**: Every 5 seconds
- **Pins**: TRIG (GPIO 5), ECHO (GPIO 18)
- **Calculation**: Distance → Water Height → Volume

### Relay (Water Pump)

- **Control**: Digital ON/OFF
- **Pin**: GPIO 22
- **Activation**: When flame detected
- **Duration**: Configurable (default 15s)

### Servo Motor (Sprayer Direction)

- **Range**: 0-180°
- **Control**: PWM
- **Pin**: GPIO 26
- **Behavior**: Sweep when normal, stop when alert
- **Speed**: 50Hz, sweep every 50ms

---

## 🔄 Real-time Architecture

### Data Flow

```
Hardware Layer
├─ Read Sensors (DHT22, Flame, Ultrasonic)
├─ Process Data (debounce, calculate volume)
└─ Send to Firebase

Firebase Layer
├─ /sensors/current (update immediately)
├─ /events/{timestamp} (new events)
├─ /settings/automation (configuration)
└─ /systemHealth (heartbeat)

Website Layer
├─ Subscribe to /sensors/current
├─ Subscribe to /events
├─ Subscribe to /settings
├─ Subscribe to /systemHealth
└─ Render Real-time UI
```

### Firebase Listener Pattern

```typescript
// useFirebaseListener hook
const { data, loading, error } = useFirebaseListener(
  subscribeSensorData,
  initialValue,
);

// Auto-unsubscribe on unmount
// Real-time updates trigger state change
// Component re-renders automatically
```

### Event Types

- `FIRE_DETECTED`: Flame detected
- `WATER_LEVEL_LOW`: Below threshold
- `PUMP_ACTIVATED`: Pump started
- `PUMP_DEACTIVATED`: Pump stopped
- `FIRE_CLEARED`: Fire alert cleared
- `MANUAL_TRIGGER`: Manual pump trigger
- `RESTART_REQUEST`: Device restart
- Custom events

---

## 🎨 UI Components

### Shared Components

**StatCard**

```tsx
<StatCard
  title="Temperature"
  value={29.1}
  unit="°C"
  icon={<Thermometer />}
  status="normal" | "warning" | "danger"
  trend={2.4} // optional
/>
```

**StatusBadge**

```tsx
<StatusBadge status="NORMAL" label="Optimal" />
// Colors: NORMAL (green), ALERT (red), WARNING (yellow)
```

**HealthCard**

```tsx
<HealthCard
  icon={<Activity />}
  label="Status"
  value="Device Online"
  status="online" | "offline" | "good" | "warning"
/>
```

### Layout Components

**Sidebar Navigation**

- Auto-collapse on mobile
- Active page highlight
- Device info footer

**Top Bar**

- Toggle sidebar button
- User profile area
- Responsive

---

## 🔐 Security Model

### Development

- Firebase rules: Public (allow all)
- No authentication required

### Production

```json
{
  "rules": {
    "sensors": {
      ".read": "auth != null",
      ".write": "auth.uid == 'ESP32_UID'"
    }
  }
}
```

---

## 📊 Database Schema

```
/device
  ├─ id: string (ESP32-WH-01-21)
  ├─ zone: string (Warehouse A)
  ├─ lastUpdate: number (timestamp)
  ├─ online: boolean
  └─ firmwareVersion: string (v2.4.1-stable)

/sensors/current
  ├─ temperature: number (°C)
  ├─ humidity: number (%)
  ├─ waterLevel: number (cm)
  ├─ waterVolume: number (mL)
  ├─ flameSensor: string (CLEAR|DETECTED)
  ├─ pumpState: string (ON|IDLE)
  ├─ servoPosition: number (0-180)
  └─ timestamp: number

/sensors/history/{timestamp}
  ├─ temperature: number
  ├─ humidity: number
  ├─ waterLevel: number
  └─ timestamp: number

/events/{timestamp}
  ├─ type: string (event type)
  ├─ status: string (NORMAL|ALERT|WARNING)
  ├─ details: string (description)
  ├─ source: string (device ID)
  └─ timestamp: number

/settings/automation
  ├─ sprayDuration: number (seconds)
  ├─ cooldownPeriod: number (seconds)
  ├─ waterLevelThreshold: number (cm)
  └─ telemetryInterval: number (seconds)

/systemHealth
  ├─ status: string (ONLINE|OFFLINE)
  ├─ uptime: number (milliseconds)
  ├─ signalStrength: number (dBm)
  └─ lastHeartbeat: number (timestamp)
```

---

## 🚀 Getting Started

### Quick Start (5 minutes)

1. **Setup Firebase**

   ```bash
   # Go to firebase.console.google.com
   # Create project "smartfire"
   # Enable Realtime Database
   # Copy database URL
   ```

2. **Configure Hardware**

   ```cpp
   // Edit smart-fire-detector-firebase.cpp
   #define WIFI_SSID "YOUR_SSID"
   #define FIREBASE_DATABASE_URL "YOUR_URL"
   // Upload to ESP32
   ```

3. **Setup Website**

   ```bash
   cd website-project
   npm install
   cp .env.example .env
   # Edit .env with Firebase credentials
   npm run dev
   ```

4. **Verify Connection**
   ```
   - Check Firebase console untuk sensor data
   - Open http://localhost:3000
   - Lihat data real-time di Overview
   ```

---

## 📱 Responsive Design

- **Mobile** (< 640px): Stacked layout, full-width cards
- **Tablet** (640-1024px): 2-column grid
- **Desktop** (> 1024px): 4-column grid with sidebar

---

## 🎯 Performance Metrics

- **Initial Load**: < 2 seconds
- **Data Update**: < 100ms
- **Chart Re-render**: < 500ms
- **Event Search**: < 50ms
- **Sidebar Toggle**: < 200ms

---

## 📝 Future Features

- [ ] Mobile app (React Native)
- [ ] SMS/Email alerts
- [ ] Advanced analytics
- [ ] Machine learning prediction
- [ ] Multi-device support
- [ ] Custom dashboards
- [ ] API gateway
- [ ] Cloud backup

---

## 🎓 Code Examples

### Subscribe to Sensor Data

```typescript
import { useFirebaseListener } from './hooks/useFirebaseListener'
import { subscribeSensorData } from './services/firebase'

function MyComponent() {
  const { data, loading, error } = useFirebaseListener(
    subscribeSensorData,
    null
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      Temperature: {data?.temperature}°C
    </div>
  )
}
```

### Update Settings

```typescript
import { updateSetting } from "./services/firebase";

async function changeDuration(newDuration: number) {
  try {
    await updateSetting("automation/sprayDuration", newDuration);
  } catch (error) {
    console.error("Failed to update:", error);
  }
}
```

### Create Event

```typescript
import { createEvent } from "./services/firebase";

async function logEvent() {
  await createEvent({
    type: "MANUAL_PUMP_TRIGGER",
    status: "NORMAL",
    details: "Manual trigger from dashboard",
    source: "WEB_DASHBOARD",
    timestamp: Date.now(),
  });
}
```

---

## ✅ Testing Checklist

- [ ] ESP32 WiFi connects
- [ ] Hardware sends to Firebase
- [ ] Website receives real-time data
- [ ] Overview page shows data
- [ ] Live Monitor updates instantly
- [ ] History loads data
- [ ] Event Log filters work
- [ ] Settings editable
- [ ] Responsive on mobile
- [ ] No console errors

---

## 🆘 Common Issues

| Issue             | Solution                         |
| ----------------- | -------------------------------- |
| No sensor data    | Check ESP32 WiFi, Firebase URL   |
| Website blank     | Check .env file, browser console |
| Delayed updates   | Check Firebase rules, network    |
| Wrong temperature | Check DHT22 sensor wiring        |
| No events logged  | Check flame sensor, debounce     |

---

## 📞 Support Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **React Docs**: https://react.dev
- **Recharts**: https://recharts.org
- **Tailwind**: https://tailwindcss.com

---

## 📄 Files Reference

| File                                       | Purpose                 |
| ------------------------------------------ | ----------------------- |
| `README.md`                                | Project overview        |
| `PROJECT_PLAN.md`                          | Architecture & planning |
| `SETUP_GUIDE.md`                           | Quick start guide       |
| `INTEGRATION_GUIDE.md`                     | Detailed setup          |
| `FEATURES.md`                              | This file               |
| `smart-fire-detector-firebase.cpp`         | Hardware code           |
| `website-project/src/App.tsx`              | Main app component      |
| `website-project/src/services/firebase.ts` | Firebase integration    |

---

**Created**: 2024
**Version**: 1.0.0
**Status**: Complete and Ready
