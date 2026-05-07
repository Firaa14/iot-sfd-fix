# SmartFire - IoT Fire Detection System

Complete IoT fire detection system with real-time monitoring web dashboard.

## 🎯 Features

### 5 Main Dashboard Pages

1. **Overview** - Main dashboard with real-time status
   - Status cards (Temperature, Humidity, Water Level, Flame)
   - Temperature & Humidity chart
   - System health indicators
   - Recent activity log

2. **Live Monitor** - Real-time sensor monitoring
   - Individual sensor detail cards
   - Current readings with status
   - Sensor-specific information
   - Auto-update on every change

3. **History** - Historical data analysis
   - Time-series chart for 24 hours
   - Statistical analysis (min/max/avg)
   - Multiple time period selectors
   - System performance metrics

4. **Event Log** - System event history
   - Searchable event table
   - Filter by event type
   - Status indicators
   - Export CSV

5. **Settings** - System configuration
   - Automated suppression parameters
   - Device management
   - Factory reset option

## 🛠️ Technology Stack

### Hardware

- **Board**: ESP32 Dev Module
- **Sensors**:
  - DHT22 (Temperature & Humidity)
  - IR Flame Detector
  - Ultrasonic (Water Level)
- **Actuators**:
  - Relay (Water Pump)
  - Servo Motor (Sprayer)

### Backend

- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Real-time**: Firebase SDK

### Frontend

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📋 Hardware Specifications

```
Pins Configuration:
- Pin 22: Relay (Pump Control)
- Pin 26: Servo (Sprayer Direction)
- Pin 34: Flame Sensor (Input)
- Pin 5: Ultrasonic TRIG
- Pin 18: Ultrasonic ECHO
- Pin 4: DHT22 (Data)

Sensor Readings (Every 5 seconds):
- Temperature: -10°C to 50°C
- Humidity: 0% to 100%
- Water Level: 0-12cm (calculated)
- Water Volume: 0-2827mL (cylindrical bottle)
```

## 📊 Data Flow

```
┌─────────────┐
│   ESP32     │
│  + Sensors  │
└──────┬──────┘
       │ WiFi (JSON)
       ↓
┌──────────────────────┐
│ Firebase Realtime    │
│ Database             │
│ ├─ sensors/current   │
│ ├─ events            │
│ ├─ settings          │
│ ├─ device            │
│ └─ systemHealth      │
└──────┬───────────────┘
       │ WebSocket (Real-time)
       ↓
┌──────────────────────┐
│  React Dashboard     │
│  ├─ Overview         │
│  ├─ Live Monitor     │
│  ├─ History          │
│  ├─ Event Log        │
│  └─ Settings         │
└──────────────────────┘
```

## 🚀 Quick Start

### 1. Firebase Setup

```bash
# 1. Create Firebase project
# - Go to console.firebase.google.com
# - Create new project "SmartFire"
# - Enable Realtime Database
# - Copy database URL

# 2. Initialize database structure
# Use the JSON from SETUP_GUIDE.md
```

### 2. Hardware Setup

```bash
# 1. Update credentials in smart-fire-detector-firebase.cpp
#    Lines 8-17: WiFi & Firebase config

# 2. Install libraries in Arduino IDE:
#    - ESP32 Board Package
#    - Firebase Arduino Client Library

# 3. Upload to ESP32
```

### 3. Frontend Setup

```bash
cd website-project

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with Firebase credentials

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
iot-sfd/
├── smart-fire-detector.cpp              # Original code
├── PROJECT_PLAN.md                      # Architecture & planning
├── SETUP_GUIDE.md                       # Detailed setup instructions
├── README.md                            # This file
│
├── hardware-firebase/
│   └── smart-fire-detector-firebase.cpp # Firebase-integrated code
│
└── website-project/
    ├── src/
    │   ├── components/
    │   │   ├── Layout/
    │   │   │   └── Layout.tsx
    │   │   ├── Overview/
    │   │   │   └── Overview.tsx
    │   │   ├── LiveMonitor/
    │   │   │   └── LiveMonitor.tsx
    │   │   ├── History/
    │   │   │   └── History.tsx
    │   │   ├── EventLog/
    │   │   │   └── EventLog.tsx
    │   │   ├── Settings/
    │   │   │   └── Settings.tsx
    │   │   └── Shared/
    │   │       └── Cards.tsx
    │   ├── services/
    │   │   └── firebase.ts
    │   ├── hooks/
    │   │   └── useFirebaseListener.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

## 🔄 Real-time Sync

### Firebase Listeners (Active Connections)

```typescript
// Sensor data - update setiap perubahan
subscribeSensorData(callback);

// Events - tambahan event baru
subscribeEvents(callback);

// Settings - perubahan konfigurasi
subscribeSettings(callback);

// Device info - status device
subscribeDeviceInfo(callback);

// System health - uptime & signal
subscribeSystemHealth(callback);
```

### Hardware Data Push (Setiap 5 detik)

```cpp
POST /sensors/current
{
  "temperature": 29.1,
  "humidity": 69.5,
  "waterLevel": 48.7,
  "waterVolume": 2847.5,
  "flameSensor": "CLEAR",
  "pumpState": "IDLE",
  "servoPosition": 90,
  "timestamp": 1704067200000
}
```

## 🎨 UI Design

Dashboard design sesuai dengan SmartFire Warehouse System:

- **Color Scheme**: Dark blue/slate dengan accent red
- **Responsive**: Mobile, tablet, desktop
- **Real-time**: Auto-update tanpa refresh
- **Icons**: Lucide React
- **Charts**: Recharts dengan real-time data

## 🔐 Security

### Development

- Firebase rules: Allow read/write (untuk testing)
- No authentication required

### Production

- Enable Firebase authentication
- Set proper security rules
- Use environment variables untuk secrets
- HTTPS only
- Rate limiting

## 📱 Responsive Breakpoints

```
Mobile:   < 640px
Tablet:   640px - 1024px
Desktop:  > 1024px
```

## ⚙️ Configuration Parameters

```javascript
// Automated Suppression Settings
{
  sprayDuration: 15,          // seconds
  cooldownPeriod: 300,        // seconds (5 minutes)
  waterLevelThreshold: 10,    // cm
  telemetryInterval: 5        // seconds
}
```

## 🐛 Troubleshooting

### ESP32 WiFi tidak connect

- Cek SSID dan password
- Verify 2.4GHz frequency
- Check signal strength

### Firebase tidak sync

- Verify API key dan database URL
- Check database rules
- Verify device online status

### Website tidak update

- Check browser console
- Verify Firebase listener
- Check network tab

## 📝 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Multi-device support
- [ ] Machine learning untuk predictive alerts
- [ ] Integration dengan alarm system
- [ ] SMS/Email notifications
- [ ] API untuk third-party integration
- [ ] Advanced analytics
- [ ] Cloud storage untuk history

## 📄 License

MIT

## 👨‍💻 Support

Untuk pertanyaan atau issues, silahkan open GitHub issue.

---

**Created**: 2024
**Status**: Active
**Maintained**: Yes
