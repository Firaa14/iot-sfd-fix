# Smart Fire Detector (IoT-SFD)

Sistem deteksi kebakaran cerdas berbasis IoT dengan integrasi Firebase dan dashboard web real-time.

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Fitur Utama](#fitur-utama)
- [Struktur Proyek](#struktur-proyek)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Instalasi](#instalasi)
- [Penggunaan](#penggunaan)

## Gambaran Umum

Smart Fire Detector adalah solusi IoT komprehensif untuk mendeteksi dan memantau kebakaran secara real-time. Sistem terdiri dari:

1. **Hardware Controller** - Perangkat Arduino/ESP dengan sensor kebakaran yang terhubung ke Firebase
2. **Website Dashboard** - Interface web untuk monitoring dan pengaturan sistem

## Fitur Utama

- ✅ Deteksi kebakaran real-time
- ✅ Dashboard monitoring live
- ✅ Integrasi Firebase untuk cloud storage
- ✅ Riwayat events dan logging
- ✅ Pengaturan sistem yang dapat disesuaikan
- ✅ Interface responsive dan user-friendly

## Struktur Proyek

```
iot-sfd/
├── smart-fire-detector.cpp              # Kode utama mikrokontroller
├── hardware-firebase/
│   └── smart-fire-detector-firebase.cpp # Integrasi Firebase untuk hardware
└── website-project/                     # Frontend dashboard web
    ├── src/
    │   ├── auth/                        # Autentikasi pengguna
    │   ├── components/                  # React components
    │   │   ├── Auth/                    # Protected routes
    │   │   ├── DateRangePicker/         # Picker untuk range tanggal
    │   │   ├── EventLog/                # Log events
    │   │   ├── History/                 # Riwayat
    │   │   ├── LiveMonitor/             # Monitoring real-time
    │   │   ├── Login/                   # Halaman login
    │   │   ├── Navbar/                  # Navigation bar
    │   │   ├── Overview/                # Dashboard overview
    │   │   ├── Settings/                # Pengaturan sistem
    │   │   └── Shared/                  # Komponen shared
    │   ├── hooks/                       # Custom React hooks
    │   │   ├── useEventHistory.ts       # Hook untuk history events
    │   │   └── useFirebaseListener.ts   # Hook untuk Firebase listener
    │   ├── services/
    │   │   └── firebase.ts              # Firebase configuration
    │   ├── types/
    │   │   └── index.ts                 # TypeScript definitions
    │   └── utils/
    │       └── csvExport.ts             # Utility untuk export CSV
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── tailwind.config.ts
```

## Teknologi yang Digunakan

### Hardware

- **Bahasa**: C++
- **Platform**: Arduino/ESP8266/ESP32
- **Database**: Firebase Realtime Database

### Frontend

- **Framework**: React 18
- **Bahasa**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase

## Instalasi

### Prasyarat

- Node.js v16+
- npm atau yarn
- Arduino IDE (untuk programming hardware)
- Firebase account

### Setup Website

```bash
cd website-project
npm install
```

### Setup Hardware

1. Install Arduino IDE
2. Tambahkan board ESP8266/ESP32 di Board Manager
3. Compile dan upload `smart-fire-detector-firebase.cpp` ke device

## Penggunaan

### Menjalankan Development Server

```bash
cd website-project
npm run dev
```

Website akan accessible di `http://localhost:5173`

### Build untuk Production

```bash
npm run build
npm run preview
```

## Konfigurasi Firebase

Update `src/services/firebase.ts` dengan credentials Firebase Anda:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

## Features Breakdown

- **Live Monitor**: Monitor sensor kebakaran secara real-time
- **Event Log**: Pencatatan otomatis setiap events
- **History**: Melihat riwayat deteksi kebakaran dengan filter date range
- **Settings**: Konfigurasi threshold dan preferensi sistem
- **Export**: Export data ke format CSV untuk analisis lebih lanjut

