// routes/esp32.js
const express = require('express');
const router = express.Router();
const mqtt = require('mqtt');
const http = require('http');
const socketIo = require('socket.io');

// Connect to MQTT broker
const mqttBroker = 'mqtt://broker.hivemq.com:1883';  // Replace with your MQTT broker address
const mqttClient = mqtt.connect(mqttBroker);

// Maintain a list of connected ESP32 devices with timestamps
const connectedDevices = new Map();

mqttClient.on('connect', () => {
  mqttClient.subscribe('esp32/presence');
});

mqttClient.on('message', (topic, message) => {
  const payload = JSON.parse(message.toString());
  const timestamp = Date.now();  // Update the timestamp when a message is received
  connectedDevices.set(payload.id, { ip: payload.ip, id: payload.id, timestamp });
  console.log(`Received MQTT message from ${payload.id} at ${new Date(timestamp).toISOString()}`);
  
  // Notify clients about the updated device list
  io.emit('updateDevices', Array.from(connectedDevices.values()));
});

// Set the interval for checking inactive devices (e.g., every 60 seconds)
const checkInterval = 5 * 1000; // 5 seconds
setInterval(() => {
  checkInactiveDevices();
}, checkInterval);

// Function to check and remove inactive devices
function checkInactiveDevices() {
  const currentTime = Date.now();
  connectedDevices.forEach((device, id) => {
    if (currentTime - device.timestamp > checkInterval) {
      connectedDevices.delete(id);
      console.log(`Removed inactive device ${id} from the list`);
      
      // Notify clients about the updated device list
      io.emit('updateDevices', Array.from(connectedDevices.values()));
    }
  });
}

// Create an HTTP server
const server = http.createServer(router);

// Create a WebSocket server attached to the HTTP server
const io = socketIo(server);

// Middleware to disable caching for the /esp32-devices route
router.use('/esp32-devices', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Route to get the list of connected ESP32 devices
router.get('/esp32-devices', (req, res) => {
  const devices = Array.from(connectedDevices.values());
  res.render('esp32-list', { devices });
});

// Expose the WebSocket server
module.exports = { router, io };
