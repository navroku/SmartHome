#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "Velnciems";
const char* password = "40972495";
const char* mqttBroker = "192.168.0.183:1883";
const char* clientId = "weather_station"; // Change for each ESP32

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
  if (millis() - lastPublish > 10000) {
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
  String payload = "{\"id\":\"" + String(clientId) + "\",\"ip\":\"" + WiFi.localIP().toString() + "\"}";
  client.publish("esp32/presence", payload.c_str());
}
