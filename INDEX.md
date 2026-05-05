# SmartFire IoT System - Master Guide 🔥

**Complete IoT Fire Detection System with Real-time Web Dashboard**

---

## 🚦 Where to Start?

### For First-Time Setup

1. **Read This First**: [README.md](./website-project/README.md)
2. **Quick Setup**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
3. **Detailed Steps**: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
4. **All Features**: [FEATURES.md](./FEATURES.md)

### For Developers

1. **Architecture**: [PROJECT_PLAN.md](./PROJECT_PLAN.md)
2. **Code Structure**: `website-project/` folder
3. **API Reference**: `website-project/src/services/firebase.ts`
4. **Components**: `website-project/src/components/`

### For DevOps/Deployment

1. **Integration Guide**: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Part 5
2. **Check Deployment Options**
3. **Setup CI/CD pipeline**

---

## 📋 Project Structure

```
iot-sfd/
│
├── Documentation/
│   ├── README.md ..................... Project overview
│   ├── PROJECT_PLAN.md ............... Architecture & data flow
│   ├── SETUP_GUIDE.md ................ Quick start (30 min)
│   ├── INTEGRATION_GUIDE.md .......... Complete step-by-step
│   ├── FEATURES.md ................... Feature reference
│   └── INDEX.md ...................... This file
│
├── Hardware/
│   ├── smart-fire-detector.cpp ....... Original code
│   └── hardware-firebase/
│       └── smart-fire-detector-firebase.cpp ... Firebase version
│
└── Website/
    └── website-project/
        ├── src/
        │   ├── components/
        │   │   ├── Layout/ ........... Sidebar & navigation
        │   │   ├── Overview/ ......... Dashboard page
        │   │   ├── LiveMonitor/ ...... Real-time sensor page
        │   │   ├── History/ .......... Analytics page
        │   │   ├── EventLog/ ......... Events page
        │   │   ├── Settings/ ......... Configuration page
        │   │   └── Shared/ ........... Reusable components
        │   ├── services/
        │   │   └── firebase.ts ....... Firebase integration
        │   ├── hooks/
        │   │   └── useFirebaseListener.ts ... Real-time hooks
        │   ├── types/
        │   │   └── index.ts .......... TypeScript types
        │   ├── App.tsx ............... Main app
        │   └── index.css ............. Global styles
        ├── .env.example .............. Environment template
        ├── package.json .............. Dependencies
        ├── vite.config.ts ............ Vite config
        ├── tsconfig.json ............. TypeScript config
        └── README.md ................. Frontend guide
```

---

## ⚡ Quick Commands

### Hardware (ESP32)

```bash
# 1. Install Arduino IDE
# 2. Add ESP32 board package
# 3. Install Firebase library
# 4. Update WiFi & Firebase credentials in code
# 5. Upload to ESP32
```

### Frontend

```bash
cd website-project

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Firebase credentials

# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

---

## 🎯 5 Main Features

### 1. Overview

- Real-time status dashboard
- Temperature & humidity charts
- System health indicators
- Recent activity log
- **Access**: Click "Overview" in sidebar

### 2. Live Monitor

- Individual sensor details
- Current readings with status
- Sensor-specific information
- Real-time updates
- **Access**: Click "Live Monitor" in sidebar

### 3. History

- 24-hour historical data
- Multi-sensor time-series chart
- Statistical analysis
- Multiple time periods (24h, 7d, 30d, 90d)
- **Access**: Click "History" in sidebar

### 4. Event Log

- Searchable event table
- Filter by event type
- Status indicators
- Export to CSV
- **Access**: Click "Event Log" in sidebar

### 5. Settings

- Configure spray duration
- Cooldown period
- Water level threshold
- Telemetry interval
- Device restart & reset
- **Access**: Click "Settings" in sidebar

---

## 🔄 How It Works

```
1. ESP32 reads sensors (every 5 seconds)
   ├─ Temperature & Humidity (DHT22)
   ├─ Flame Detection (IR Sensor)
   ├─ Water Level (Ultrasonic)
   └─ Pump & Servo State

2. Sends data to Firebase
   └─ Updates /sensors/current

3. Website listens for updates
   └─ Real-time via WebSocket

4. Dashboard updates automatically
   └─ No page refresh needed

5. Events are logged
   └─ Searchable history
```

---

## 📊 Real-time Data Flow

```
Hardware Layer
  └─ ESP32 with Sensors
     ├─ DHT22 (Temperature/Humidity)
     ├─ IR Flame Detector
     ├─ Ultrasonic (Water Level)
     ├─ Relay (Pump Control)
     └─ Servo (Sprayer Direction)

Firebase Layer (Real-time Database)
  ├─ /sensors/current → Live sensor readings
  ├─ /events → System events log
  ├─ /settings → Configuration
  ├─ /device → Device info
  └─ /systemHealth → Heartbeat

Website Layer (React + TypeScript)
  ├─ Overview Page
  ├─ Live Monitor Page
  ├─ History Page (with Charts)
  ├─ Event Log Page
  └─ Settings Page
```

---

## 🔐 Security

### Development

- Firebase rules: Public (for testing)
- No authentication

### Production (Before Deploy)

- Enable Firebase authentication
- Set proper security rules
- Use environment variables
- HTTPS only
- Regular security audits

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Part 6 for details.

---

## 🚀 Getting Started (Step-by-step)

### Phase 1: Firebase Setup (10 min)

1. Create Firebase project at firebase.google.com
2. Enable Realtime Database
3. Copy database URL
4. Import initial data structure
5. Set rules to public (development)

**Documentation**: [INTEGRATION_GUIDE.md - Part 1](./INTEGRATION_GUIDE.md#part-1-firebase-setup)

### Phase 2: Hardware Setup (20 min)

1. Install Arduino IDE
2. Add ESP32 board package
3. Install Firebase library
4. Update WiFi & Firebase credentials
5. Upload code to ESP32
6. Verify data in Firebase

**Documentation**: [INTEGRATION_GUIDE.md - Part 2](./INTEGRATION_GUIDE.md#part-2-hardware-esp32-setup)

### Phase 3: Frontend Setup (10 min)

1. Install Node.js
2. Navigate to website-project
3. Run `npm install`
4. Setup `.env` file with Firebase credentials
5. Run `npm run dev`
6. Open http://localhost:3000

**Documentation**: [INTEGRATION_GUIDE.md - Part 3](./INTEGRATION_GUIDE.md#part-3-frontend-react-setup)

### Phase 4: Testing (10 min)

1. Check ESP32 connected to WiFi
2. Verify Firebase has sensor data
3. Check website showing real-time data
4. Test event logging
5. Test settings update

**Documentation**: [INTEGRATION_GUIDE.md - Part 4](./INTEGRATION_GUIDE.md#part-4-integration-testing)

### Phase 5: Deployment (Optional)

1. Build production: `npm run build`
2. Deploy to Vercel, Firebase Hosting, atau GitHub Pages
3. Setup environment variables
4. Configure security rules for production

**Documentation**: [INTEGRATION_GUIDE.md - Part 5](./INTEGRATION_GUIDE.md#part-5-deployment)

---

## 💡 Key Technologies

| Layer        | Technology            | Purpose                |
| ------------ | --------------------- | ---------------------- |
| **Hardware** | ESP32 + Arduino       | Sensor data collection |
| **Database** | Firebase Realtime DB  | Real-time data sync    |
| **Frontend** | React 18 + TypeScript | Web dashboard          |
| **Styling**  | Tailwind CSS          | UI design              |
| **Charts**   | Recharts              | Data visualization     |
| **Icons**    | Lucide React          | UI icons               |
| **Build**    | Vite                  | Fast bundling          |

---

## 📱 Responsive Design

- **Mobile**: Optimized for small screens
- **Tablet**: 2-column layout
- **Desktop**: Full 4-column grid with sidebar

All pages responsive across devices.

---

## 🎓 Code Examples

### Real-time Sensor Listener

```typescript
import { useFirebaseListener } from './hooks/useFirebaseListener'
import { subscribeSensorData } from './services/firebase'

function Dashboard() {
  const { data: sensors, loading } = useFirebaseListener(
    subscribeSensorData,
    null
  )

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p>Temperature: {sensors?.temperature}°C</p>
      )}
    </div>
  )
}
```

### Update Settings

```typescript
import { updateSetting } from "./services/firebase";

async function changeDuration(newValue: number) {
  await updateSetting("automation/sprayDuration", newValue);
  // Changes sync to all users automatically
}
```

---

## 🆘 Troubleshooting

### Common Issues

**Q: ESP32 tidak connect ke WiFi**

```
A:
1. Check SSID spelling
2. Verify WiFi is 2.4GHz (not 5GHz)
3. Check password correct
4. Move ESP32 closer to router
```

**Q: Website shows no data**

```
A:
1. Check .env file has correct Firebase credentials
2. Verify ESP32 sending data (check Firebase console)
3. Check browser console untuk errors
4. Verify Firebase rules allow read access
```

**Q: Real-time updates not working**

```
A:
1. Check Firebase connection in browser Network tab
2. Verify WebSocket connection established
3. Clear browser cache and reload
4. Check console untuk any JavaScript errors
```

See [INTEGRATION_GUIDE.md - Part 6](./INTEGRATION_GUIDE.md#troubleshooting) for complete troubleshooting guide.

---

## 📊 Monitoring

### Daily

- Check ESP32 online status
- Verify sensor data valid
- Check for errors in logs

### Weekly

- Review Firebase usage
- Check disk space
- Update if needed

### Monthly

- Archive old events
- Clean up database
- Security audit

---

## 🎯 Next Steps

1. **Clone/Download** project
2. **Read**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
3. **Follow**: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
4. **Configure**: Hardware & Firebase
5. **Run**: Frontend development server
6. **Test**: All 5 features
7. **Deploy**: When ready

---

## 📞 Support

### Documentation Files

- **Overview**: README.md
- **Architecture**: PROJECT_PLAN.md
- **Setup**: SETUP_GUIDE.md
- **Integration**: INTEGRATION_GUIDE.md
- **Features**: FEATURES.md

### External Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [ESP32 Arduino Guide](https://docs.espressif.com/projects/arduino-esp32)
- [Recharts Library](https://recharts.org)

### For Issues

1. Check troubleshooting section
2. Review console errors
3. Verify configurations
4. Check Firebase logs
5. Restart device/app

---

## 📄 Document Guide

| Document                 | Read Time | Purpose                     |
| ------------------------ | --------- | --------------------------- |
| **README.md**            | 5 min     | Project overview & features |
| **PROJECT_PLAN.md**      | 10 min    | Architecture & planning     |
| **SETUP_GUIDE.md**       | 15 min    | Quick 30-minute setup       |
| **INTEGRATION_GUIDE.md** | 45 min    | Complete detailed guide     |
| **FEATURES.md**          | 20 min    | Feature reference           |
| **INDEX.md**             | 5 min     | This file                   |

**Recommended Reading Order**:

1. README.md
2. SETUP_GUIDE.md
3. INTEGRATION_GUIDE.md
4. FEATURES.md

---

## 🎉 You're Ready!

Everything is set up and documented. Choose your starting point above and follow the step-by-step guides.

**Happy coding!** 🚀

---

**Project Status**: Complete and Ready to Use
**Last Updated**: 2024
**Version**: 1.0.0
