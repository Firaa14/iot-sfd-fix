# Firebase Authentication Troubleshooting Guide

## Problem: "Token status: ⚠️ Not Ready"

This means Firebase authentication is failing. Your ESP32 can connect to WiFi but cannot authenticate with Firebase.

---

## Quick Fixes (Try These First)

### 1. **Enable Email/Password Authentication in Firebase**

⚠️ **This is the most common issue!**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **smartfire-39dd8**
3. Go to **Authentication** (left sidebar)
4. Click **Sign-in method** tab
5. Find **Email/Password** provider
6. Click the toggle to **Enable** it
7. Click **Save**

### 2. **Verify User Exists**

1. In Firebase Console → **Authentication** → **Users** tab
2. Check if user `edusyafira28@gmail.com` exists
3. If NOT, create it:
   - Click **"Create user"** button
   - Email: `edusyafira28@gmail.com`
   - Password: `louistomlinson28`
   - Click **Create user**

### 3. **Check Database Permissions**

The Realtime Database needs to allow write access for your device:

1. Go to **Realtime Database** in Firebase Console
2. Click **Rules** tab
3. Replace with this rule (for testing only):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **WARNING:** This allows anyone to read/write! For production, use:

```json
{
  "rules": {
    ".read": "root.child('device').child('authenticated').val() === true",
    ".write": "root.child('device').child('authenticated').val() === true"
  }
}
```

---

## Verify Your Credentials

Check these values in your code:

```cpp
#define FIREBASE_API_KEY "AIzaSyC3H6QR9rX3X1oCxlVWvQXRMXEKMcbYmxY"
#define FIREBASE_DATABASE_URL "https://smartfire-39dd8-default-rtdb.firebaseio.com"
#define FIREBASE_USER_EMAIL "edusyafira28@gmail.com"
#define FIREBASE_USER_PASSWORD "louistomlinson28"
```

To get correct credentials:

1. **API Key:** Firebase Console → Project Settings → General tab → Web API Key
2. **Database URL:** Firebase Console → Realtime Database → Your URL (ends with `.firebaseio.com`)
3. **Email & Password:** Your Firebase authentication user

---

## Advanced: If Token Still Won't Ready

### Option A: Try Different Serial Monitoring

```
Arduino IDE → Tools → Serial Monitor
Set baud rate to 115200
Check for error messages in token status callback
```

### Option B: Alternative Authentication (Use This If Email/Password Fails)

Replace `setupFirebase()` with anonymous authentication:

```cpp
void setupFirebase()
{
    Serial.println("[Firebase] Initializing with ANONYMOUS auth...");

    config.api_key = FIREBASE_API_KEY;
    config.database_url = FIREBASE_DATABASE_URL;

    // Use anonymous authentication instead
    config.token_status_callback = [](token_info_t info)
    {
        Serial.print("[Firebase] Token status: ");
        Serial.println(info.status == token_status_ready ? "✓ Ready" : "⚠️  Not Ready");
    };

    Firebase.reconnectNetwork(true);
    Firebase.begin(&config, &auth); // No auth.user needed for anonymous
    Firebase.setDoubleDigits(5);

    Serial.println("[Firebase] ✓ Initialized!");
}
```

Then in Firebase Console:

1. **Authentication** → **Sign-in method**
2. Enable **Anonymous** provider

---

## Testing Steps

### Step 1: Compile New Version

1. Use `smart-fire-detector-firebase-v3-fixed.cpp`
2. This has better error messaging

### Step 2: Monitor Serial Output

```
[INIT] ⏳ Waiting for Firebase authentication...
[Firebase] Token status: ...
```

Watch for:

- ✓ Ready = Success!
- ⚠️ Not Ready + Error message = Check troubleshooting above

### Step 3: Check Firebase Console

1. Go to **Realtime Database**
2. Look for `/device/online` = "true"
3. If not appearing, authentication failed

---

## Network Diagnostic Commands

If WiFi connects but Firebase fails:

```cpp
// Add this to loop() temporarily to check network:
if (currentTime % 5000 == 0) {
    Serial.printf("[DEBUG] WiFi IP: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("[DEBUG] Firebase ready: %s\n", Firebase.ready() ? "Yes" : "No");
}
```

---

## If Nothing Works

Last resort: Use **API Key Only** (no authentication):

```cpp
void setupFirebase()
{
    config.api_key = FIREBASE_API_KEY;
    config.database_url = FIREBASE_DATABASE_URL;
    // NO auth required

    Firebase.reconnectNetwork(true);
    Firebase.begin(&config, NULL); // NULL instead of &auth
}
```

Then set Database Rules to public (test only):

```json
{ "rules": { ".read": true, ".write": true } }
```

---

## Summary Checklist

- [ ] Email/Password auth enabled in Firebase Console
- [ ] User exists: edusyafira28@gmail.com
- [ ] Database rules allow read/write
- [ ] API Key is correct
- [ ] Database URL is correct
- [ ] Using latest Firebase-ESP-Client library
- [ ] Serial monitor shows WiFi connected before Firebase
- [ ] System running for 5+ seconds (auth takes time)
