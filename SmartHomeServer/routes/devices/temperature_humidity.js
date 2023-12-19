// temperature_humidity.js
const express = require('express');
const router = express.Router();
const mqttClient = require('../mqttHandler');
const socketIOHandler = require('../socketioHandler');

let latestEnvironmentInfo = {}; // Store the latest environment information

router.use(express.json());

mqttClient.mqttClient.subscribe('esp32/device/list');

mqttClient.mqttClient.on('message', (topic, message) => {
  if (topic === 'esp32/device/list') {
    const data = JSON.parse(message.toString());
    updateEnvironmentInfo(data);
  }
});

function updateEnvironmentInfo(data) {
  const temperature = data.temperature || 0;
  const humidity = data.humidity || 0;
  const ip = data.ip;

  // Update the latest environment information
  latestEnvironmentInfo[ip] = { ip, temperature, humidity };
  // Emit the update to all connected clients using Socket.io
  socketIOHandler.emitTemperatureHumidityUpdate({
    ip,
    temperature,
    humidity,
  });
}

// Export a function to initialize Socket.io with the server
router.initializeSocketIO = function (httpServer) {
  socketIOHandler.initializeSocketIO(httpServer);
};

module.exports = router;
