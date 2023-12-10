// controllable_led.js
const express = require('express');
const router = express.Router();
const mqttClient = require('../mqttHandler');
const socketIOHandler = require('../socketioHandler');

let currentColors = {}; // Store the current color information for each IP

router.use(express.json());

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

mqttClient.mqttClient.subscribe('esp32/device/list');

mqttClient.mqttClient.on('message', (topic, message) => {
  if (topic === 'esp32/device/list') {
    const data = JSON.parse(message.toString());
    updateColorInfo(data);
  }
});

function updateColorInfo(data) {
  const ip = data.ip;
  const color = data.color;

  // Update the current color information for the specific IP
  currentColors[ip] = { ip, color };
  console.log('Current color:', currentColors);
  
  // Emit the update to all connected clients using Socket.io
  socketIOHandler.emitColorUpdate(currentColors);
}
// Define a new endpoint for getting the latest color information
router.get('/get-color', (req, res) => {
  console.log('GET request received for color information:', currentColors);
  // Return the latest color information stored in currentColors
  res.json(currentColors);
});
// Export a function to initialize Socket.io with the server
router.initializeSocketIO = function (httpServer) {
  socketIOHandler.initializeSocketIO(httpServer);

  // Send the latest color information to the newly connected client
  socketIOHandler.emitColorUpdate(currentColors);
};

module.exports = router;
