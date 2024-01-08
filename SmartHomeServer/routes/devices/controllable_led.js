// controllable_led.js
const express = require('express');
const router = express.Router();
const mqttClient = require('../mqttHandler');
const socketIOHandler = require('../socketioHandler');

let currentColors = {}; // Store the current color information for each IP

router.use(express.json());

mqttClient.mqttClient.subscribe('esp32/device/list');

mqttClient.mqttClient.on('message', (topic, message) => {
  if (topic === 'esp32/device/list') {
    const data = JSON.parse(message.toString());

    if (typeof data.color !== 'undefined') {
      updateColorInfo(data);
    }
  }
});

// Function to update the color information for a device
function updateColorInfo(data) {
  const id = data.id;
  const ip = data.ip;
  const color = data.color;

  if (id === 'controllable_led'){
    currentColors[ip] = { ip, color };
  }

  // Emit the update to all connected clients using Socket.io
  socketIOHandler.emitColorUpdate(currentColors);
}

// Function to get the color information for a device
router.get('/get-color', (req, res) => {
  console.log('GET request received for color information:', currentColors);
  res.json(currentColors);
});

// Function to set the color information for a device
router.post('/set-color', (req, res) => {
  const color = req.body.color || {};
  const ipAddress = req.body.ip;
  const message = {
    color: {
      r: color.r || 0,
      g: color.g || 0,
      b: color.b || 0,
    },
    ip: ipAddress,
  };

  console.log('Received Message:', message);
  mqttClient.publish('esp32/led/control', JSON.stringify(message));
  res.send('Color set successfully');
});

// Export a function to initialize Socket.io with the server
router.initializeSocketIO = function (httpServer) {
  socketIOHandler.initializeSocketIO(httpServer);

  // Send the latest color information to the newly connected client
  socketIOHandler.emitColorUpdate(currentColors);
};

module.exports = router;
