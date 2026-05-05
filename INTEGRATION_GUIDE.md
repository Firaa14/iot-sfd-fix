# SmartFire - Integration Guide

## 📚 Lengkap Integration Overview

Panduan lengkap untuk mengintegrasikan semua komponen IoT system.

---

## Part 1: Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Project name: `smartfire` (or your choice)
4. Enable Google Analytics (optional)
5. Create project

### Step 2: Enable Realtime Database

1. In Firebase Console, go to `Realtime Database`
2. Click "Create Database"
3. Select region (choose closest to your location)
4. Start in **Test Mode** (for development)
5. Click "Enable"

### Step 3: Get Firebase Credentials

1. Go to `Project Settings` (gear icon)
2. Go to `Service Accounts` tab
3. Click `Database Secrets`
4. Copy the database URL: `https://YOUR_PROJECT.firebaseio.com`

For Web App credentials:

1. Click `Your apps` section
2. Click `Create app` → `Web`
3. Register app
4. Copy the firebaseConfig

### Step 4: Initialize Database Structure

In Realtime Database, import this JSON:

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

### Step 5: Configure Firebase Rules (Development)

Go to `Realtime Database` → `Rules` tab:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ WARNING**: Hanya untuk development. Untuk production, setup proper authentication.

---

## Part 2: Hardware (ESP32) Setup

### Prerequisites

1. Arduino IDE ([Download](https://www.arduino.cc/en/software))
2. ESP32 Board Package
3. USB Cable untuk upload
4. Firefox/Chrome untuk serial monitor

### Step 1: Install ESP32 Board

1. Open Arduino IDE
2. File → Preferences
3. Paste in "Additional Boards Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Tools → Board Manager
5. Search "ESP32"
6. Install "ESP32 by Espressif Systems"

### Step 2: Install Firebase Library

1. Sketch → Include Library → Manage Libraries
2. Search "Firebase Arduino Client"
3. Install "Firebase Arduino Client Library for ESP32" by Mobizt

### Step 3: Configure Hardware Code

Open `hardware-firebase/smart-fire-detector-firebase.cpp`

Update these lines:

**Lines 8-10: WiFi Configuration**

```cpp
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
```

**Lines 13-17: Firebase Configuration**

```cpp
#define FIREBASE_API_KEY "YOUR_FIREBASE_API_KEY"
#define FIREBASE_DATABASE_URL "https://YOUR_PROJECT.firebaseio.com"
#define FIREBASE_USER_EMAIL "your-email@gmail.com"
#define FIREBASE_USER_PASSWORD "your-password"
```

To get Firebase credentials:

1. Go to Firebase Console → Project Settings
2. Web App section → Copy config
3. Extract API Key dari config

### Step 4: Upload to ESP32

1. Connect ESP32 via USB
2. Tools → Board → Select "ESP32 Dev Module"
3. Tools → Port → Select COM port
4. Sketch → Upload
5. Open Serial Monitor (Tools → Serial Monitor)
6. Set baud rate to 115200
7. Watch for logs

Expected output:

```
========== SMARTFIRE SYSTEM STARTING ==========
Hardware initialized...
Connecting to WiFi: YOUR_SSID
✓ WiFi connected!
IP address: 192.168.1.XXX
Setting up Firebase...
✓ Firebase initialized!
```

### Step 5: Verify Data in Firebase

1. Open Firebase Console → Realtime Database
2. Check `/sensors/current` - harus ada data sensor
3. Check `/device/lastUpdate` - harus update setiap 5 detik
4. Check `/events` - buat event test manual

---

## Part 3: Frontend (React) Setup

### Prerequisites

1. Node.js 18+ ([Download](https://nodejs.org))
2. npm atau yarn
3. Code editor (VS Code recommended)
4. Git (optional)

### Step 1: Setup Project

```bash
# Navigate ke folder
cd website-project

# Install dependencies
npm install
```

### Step 2: Configure Firebase Credentials

Create `.env` file di `website-project/`:

```bash
# Copy from template
cp .env.example .env

# Edit .env
```

Content of `.env`:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://YOUR_PROJECT.firebaseio.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

Get these from Firebase Console → Project Settings → Your apps

### Step 3: Run Development Server

```bash
# Start dev server (runs on port 3000)
npm run dev

# Output:
# VITE v5.0.0  ready in 123 ms
# ➜  Local:   http://localhost:3000/
# ➜  press h to show help
```

Open `http://localhost:3000` di browser

### Step 4: Verify Real-time Connection

1. Go to Overview page
2. Lihat apakah sensor data loading
3. Ubah data di Firebase console
4. Lihat update real-time di dashboard

---

## Part 4: Integration Testing

### Checklist

- [ ] ESP32 connected ke WiFi
- [ ] ESP32 sending data ke Firebase
- [ ] Website connected ke Firebase
- [ ] Sensor data visible di Overview
- [ ] Real-time update working
- [ ] Events logging working
- [ ] Settings editable

### Test Scenarios

#### Test 1: Real-time Sensor Update

```
1. Upload hardware code ke ESP32
2. Open Firebase console → sensors/current
3. Wait untuk data muncul
4. Check website Overview - harus ada data
5. Sensor values harus update setiap 5 detik
```

#### Test 2: Event Logging

```
1. Trigger flame sensor (hold near ir sensor)
2. Check Firebase console → events
3. New event harus created
4. Website Event Log harus menampilkan event
5. Overview harus menampilkan di Recent Activity
```

#### Test 3: Live Monitor

```
1. Go to Live Monitor page
2. Check semua sensor cards
3. Change value di Firebase console
4. Website harus update instantly
5. Test dengan different data
```

#### Test 4: Settings

```
1. Go to Settings page
2. Change spray duration ke 20
3. Click "Save Changes"
4. Go ke Firebase → settings/automation
5. Value harus berubah
```

---

## Part 5: Deployment

### Option 1: Deploy ke Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd website-project
vercel

# Answers:
# - Project name: smartfire
# - Directory: ./
# - Build command: npm run build
# - Output directory: dist
```

### Option 2: Deploy ke Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
npm run build
firebase deploy
```

### Option 3: Deploy ke GitHub Pages

```bash
# Update vite.config.ts
export default {
  base: '/iot-sfd/',
  // ... rest of config
}

# Build
npm run build

# Deploy to gh-pages branch
```

### Environment Variables di Production

1. Set environment variables di hosting platform
2. Copy dari `.env.example`
3. Jangan expose credentials

---

## Part 6: Monitoring & Maintenance

### Daily Checks

- [ ] ESP32 status online
- [ ] Sensor data valid
- [ ] No database errors
- [ ] Event log clean

### Weekly Tasks

- [ ] Check Firebase usage
- [ ] Verify disk space
- [ ] Review error logs
- [ ] Update firmware (if available)

### Monthly Tasks

- [ ] Archive old events
- [ ] Clean up database
- [ ] Update dependencies
- [ ] Security audit

---

## Troubleshooting

### ESP32 Issues

#### Problem: WiFi connection failed

```
Solution:
1. Check SSID spelling exactly
2. Verify WiFi is 2.4 GHz (not 5 GHz)
3. Verify password correct
4. Check signal strength
5. Move ESP32 closer to router
```

#### Problem: Firebase connection error

```
Solution:
1. Verify database URL correct
2. Check API key valid
3. Verify internet connection
4. Check Firebase rules (public in dev)
5. Try reboot ESP32
```

#### Problem: Sensor not reading

```
Solution:
1. Check pin numbers correct
2. Verify sensor wiring
3. Check sensor power (3.3V)
4. Test sensor independently
5. Check serial output untuk errors
```

### Website Issues

#### Problem: No data visible

```
Solution:
1. Check Firebase connection (.env correct)
2. Check browser console untuk errors
3. Verify database rules allow read
4. Check network tab untuk requests
5. Verify ESP32 sending data
```

#### Problem: Not real-time updating

```
Solution:
1. Check Firebase listener active
2. Verify WebSocket connection
3. Check browser console errors
4. Clear cache dan reload
5. Check network connection
```

#### Problem: Blank page / 404

```
Solution:
1. Check npm run build successful
2. Verify port 3000 not in use
3. Check .env file exist
4. Verify all dependencies installed
5. Try npm install again
```

---

## Performance Tips

### Hardware

- Reduce telemetry interval untuk less frequent updates
- Optimize sensor reading frequency
- Use WiFi sleep mode untuk battery (if on battery)

### Firebase

- Use indexed queries untuk faster searches
- Archive old events ke storage
- Set data retention policy

### Frontend

- Use code splitting untuk faster load
- Lazy load charts dan graphs
- Optimize image sizes

---

## Security Best Practices

### Before Production

1. **Enable Authentication**
   - Setup Firebase Auth
   - Configure login flow
   - Add user management

2. **Set Security Rules**

   ```json
   {
     "rules": {
       "sensors": {
         ".read": "auth != null",
         ".write": "auth.uid == 'ESP32_UID'"
       },
       "events": {
         ".read": "auth != null",
         ".write": false
       },
       "settings": {
         ".read": "auth != null",
         ".write": "auth != null && root.child('admin').child(auth.uid).val() == true"
       }
     }
   }
   ```

3. **Use Environment Variables**
   - Never commit .env
   - Use platform secrets
   - Rotate credentials regularly

4. **HTTPS Only**
   - Enforce HTTPS
   - Use secure cookies
   - Setup CSP headers

---

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [ESP32 Arduino Guide](https://docs.espressif.com/projects/arduino-esp32)
- [React Documentation](https://react.dev)
- [Recharts Library](https://recharts.org)
- [Tailwind CSS](https://tailwindcss.com)

---

## Support

Untuk masalah dan pertanyaan:

1. Check troubleshooting section
2. Review console errors
3. Check Firebase logs
4. Verify all configurations
5. Contact support jika perlu

---

**Last Updated**: 2024
**Version**: 1.0.0
