# WiFi Connection Troubleshooting Guide 🔌

If the serial monitor shows continuous dots (......), it means the ESP32 failed to connect to WiFi.

---

## 🎯 Quick Solutions (Step by Step)

### Step 1: Use Special Testing Code

I've created a special test file for WiFi debugging.

**Copy this file:**

```
hardware-firebase/TEST_WIFI_ONLY.cpp
```

**How to use:**

1. Open Arduino IDE
2. File → New
3. Copy/Paste contents of `TEST_WIFI_ONLY.cpp`
4. Update SSID and PASSWORD (lines 10-11)
5. Upload to ESP32
6. Open Serial Monitor (Baud: 115200)

**Expected output:**

```
✅ Network scan
✅ SSID found status
✅ Connection attempts with count
✅ Error codes if failed
✅ Detailed connection info if successful
```

---

## 🔧 Arduino IDE Settings (REQUIRED)

Make sure these settings are 100% correct:

### Tools → Board

```
Select: "ESP32 Dev Module"  (not others!)
```

### Tools → Upload Speed

```
Select: 115200
```

### Tools → CPU Frequency

```
Select: 80 MHz (or 160 MHz)
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
Select: "Info" or "Debug"
```

### Port Selection

```
COM3, COM4, COM5, etc.
(Check device manager if unsure)
```

---

## 🔍 Serial Monitor Settings

**VERY IMPORTANT!**

```
Baud Rate: 115200 (REQUIRED!)
Line Ending: "Both NL and CR" (recommended)
Autoscroll: Enabled
```

---

## 🚨 Possible Problems & Solutions

### Problem 1: Baud Rate Not 115200

**Symptoms:** Chaotic output, unreadable

**Solution:**

1. Open Tools → Serial Monitor
2. Look at combo box at bottom right
3. Make sure select 115200
4. Click reset button on ESP32 or re-upload

---

### Problem 2: SSID Not Found

**Symptoms:** Scan shows networks, but target SSID not there

**Solution:**

1. Check SSID spelling (CASE-SENSITIVE!)
2. Make sure WiFi is not hidden
3. Make sure WiFi is broadcasting on 2.4GHz (not 5GHz!)
4. Restart router and try again

---

### Problem 3: SSID Found but Connection Failed

**Symptoms:** WiFi appears in scan, but status stuck

**Solutions - Try one by one:**

#### A. Check Password

```
- Make sure no spaces at beginning/end
- Password is CASE-SENSITIVE
- Copy/paste better than manual typing
```

#### B. WiFi Authentication

```
Try updating code, change WiFi mode:

WiFi.mode(WIFI_STA);
WiFi.setAutoConnect(true);
WiFi.setAutoReconnect(true);
WiFi.begin(SSID, PASSWORD);
```

#### C. Manual Delay

```
Try adding longer delay in setup:

Serial.begin(115200);
delay(3000);  // Longer for USB init
```

#### D. Reset WiFi

```cpp
// Add before WiFi.begin():
WiFi.disconnect(true);  // Disconnect and turn off
delay(2000);
WiFi.mode(WIFI_STA);
WiFi.begin(SSID, PASSWORD);
```

---

### Problem 4: Wrong Baud Rate in Code

**Symptoms:** Serial not in sync

**Solution:** Update setup() di sketch:

```cpp
void setup()
{
    Serial.begin(115200);  // MUST be this, not 9600!
    delay(2000);  // Important!

    // ... rest of code
}
```

---

### Problem 5: USB Cable Issue

**Symptoms:** Board detected but upload timeout

**Solutions:**

- Use a GOOD USB cable (data cable, not charge-only)
- Try different USB port
- Try USB 2.0 port (if available), not USB 3.0
- Restart Arduino IDE

---

### Problem 6: ESP32 Board Not Installed

**Symptoms:** "unknown board" error when uploading

**Solution:**

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

Follow this sequence for debugging:

### Test 1: USB Connection

```
1. Connect ESP32 to laptop
2. Open Device Manager
3. Look in "Ports (COM & LPT)"
4. Find "CH340" or "USB-SERIAL"
5. Note the COM number (COM3, COM4, etc)
```

### Test 2: Arduino IDE Setup

```
1. Tools → Board → "ESP32 Dev Module"
2. Tools → Upload Speed → 115200
3. Tools → Port → Select correct COM
4. Tools → Get Board Info
5. Check if board is detected
```

### Test 3: Baud Rate Test

```
1. Open Serial Monitor (Ctrl+Shift+M)
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
