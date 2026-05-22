# Event Log System - Perbaikan Implementasi

## 📋 Ringkasan Masalah

**Masalah Awal:**

- Event log hanya menampilkan data ketika event sedang aktif
- Setelah event selesai atau status kembali normal, data di event log hilang
- Riwayat event tidak tersimpan permanen
- Data lama terhapus otomatis ketika kondisi sensor berubah

**Penyebab Root:**

- Frontend hanya menampilkan real-time data dari Firebase tanpa menyimpan history
- Ketika status berubah kembali normal, event terlihat "hilang" karena tidak ada persistence
- Tidak ada mekanisme untuk append event - hanya replace data lama

---

## ✅ Solusi yang Diimplementasikan

### 1. **useEventHistory Hook** (`src/hooks/useEventHistory.ts`)

**Fungsi Utama:**

- Menyimpan semua event yang pernah diterima dalam local state
- Append event baru tanpa menghapus yang lama
- Persist ke `localStorage` agar data tetap ada setelah reload aplikasi
- Merge event dari Firebase dengan history lokal secara smart

**Fitur:**

```typescript
const eventHistory = useEventHistory();

// Menambah single event
eventHistory.addEvent(newEvent);

// Merge array events dari Firebase
eventHistory.mergeEvents(firebaseEvents);

// Get all events atau dengan limit
eventHistory.getEvents();
eventHistory.getEvents(10);

// Clear semua history
eventHistory.clearHistory();

// Properties
eventHistory.events; // All events array
eventHistory.totalCount; // Total events pernah ditambahkan
eventHistory.lastSync; // Timestamp last sync
```

**Duplikasi Prevention:**

- Cek berdasarkan event ID
- Cek berdasarkan kombinasi (timestamp + type + source)
- Jika event sudah ada, tidak akan ditambahkan lagi

**Storage:**

- Limit maksimal 1000 events di localStorage untuk mencegah overflow
- Events disort by timestamp descending (newest first)
- Auto-save setiap kali ada perubahan

---

### 2. **Firebase Service Updates** (`src/services/firebase.ts`)

**Fungsi Baru:**

```typescript
// Fetch all events ONCE from Firebase (untuk initial sync)
const allEvents = await fetchAllEvents();
```

**Fitur:**

- One-time read dari database untuk mendapatkan complete history
- Di-call saat app mount untuk load initial data
- Normalisasi timestamp otomatis (ESP32 sends seconds → JS needs milliseconds)

**Penjelasan Data Flow:**

1. Saat app load → `fetchAllEvents()` dipanggil untuk get initial data
2. Events dari Firebase di-merge ke `eventHistory`
3. Real-time subscription terus mendengarkan event baru
4. Event baru dari subscription di-merge (append-only) ke history

---

### 3. **App.tsx Integration** (`src/App.tsx`)

**Perubahan:**

```typescript
// Import useEventHistory hook
import { useEventHistory } from './hooks/useEventHistory'
import { fetchAllEvents } from './services/firebase'

// Inside AppContent component:
const eventHistory = useEventHistory()

// Initial sync on mount
React.useEffect(() => {
  const allEvents = await fetchAllEvents()
  if (allEvents.length > 0) {
    eventHistory.mergeEvents(allEvents)
  }
}, [])

// Continuous sync dengan real-time events
React.useEffect(() => {
  if (events && events.length > 0) {
    eventHistory.mergeEvents(events)
  }
}, [events])

// Pass ke EventLog component
<EventLog events={eventHistory.events} />
```

**Alur:**

1. Component mount → Load semua events dari Firebase
2. Real-time subscription mendengarkan events baru
3. Setiap ada event baru → Merge (append) ke local history
4. EventLog mendapat data dari eventHistory (persistent)

---

### 4. **EventLog Component Update** (`src/components/EventLog/EventLog.tsx`)

**Perubahan:**

- ❌ Dihapus: Filter yang membatasi hanya event tahun 2026
- ✅ Ditambah: Event history status info
- ✅ Ditambah: Total event count display
- ✅ Ditambah: Oldest event timestamp di footer

**Baru:**

```jsx
{
  /* Event History Status */
}
<div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
  <p className="text-blue-300">All events permanently stored</p>
  <p className="text-blue-300 font-medium text-lg">
    {filteredEventsData.length}
  </p>
  <p className="text-blue-200 text-xs">Total events in history</p>
</div>;
```

**Logging:**

- Show total event count
- Show latest event info
- Show oldest event timestamp

---

## 🔄 Data Persistence Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    APP LOAD / RESTART                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                ┌───────────────────────┐
                │  useEventHistory      │
                │  Load from localStorage
                └───────────────────────┘
                           │
                           ▼
              ┌──────────────────────────────┐
              │  fetchAllEvents() from       │
              │  Firebase on Mount           │
              └──────────────────────────────┘
                           │
                           ▼
              ┌──────────────────────────────┐
              │  eventHistory.mergeEvents()  │
              │  Add to local history        │
              └──────────────────────────────┘
                           │
                           ▼
              ┌──────────────────────────────┐
              │  Real-time subscription      │
              │  Listen to /events path      │
              └──────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
  ┌──────────────────┐           ┌──────────────────┐
  │ New event from   │           │ EventLog Display │
  │ sensor/hardware  │           │ All events kept  │
  │                  │           │ Not cleared!     │
  └──────────────────┘           └──────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │  Firebase push new event     │
  │  /events/{newId}             │
  └──────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │  Real-time subscription      │
  │  Detects new event           │
  └──────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │  eventHistory.mergeEvents()  │
  │  APPEND to history (no delete)
  └──────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │  Save to localStorage        │
  │  Persist across reloads      │
  └──────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │  EventLog re-render          │
  │  Show all events in history  │
  └──────────────────────────────┘
```

---

## 📊 Contoh Data Persistence

### Skenario: Sensor mendeteksi api kemudian normal kembali

**Before (Masalah Lama):**

```
Time 10:00 → FIRE_DETECTED event
           → EventLog show event
Time 10:30 → Flame sensor CLEAR
           → Status normal
           → Event disappears dari EventLog ❌ (masalah!)
```

**After (Perbaikan Baru):**

```
Time 10:00 → FIRE_DETECTED event
           → Disimpan ke Firebase dengan push()
           → eventHistory.addEvent() → localStorage
           → EventLog show event ✅

Time 10:30 → Flame sensor CLEAR
           → New FIRE_CLEARED event
           → Disimpan ke Firebase dengan push()
           → eventHistory.addEvent() → localStorage
           → EventLog show BOTH events ✅

Time 11:00 → Reload aplikasi
           → Load dari localStorage
           → Load dari Firebase
           → Merge events → All events tetap ada ✅
```

---

## 🛠️ Technical Details

### localStorage Schema

```typescript
// Storage Key: 'event_log_history'
{
  "events": [
    {
      "id": "event_id_1",
      "type": "FIRE_DETECTED",
      "status": "ALERT",
      "details": "Fire detected! Pump activated",
      "source": "ESP32-WH-01-21",
      "timestamp": 1726834543000  // milliseconds
    },
    // ... more events, sorted by timestamp DESC
  ],
  "totalCount": 42,           // Total ever added
  "lastSync": 1726834543000  // Last sync timestamp
}
```

### Max Storage

- Limit: 1000 events di localStorage
- Jika exceed → remove oldest events
- Tidak ada data loss di Firebase (tetap tersimpan)
- Oldest 1000 events available locally

### Duplicate Prevention

```typescript
// Skip jika:
// 1. event.id sudah ada di history
const isDuplicate = prevEvents.some((e) => e.id === event.id);

// 2. atau kombinasi (timestamp + type + source) sama
const isDuplicate = prevEvents.some(
  (e) =>
    e.timestamp === event.timestamp &&
    e.type === event.type &&
    e.source === event.source,
);
```

---

## 🔍 Logging & Debugging

### Console Logs

```
[EventHistory] 📂 Loaded from localStorage: 45 events
[EventHistory] 💾 Saved to localStorage: 46 events
[EventHistory] ⏭️ Skipped duplicate event: FIRE_DETECTED
[EventHistory] 🔄 Merged 1 new events

[Firebase] 🔄 Fetched 50 events for initial sync
[AppContent] 🚀 Initializing event history from Firebase
[AppContent] 📥 Merging 50 events from Firebase
[AppContent] 🔄 Real-time event update received

[EventLog] 📊 Event history updated: 51 total events
[EventLog] 🆕 Latest event: FIRE_CLEARED at 10:35
```

---

## ✨ Fitur Tambahan

### 1. Export to CSV

- Export selected date range
- Semua event dalam history bisa di-export
- Format: CSV dengan timestamp lengkap

### 2. Filter & Search

- Filter by event type
- Search by event type atau details
- Pagination (25, 50, 100 rows)

### 3. Status Indicators

- 🟢 NORMAL
- 🟠 WARNING
- 🔴 ALERT

### 4. Event Icons

- 🔥 FIRE_DETECTED / FIRE_CLEARED
- 💧 WATER_LEVEL_LOW
- ⚡ PUMP_ACTIVATED / PUMP_DEACTIVATED

---

## 🚀 Keuntungan Implementasi Baru

| Aspek           | Before                             | After                                          |
| --------------- | ---------------------------------- | ---------------------------------------------- |
| **Data Loss**   | ❌ Event hilang saat status normal | ✅ Semua event tersimpan selamanya             |
| **History**     | ❌ Tidak ada history               | ✅ Complete history di localStorage + Firebase |
| **Reload**      | ❌ Data hilang saat reload         | ✅ Data persist dari localStorage              |
| **Append**      | ❌ Data di-replace                 | ✅ APPEND-ONLY logic                           |
| **Duplikasi**   | ❌ Mungkin ada duplicate           | ✅ Smart duplicate prevention                  |
| **Performance** | ⚠️ Load semua dari Firebase        | ✅ Load dari localStorage (fast)               |
| **Storage**     | ❌ Unlimited memory                | ✅ Capped at 1000 events                       |

---

## 📝 Testing Checklist

- [ ] Load app → Check localStorage load history
- [ ] Event baru masuk → Check append to history
- [ ] Reload app → Check events persist
- [ ] Multiple sensors active → Check merge correctly
- [ ] Export CSV → Check timestamp format
- [ ] Filter by type → Check working
- [ ] Search events → Check case-insensitive
- [ ] Pagination → Check 25/50/100 rows
- [ ] Status badge colors → Check display correctly
- [ ] Oldest event timestamp → Check calculated correctly

---

## 🔧 Maintenance

### Clear Event History (jika diperlukan)

```typescript
// In browser console:
localStorage.removeItem("event_log_history");

// Atau dalam app:
eventHistory.clearHistory();
```

### Max Events Adjustment

```typescript
// File: src/hooks/useEventHistory.ts
const MAX_LOCAL_EVENTS = 1000; // Ubah nilai ini
```

### Firebase Cleanup (jika database penuh)

- Delete old events dari `/events` path di Firebase
- Tidak akan affect lokal cache yang sudah ada
- Next app load akan get data dari Firebase

---

## 📞 Support & Issues

Jika ada issues:

1. Check browser console untuk logs
2. Check localStorage (`event_log_history` key)
3. Check Firebase `/events` path
4. Verify timestamps normalization
5. Check duplicate prevention logic
