#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <DHT.h>
#include <SPI.h>
#include <ArduinoJson.h>

const char* clientId = "temperature_humidity";
const char* ssid = "Velnciems";
const char* password = "40972495";

const char* mqttBroker = "broker.hivemq.com";
const int mqttPort = 1883;
const char* presenceTopic = "esp32/device/list";

#define DHTPIN 33 // Replace with your actual pin configuration for DHT22 sensor
#define DHTTYPE DHT22 // DHT 22 (AM2302)

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastPublish = 0;

DHT dht22(DHTPIN, DHTTYPE);

float humidity, temperature;

void connectToWifi();
void connectToMqtt();
void publishPresence();
void setMqttCallback();

void setup() {
  Serial.begin(115200);
  dht22.begin();

  connectToWifi();
  connectToMqtt();
  setMqttCallback();
}

void loop() {
  if (!client.connected()) {
    connectToMqtt();
  }

  client.loop();

  if (millis() - lastPublish > 5000) {
    publishPresence();
    lastPublish = millis();
  }
}

void connectToWifi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void connectToMqtt() {
  Serial.println("Connecting to MQTT broker...");
  client.setServer(mqttBroker, mqttPort);

  while (!client.connected()) {
    if (client.connect(clientId)) {
      Serial.println("Connected to MQTT broker");
    } else {
      Serial.println("Failed to connect to MQTT broker");
      delay(1000);
    }
  }
}

void publishPresence() {
    // Read temperature and humidity
  temperature = dht22.readTemperature(); 
  humidity = dht22.readHumidity();
  // Check if readings are valid
  if (!isnan(temperature) && !isnan(humidity)) {
    // Prepare JSON payload
    DynamicJsonDocument doc(1024);
    doc["id"] = clientId;
    doc["ip"] = WiFi.localIP().toString();
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.print("°C / Humidity: ");
    Serial.print(humidity);
    // Serialize JSON to string
    String payload;
    serializeJson(doc, payload);
    client.publish(presenceTopic, payload.c_str());
  }
  
  
}

void callback(char* topic, byte* payload, unsigned int length) {
  // This ESP32 only publishes data and does not handle incoming messages
}

void setMqttCallback() {
  client.setCallback(callback);
}