#include <ESP32Servo.h>
#include <DHT.h>

// Existing defines
#define RELAY 22
#define SERVO_PIN 26
#define FLAME_SENSOR 34

// New defines for ultrasonic and DHT
#define TRIG_PIN 5
#define ECHO_PIN 18
#define DHT_PIN 4

// DHT setup
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

Servo myServo;
int servoPos = 0;
int sweepStep = 1;
const int SERVO_DELAY = 50;  // Faster sweeping

unsigned long lastServoMove = 0;

// Debounce flame sensor
int lastFlameState = LOW;
unsigned long lastFlameChange = 0;
int flameConfirmed = LOW;
const unsigned long DEBOUNCE_TIME = 500;

// Constants for bottle calculations
const float BOTTLE_HEIGHT = 12.0; // cm
const float DISTANCE_TO_RIM = 3.0; // cm (sensor is 3 cm above rim)
const float RADIUS = 3.0; // cm (diameter 6 cm / 2)

void setup()
{
    Serial.begin(115200);
    delay(500);

    pinMode(RELAY, OUTPUT);
    digitalWrite(RELAY, LOW); // Relay OFF (pump OFF)

    pinMode(FLAME_SENSOR, INPUT);

    // Initialize ultrasonic pins
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);

    // Initialize DHT
    dht.begin();

    // Initialize servo
    myServo.setPeriodHertz(50);
    myServo.attach(SERVO_PIN, 1000, 2000);
    myServo.write(0);

    Serial.println("\n=== FIRE DETECTION SYSTEM ===");
    Serial.println("Pin 34 (Flame Sensor) - LOW=No Fire, HIGH=Fire");
    Serial.println("Pin 22 (Relay) - HIGH=Pump ON, LOW=Pump OFF");
    Serial.println("Pin 26 (Servo) - Sweep when no fire, stop at position when fire");
    Serial.println("Pin 5 (Ultrasonic TRIG), Pin 18 (Ultrasonic ECHO)");
    Serial.println("Pin 4 (DHT22 Data)\n");
}

void loop()
{
    unsigned long currentTime = millis();

    // === READ FLAME SENSOR ===
    int currentFlameReading = digitalRead(FLAME_SENSOR);

    // Debounce: wait 500ms of stable reading
    if (currentFlameReading != lastFlameState)
    {
        lastFlameState = currentFlameReading;
        lastFlameChange = currentTime;
    }
    else if (currentTime - lastFlameChange >= DEBOUNCE_TIME)
    {
        if (currentFlameReading != flameConfirmed)
        {
            flameConfirmed = currentFlameReading;
            Serial.print("[FLAME SENSOR] ");
            Serial.println(flameConfirmed == LOW ? "NO FIRE - Servo SWEEP" : "FIRE DETECTED - Pump ON, Servo STOP");
        }
    }

    // === STATE LOGIC ===

    if (flameConfirmed == LOW)
    {
        // NO FIRE - Servo sweep, Pump OFF
        digitalWrite(RELAY, LOW);

        // Move servo continuously
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
        // FIRE DETECTED - Servo STOP at current position, Pump ON
        digitalWrite(RELAY, HIGH);
        // Force servo to stay at current position (no movement or vibration)
        myServo.write(servoPos);
        Serial.println("*** FIRE ALERT *** Pump ON - Servo STOPPED at position: " + String(servoPos) + "°");
    }

    // === READ DHT22 ===
    float temperature = dht.readTemperature(); // °C
    float humidity = dht.readHumidity(); // %

    if (!isnan(temperature) && !isnan(humidity)) {
        Serial.print("DHT22 - Temperature: ");
        Serial.print(temperature);
        Serial.print(" °C, Humidity: ");
        Serial.print(humidity);
        Serial.println(" %");
    } else {
        Serial.println("DHT22 - Error reading sensor");
    }

    // === READ ULTRASONIC AND CALCULATE VOLUME ===
    // Trigger ultrasonic sensor
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    // Read echo
    long duration = pulseIn(ECHO_PIN, HIGH);
    float distance = duration * 0.034 / 2; // Distance in cm (speed of sound = 0.034 cm/us, /2 for round trip)

    if (distance > 0) {
        // Calculate water height: Water height = Bottle height - (Distance measured - Distance to rim)
        float water_height = BOTTLE_HEIGHT - (distance - DISTANCE_TO_RIM);
        if (water_height < 0) water_height = 0; // Clamp to 0 if negative

        // Calculate volume: Volume = π * r² * h (cylindrical bottle)
        // Volume in cm³ = mL (since 1 cm³ = 1 mL)
        float volume_ml = PI * (RADIUS * RADIUS) * water_height;

        Serial.print("Ultrasonic - Distance to water: ");
        Serial.print(distance);
        Serial.print(" cm, Water height: ");
        Serial.print(water_height);
        Serial.print(" cm, Volume: ");
        Serial.print(volume_ml);
        Serial.println(" mL");
    } else {
        Serial.println("Ultrasonic - Error reading sensor");
    }

    delay(50);
}