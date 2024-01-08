// temperature_humidity.js
const express = require('express');
const router = express.Router();
const mqttClient = require('../mqttHandler');
const socketIOHandler = require('../socketioHandler');

let latestEnvironmentInfo = {}; // Store the latest environment information

router.use(express.json());

mqttClient.mqttClient.subscribe('esp32/device/list');

// Function to receive the environment information for a device
mqttClient.mqttClient.on('message', (topic, message) => {
  if (topic === 'esp32/device/list') {
    const data = JSON.parse(message.toString());
    
    // Check if both temperature and humidity information is present
    if (typeof data.temperature !== 'undefined' && typeof data.humidity !== 'undefined') {
      updateEnvironmentInfo(data);
    }
  }
});

// Function to update the environment information for a device
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


// Function to get the environment information for a device
router.get('/get-temperature-humidity', (req, res) => {
  console.log('GET request received for environment information:', latestEnvironmentInfo);
  // Return the latest color information stored in currentColors
  res.json(latestEnvironmentInfo);
});

// Export a function to initialize Socket.io with the server
router.initializeSocketIO = function (httpServer) {
  socketIOHandler.initializeSocketIO(httpServer);
  // Emit the latest environment information to the newly connected client
  socketIOHandler.emitTemperatureHumidityUpdate({
    ip,
    temperature,
    humidity,
  });
};

module.exports = router;
