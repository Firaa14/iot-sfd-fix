# WiFi Connection Troubleshooting Guide 🔌

Jika serial monitor menampilkan titik-titik terus (......), berarti ESP32 gagal connect ke WiFi.

---

## 🎯 Solusi Cepat (Step by Step)

### Step 1: Gunakan Kode Testing Khusus

Saya sudah buat file test khusus untuk debug WiFi.

**Copy file ini:**

```
hardware-firebase/TEST_WIFI_ONLY.cpp
```

**Cara pakai:**

1. Buka Arduino IDE
2. File → New
3. Copy/Paste isi `TEST_WIFI_ONLY.cpp`
4. Update SSID dan PASSWORD (baris 10-11)
5. Upload ke ESP32
6. Buka Serial Monitor (Baud: 115200)

**Output yang diharapkan:**

```
✅ Network scan
✅ SSID found status
✅ Connection attempts dengan count
✅ Error codes jika gagal
✅ Detailed connection info jika sukses
```

---

## 🔧 Arduino IDE Settings (WAJIB)

Pastikan setting ini 100% benar:

### Tools → Board

```
Select: "ESP32 Dev Module"  (bukan yang lain!)
```

### Tools → Upload Speed

```
Select: 115200
```

### Tools → CPU Frequency

```
Select: 80 MHz (atau 160 MHz)
```

### Tools → Flash Size

```
Select: 4MB (32Mb)
```

### Tools → Partition Scheme

```
Select: "Default 4MB with spiffs"
```

### Tools → Core Debug Level

```
Select: "Info" atau "Debug"
```

### Port Selection

```
COM3, COM4, COM5, dll.
(Lihat device manager jika tidak tahu)
```

---

## 🔍 Serial Monitor Settings

**SANGAT PENTING!**

```
Baud Rate: 115200 (WAJIB!)
Line Ending: "Both NL and CR" (recommended)
Autoscroll: Enabled
```

---

## 🚨 Kemungkinan Masalah & Solusi

### Problem 1: Baud Rate Tidak 115200

**Gejala:** Output ter-chaos, tidak terbaca

**Solusi:**

1. Buka Tools → Serial Monitor
2. Lihat combo box di kanan bawah
3. Pastikan pilih 115200
4. Klik tombol reset di ESP32 atau Upload ulang

---

### Problem 2: SSID Tidak Ditemukan

**Gejala:** Scan menunjukkan networks, tapi SSID target tidak ada

**Solusi:**

1. Check SSID spelling (CASE-SENSITIVE!)
2. Pastikan WiFi tidak hidden
3. Pastikan WiFi broadcasting di 2.4GHz (bukan 5GHz!)
4. Restart router dan coba lagi

---

### Problem 3: SSID Ditemukan tapi Gagal Connect

**Gejala:** WiFi muncul di scan, tapi statusnya stuck

**Solusi - Coba satu per satu:**

#### A. Check Password

```
- Pastikan tidak ada spasi di awal/akhir
- Password CASE-SENSITIVE
- Copy/paste lebih baik dari ketik manual
```

#### B. WiFi Authentication

```
Coba update kode, ubah WiFi mode:

WiFi.mode(WIFI_STA);
WiFi.setAutoConnect(true);
WiFi.setAutoReconnect(true);
WiFi.begin(SSID, PASSWORD);
```

#### C. Manual Delay

```
Coba tambahkan delay lebih lama di setup:

Serial.begin(115200);
delay(3000);  // Lebih lama untuk USB init
```

#### D. Reset WiFi

```cpp
// Tambahkan sebelum WiFi.begin():
WiFi.disconnect(true);  // Disconnect dan turn off
delay(2000);
WiFi.mode(WIFI_STA);
WiFi.begin(SSID, PASSWORD);
```

---

### Problem 4: Baud Rate di Kode Salah

**Gejala:** Serial tidak sync

**Solution:** Update setup() di sketch:

```cpp
void setup()
{
    Serial.begin(115200);  // HARUS ini, bukan 9600!
    delay(2000);  // Important!

    // ... rest of code
}
```

---

### Problem 5: USB Cable Issue

**Gejala:** Board terdeteksi tapi upload timeout

**Solusi:**

- Gunakan USB cable yang BAGUS (data cable, bukan charge-only)
- Coba USB port yang berbeda
- Coba di USB 2.0 port (jika punya), bukan USB 3.0
- Restart Arduino IDE

---

### Problem 6: ESP32 Board Belum Install

**Gejala:** Error "unknown board" saat upload

**Solusi:**

1. File → Preferences
2. Additional Boards Manager URLs, paste:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Tools → Board Manager
4. Search "ESP32"
5. Install "ESP32 by Espressif Systems"

---

## ✅ Testing Sequence

Ikuti urutan ini untuk debug:

### Test 1: USB Connection

```
1. Connect ESP32 ke laptop
2. Buka Device Manager
3. Lihat di "Ports (COM & LPT)"
4. Cari "CH340" atau "USB-SERIAL"
5. Catat nomor COM (COM3, COM4, dll)
```

### Test 2: Arduino IDE Setup

```
1. Tools → Board → "ESP32 Dev Module"
2. Tools → Upload Speed → 115200
3. Tools → Port → Pilih COM yang benar
4. Tools → Get Board Info
5. Lihat apakah detect board
```

### Test 3: Baud Rate Test

```
1. Buka Serial Monitor (Ctrl+Shift+M)
2. Pastikan Baud 115200
3. Klik tombol reset di ESP32
4. Lihat output
5. Jika junk characters, baud rate salah
```

### Test 4: WiFi Connection

```
1. Upload TEST_WIFI_ONLY.cpp
2. Buka Serial Monitor (115200)
3. Lihat output:
   - Devices info?
   - Network scan?
   - SSID found?
   - Connection status?
4. Check masalah dari step 1-3
```

### Test 5: Full System

```
Jika WiFi OK:
1. Update smart-fire-detector-firebase.cpp
2. Update WiFi SSID/PASSWORD
3. Update Firebase credentials
4. Upload ke ESP32
5. Monitor output
```

---

## 🔧 Improved Hardware Code

Gunakan `smart-fire-detector-firebase-v2.cpp` dengan improvement:

```cpp
#define WIFI_CONNECTION_TIMEOUT 30000  // 30 seconds
#define WIFI_RETRY_ATTEMPTS 5

void setupWiFi()
{
    Serial.println("\n[WiFi] Starting connection...");
    Serial.printf("[WiFi] SSID: %s\n", WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.setAutoConnect(true);
    WiFi.setAutoReconnect(true);
    WiFi.disconnect(true);  // Reset WiFi first
    delay(1000);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    unsigned long startAttempt = millis();
    int attemptCounter = 0;

    while (WiFi.status() != WL_CONNECTED)
    {
        if (millis() - startAttempt > WIFI_CONNECTION_TIMEOUT)
        {
            Serial.println("[WiFi] Connection TIMEOUT!");
            return;
        }

        delay(500);
        Serial.print(".");
        attemptCounter++;

        if (attemptCounter % 10 == 0)
        {
            Serial.printf(" [%d attempts]\n", attemptCounter);
            Serial.printf("[WiFi] Status: %d\n", WiFi.status());
        }
    }

    Serial.println("\n[WiFi] ✓ Connected!");
    Serial.printf("[WiFi] IP: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("[WiFi] RSSI: %d dBm\n", WiFi.RSSI());
}
```

---

## 📋 Checklist Debugging

```
[ ] Baud Rate 115200?
[ ] Arduino IDE board setting = "ESP32 Dev Module"?
[ ] Upload Speed = 115200?
[ ] COM Port correct?
[ ] WiFi SSID spelled correctly?
[ ] WiFi Password correct (no spaces)?
[ ] WiFi is 2.4GHz (not 5GHz)?
[ ] USB cable is data cable (not charge-only)?
[ ] Tried TEST_WIFI_ONLY.cpp?
[ ] Reset ESP32 after upload?
[ ] Serial Monitor opened AFTER upload?
```

---

## 🆘 Jika Masih Gagal

Kumpulkan informasi ini dan beri tahu saya:

1. **Serial Monitor Output:**

   ```
   Copy/paste exact output (screenshot atau text)
   ```

2. **Board Info:**
   - Tools → Get Board Info
   - Catat hasilnya

3. **SSID/Password:**
   - SSID: `[apa nama WiFi]`
   - Router brand: `[TP-Link, Asus, dll]`
   - WiFi Band: `2.4GHz / 5GHz`

4. **Arduino IDE:**
   - Version: `[cek Help → About]`
   - Board: `[dari Tools → Board]`
   - Upload Speed: `[dari Tools → Upload Speed]`

5. **Cable:**
   - Type: `[USB Type-C / Micro USB]`
   - Length: `[pendek / panjang]`

---

## 🎯 Next Steps

1. **Coba TEST_WIFI_ONLY.cpp** terlebih dahulu
2. **Lihat output detail** untuk pinpoint masalah
3. **Fix masalah satu per satu** sesuai checklist
4. **Setelah WiFi OK**, baru test dengan Firebase

---

**Good luck! 🚀**

Hubungi jika masih ada masalah!
