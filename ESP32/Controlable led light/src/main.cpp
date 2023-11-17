#include <WiFi.h>
#include <PubSubClient.h>

const char* clientId = "weather_station"; // Change for each ESP32
const char* ssid = "Velnciems";
const char* password = "40972495";

const char* mqttBroker = "broker.hivemq.com";
const int mqttPort = 1883;

float currentTemperature = 25.5;  // Replace this with your actual temperature data
float currentHumidity = 60.0;     // Replace this with your actual humidity data

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastPublish = 0;  // Add this line to declare lastPublish variable

// Declare functions before setup()
void connectToWifi();
void connectToMqtt();
void publishPresence();

void setup() {
  Serial.begin(115200);
  connectToWifi();
  connectToMqtt();
}

void loop() {
  if (!client.connected()) {
    connectToMqtt();
  }

  client.loop();

  // Publish ESP32 presence every 30 seconds
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
  
  // Set the MQTT broker's address and port
  client.setServer(mqttBroker, mqttPort);

  while (!client.connected()) {
    if (client.connect(clientId)) {
      Serial.println("Connected to MQTT broker");
      client.subscribe("esp32/presence");
    } else {
      Serial.println("Failed to connect to MQTT broker");
      delay(1000);
    }
  }
}

void publishPresence() {
  String payload = "{\"id\":\"" + String(clientId) + "\",\"ip\":\"" + WiFi.localIP().toString() + "\",\"temperature\":" + String(currentTemperature) + ",\"humidity\":" + String(currentHumidity) + "}";
  client.publish("esp32/presence", payload.c_str());
}
