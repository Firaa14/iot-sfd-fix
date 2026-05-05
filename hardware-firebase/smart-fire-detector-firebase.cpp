#include <ESP32Servo.h>
#include <DHT.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <time.h>

// ========== WiFi Configuration ==========
#define WIFI_SSID "FIRDA"
#define WIFI_PASSWORD "syafira1404"

// ========== Firebase Configuration ==========
#define FIREBASE_API_KEY "AIzaSyC3H6QR9rX3X1oCxlVWvQXRMXEKMcbYmxY"
#define FIREBASE_DATABASE_URL "smartfire-39dd8-default-rtdb.firebaseio.com"
#define FIREBASE_USER_EMAIL "syafirafirdausi5@gmail.com"
#define FIREBASE_USER_PASSWORD "Syafira14!"

// ========== Hardware Pins ==========
#define RELAY 22
#define SERVO_PIN 26
#define FLAME_SENSOR 34

#define TRIG_PIN 5
#define ECHO_PIN 18
#define DHT_PIN 4

Servo myServo;
int servoPos = 0;
int sweepStep = 1;
const int SERVO_DELAY = 2; // 2ms per step = very smooth continuous motion

unsigned long lastServoMove = 0;

// 5ms debounce for flame sensor (noise reduction)
int lastFlameReading = LOW;
unsigned long lastFlameReadingTime = 0;
const unsigned long FLAME_DEBOUNCE_TIME = 5; // 5ms debounce

// ========== DHT Setup ==========
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// ========== Global Variables ==========
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Debounce flame sensor
int lastFlameState = LOW;
unsigned long lastFlameChange = 0;
int flameConfirmed = LOW;
const unsigned long DEBOUNCE_TIME = 500;

// Constants for bottle calculations
const float BOTTLE_HEIGHT = 12.0;
const float DISTANCE_TO_RIM = 3.0;
const float RADIUS = 3.0;

// ========== Device Configuration ==========
const char *DEVICE_ID = "ESP32-WH-01-21";
const char *ZONE_NAME = "Warehouse A";
const int TELEMETRY_INTERVAL = 5000; // 5 seconds

// Timing
unsigned long lastTelemetryTime = 0;
unsigned long lastHeartbeat = 0;
const unsigned long HEARTBEAT_INTERVAL = 60000; // 60 seconds

// Data structure
struct SensorData
{
    float temperature;
    float humidity;
    float waterLevel;
    float waterVolume;
    String flameSensorState;
    String pumpState;
    int servoPosition;
    unsigned long timestamp;
};

SensorData currentData;
bool fireAlert = false;
bool lastPumpState = false;
int lastConfirmedFlameForEvent = LOW;
unsigned long lastEventLogTime = 0;

// ========== Function Declarations ==========
void setupWiFi();
void setupFirebase();
void updateSensors();
float readUltrasonic();
void updateFirebaseData();
void createEvent(String eventType);
void handleFireDetection();
bool lastFireState = false;

// ========== SETUP ==========
void setup()
{
    Serial.begin(115200);
    delay(500);

    // Hardware setup
    pinMode(RELAY, OUTPUT);
    digitalWrite(RELAY, LOW);
    pinMode(FLAME_SENSOR, INPUT);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);

    dht.begin();

    myServo.setPeriodHertz(50);
    myServo.attach(SERVO_PIN, 1000, 2000);
    myServo.write(0);

    Serial.println("\n========== SMARTFIRE SYSTEM STARTING ==========");
    Serial.println("Hardware initialized: Relay, Flame Sensor, DHT22, Ultrasonic, Servo");

    // WiFi and Firebase setup
    setupWiFi();
    setupFirebase();

    // Set NTP time
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    Serial.println("Waiting for NTP time sync...");
    time_t now = time(nullptr);
    while (now < 24 * 3600)
    {
        delay(500);
        Serial.print(".");
        now = time(nullptr);
    }
    Serial.println("\nTime synced!");

    // Update initial device status
    Firebase.RTDB.setString(&fbdo, "/device/lastUpdate", String(millis()));
    Firebase.RTDB.setString(&fbdo, "/device/online", "true");
}

// ========== MAIN LOOP ==========
void loop()
{
    unsigned long currentTime = millis();

    // Check WiFi connection
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("WiFi disconnected, reconnecting...");
        setupWiFi();
        return;
    }

    // ===== FLAME SENSOR - IMMEDIATE PUMP CONTROL =====
    int currentFlameReading = digitalRead(FLAME_SENSOR);

    // 5ms debounce for PUMP ON (safety - avoid false positive)
    if (currentFlameReading != lastFlameReading)
    {
        lastFlameReading = currentFlameReading;
        lastFlameReadingTime = currentTime;
    }

    // Pump ON: wait 5ms debounce after flame detected
    if (currentFlameReading == HIGH && currentTime - lastFlameReadingTime >= FLAME_DEBOUNCE_TIME)
    {
        if (!lastPumpState)
        {
            digitalWrite(RELAY, HIGH);
            lastPumpState = true;
            Serial.println("[PUMP] ON IMMEDIATELY (after 5ms debounce)");
        }
    }
    // Pump OFF: IMMEDIATE without delay when flame stops
    else if (currentFlameReading == LOW)
    {
        if (lastPumpState)
        {
            digitalWrite(RELAY, LOW);
            lastPumpState = false;
            Serial.println("[PUMP] OFF IMMEDIATELY (no delay)");
        }
    }

    // Debounce logic - only for event logging (non-blocking, 500ms)
    if (currentFlameReading != lastFlameState)
    {
        lastFlameState = currentFlameReading;
        lastFlameChange = currentTime;
    }
    else if (currentTime - lastFlameChange >= DEBOUNCE_TIME)
    {
        if (currentFlameReading != lastConfirmedFlameForEvent)
        {
            lastConfirmedFlameForEvent = currentFlameReading;
            fireAlert = (currentFlameReading == HIGH);

            Serial.print("[FLAME SENSOR] ");
            Serial.println(currentFlameReading == LOW ? "NO FIRE - Servo SWEEP" : "FIRE DETECTED - Pump ON, Servo STOP");

            // Log event asynchronously (non-blocking)
            if (currentTime - lastEventLogTime >= 1000) // Prevent event log flood
            {
                lastEventLogTime = currentTime;
                if (fireAlert)
                {
                    createEvent("FIRE_DETECTED");
                }
                else
                {
                    createEvent("FIRE_CLEARED");
                }
            }
        }
    }

    // ===== STATE LOGIC - SERVO SWEEP =====
    // Servo runs continuously based on pump state (debounced and stable)
    if (!lastPumpState)
    {
        // NO FIRE - Servo sweep continuously (non-blocking, smooth motion)
        if (currentTime - lastServoMove >= SERVO_DELAY)
        {
            lastServoMove = currentTime;

            myServo.write(servoPos);
            Serial.print("Servo: ");
            Serial.print(servoPos);
            Serial.println("°");

            servoPos += sweepStep;
            if (servoPos >= 180 || servoPos <= 0)
            {
                sweepStep = -sweepStep;
                Serial.println("Servo direction changed");
            }
        }
    }
    else
    {
        // FIRE DETECTED - Servo STOP at current position
        // Pump already controlled by immediate logic above
        if (!lastFireState)
        {
            lastFireState = true;
            Serial.println("*** FIRE ALERT *** Pump ON - Servo STOPPED at position: " + String(servoPos) + "°");
        }
    }

    // Update fire state for next loop
    if (!lastPumpState && lastFireState)
    {
        lastFireState = false;
        Serial.println("*** FIRE CLEARED *** Pump OFF - Servo resuming from position: " + String(servoPos) + "°");
    }

    // ===== READ SENSORS & UPDATE FIREBASE =====
    if (currentTime - lastTelemetryTime >= TELEMETRY_INTERVAL)
    {
        lastTelemetryTime = currentTime;
        updateSensors();
        updateFirebaseData();
    }

    // ===== HEARTBEAT =====
    if (currentTime - lastHeartbeat >= HEARTBEAT_INTERVAL)
    {
        lastHeartbeat = currentTime;
        Firebase.RTDB.setString(&fbdo, "/device/lastHeartbeat", String(millis()));
        Firebase.RTDB.setString(&fbdo, "/systemHealth/lastHeartbeat", String(millis()));
        Serial.println("[HEARTBEAT] Device still online");
    }

    delay(1);
    yield(); // Allow other tasks to run (WiFi, Firebase)
}

// ========== WIFI SETUP ==========
void setupWiFi()
{
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20)
    {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println("\n✓ WiFi connected!");
        Serial.print("IP address: ");
        Serial.println(WiFi.localIP());
        Serial.print("Signal Strength: ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
    }
    else
    {
        Serial.println("\n✗ WiFi connection failed!");
    }
}

// ========== FIREBASE SETUP ==========
void setupFirebase()
{
    Serial.println("Setting up Firebase...");

    // Configure Firebase
    config.api_key = FIREBASE_API_KEY;
    config.database_url = FIREBASE_DATABASE_URL;

    // Anonymous auth (recommended) or use email/password
    auth.user.email = FIREBASE_USER_EMAIL;
    auth.user.password = FIREBASE_USER_PASSWORD;

    // Assign callbacks
    config.token_status_callback = [](token_info_t info)
    {
        Serial.print("[Firebase] Token status: ");
        Serial.println(info.status == token_status_ready ? "Ready" : "Not Ready");
    };

    Firebase.reconnectNetwork(true);
    Firebase.begin(&config, &auth);
    Firebase.setDoubleDigits(5);

    Serial.println("✓ Firebase initialized!");
}

// ========== SENSOR UPDATE FUNCTION ==========
void updateSensors()
{
    // Read temperature and humidity
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity))
    {
        Serial.println("DHT22 read failed");
        currentData.temperature = 0;
        currentData.humidity = 0;
    }
    else
    {
        currentData.temperature = temperature;
        currentData.humidity = humidity;
    }

    // Read ultrasonic
    float distance = readUltrasonic();
    if (distance > 0)
    {
        float water_height = BOTTLE_HEIGHT - (distance - DISTANCE_TO_RIM);
        if (water_height < 0)
            water_height = 0;

        currentData.waterLevel = distance;
        currentData.waterVolume = PI * (RADIUS * RADIUS) * water_height;
    }

    // Flame sensor state - use actual sensor reading (debounced)
    currentData.flameSensorState = (lastConfirmedFlameForEvent == HIGH) ? "DETECTED" : "CLEAR";

    // Pump state
    currentData.pumpState = lastPumpState ? "ON" : "IDLE";

    // Servo position
    currentData.servoPosition = servoPos;

    // Timestamp
    currentData.timestamp = millis();

    // Print debug info
    Serial.print("[SENSORS] Temp: ");
    Serial.print(currentData.temperature);
    Serial.print("°C, Humidity: ");
    Serial.print(currentData.humidity);
    Serial.print("%%, Water: ");
    Serial.print(currentData.waterLevel);
    Serial.print("cm, Flame: ");
    Serial.print(currentData.flameSensorState);
    Serial.print(", Pump: ");
    Serial.println(currentData.pumpState);
}

// ========== ULTRASONIC READ ==========
float readUltrasonic()
{
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH);
    float distance = duration * 0.034 / 2;

    return (distance > 0) ? distance : -1;
}

// ========== UPDATE FIREBASE DATA ==========
void updateFirebaseData()
{
    if (!Firebase.ready())
    {
        Serial.println("Firebase not ready");
        return;
    }

    // Build JSON path
    String basePath = "/sensors/current";

    // Update individual fields for better performance
    Firebase.RTDB.setDouble(&fbdo, basePath + "/temperature", currentData.temperature);
    Firebase.RTDB.setDouble(&fbdo, basePath + "/humidity", currentData.humidity);
    Firebase.RTDB.setDouble(&fbdo, basePath + "/waterLevel", currentData.waterLevel);
    Firebase.RTDB.setDouble(&fbdo, basePath + "/waterVolume", currentData.waterVolume);
    Firebase.RTDB.setString(&fbdo, basePath + "/flameSensor", currentData.flameSensorState);
    Firebase.RTDB.setString(&fbdo, basePath + "/pumpState", currentData.pumpState);
    Firebase.RTDB.setInt(&fbdo, basePath + "/servoPosition", currentData.servoPosition);
    Firebase.RTDB.setInt(&fbdo, basePath + "/timestamp", currentData.timestamp);

    // Update last sync time
    Firebase.RTDB.setInt(&fbdo, "/device/lastUpdate", millis());

    Serial.println("[FIREBASE] Data updated to database");
}

// ========== EVENT LOGGING ==========
void createEvent(String eventType)
{
    if (!Firebase.ready())
        return;

    String eventPath = "/events/" + String(millis());

    Firebase.RTDB.setString(&fbdo, eventPath + "/type", eventType);
    Firebase.RTDB.setString(&fbdo, eventPath + "/status", "NORMAL");
    Firebase.RTDB.setString(&fbdo, eventPath + "/details", "Automatic system response triggered");
    Firebase.RTDB.setString(&fbdo, eventPath + "/source", DEVICE_ID);
    Firebase.RTDB.setInt(&fbdo, eventPath + "/timestamp", millis());

    Serial.print("[EVENT] Logged: ");
    Serial.println(eventType);
}

// ========== FIRE DETECTION HANDLER ==========
void handleFireDetection()
{
    // Create fire alert event
    if (Firebase.ready())
    {
        String eventPath = "/events/" + String(millis());
        Firebase.RTDB.setString(&fbdo, eventPath + "/type", "FIRE_DETECTED");
        Firebase.RTDB.setString(&fbdo, eventPath + "/details", "Fire detected! Pump activated automatically");
        Firebase.RTDB.setString(&fbdo, eventPath + "/source", DEVICE_ID);
    }
}
