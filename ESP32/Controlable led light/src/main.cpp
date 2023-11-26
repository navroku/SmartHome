#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* clientId = "controllable_led"; // Change for each ESP32
const char* ssid = "Velnciems";
const char* password = "40972495";

const char* mqttBroker = "broker.hivemq.com";
const int mqttPort = 1883;
const char* presenceTopic = "esp32/device/list";
const char* ledControlTopic = "esp32/led/control";

int redPin = 25;    // Replace with your actual pin configuration
int greenPin = 26;  // Replace with your actual pin configuration
int bluePin = 27;   // Replace with your actual pin configuration

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastPublish = 0;

int redValue = 0;
int greenValue = 0;
int blueValue = 0;

void connectToWifi();
void connectToMqtt();
void publishPresence();
void handleLedControl(String message);
void setMqttCallback();

void setup() {
  Serial.begin(115200);
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);

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
      client.subscribe(ledControlTopic);
    } else {
      Serial.println("Failed to connect to MQTT broker");
      delay(1000);
    }
  }
}

void publishPresence() {
  String payload = "{\"id\":\"" + String(clientId) + "\",\"ip\":\"" + WiFi.localIP().toString() + "\",\"color\":{\"r\":" + String(redValue) + ",\"g\":" + String(greenValue) + ",\"b\":" + String(blueValue) + "}}";
  client.publish(presenceTopic, payload.c_str());
}

void handleLedControl(String message) {
  Serial.println("Received control message: " + message);

  // Parse the JSON message
  DynamicJsonDocument doc(1024);  // Adjust the size as needed
  deserializeJson(doc, message);

  // Extract color and IP
  JsonObject color = doc["color"];
  redValue = color["r"];
  greenValue = color["g"];
  blueValue = color["b"];

  String receivedIP = doc["ip"];

  // Compare with the local IP address
  if (receivedIP == WiFi.localIP().toString()) {
    // Apply the LED color
    analogWrite(redPin, redValue);
    analogWrite(greenPin, greenValue);
    analogWrite(bluePin, blueValue);

    // Publish the presence immediately after updating the LED color
    publishPresence();
  }
}




void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  handleLedControl(message);
}

// Set the callback function for MQTT subscription
void setMqttCallback() {
  client.setCallback(callback);
}
