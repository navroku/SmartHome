// controllable_led.js

const express = require('express');
const router = express.Router();
const mqttClient = require('../mqttHandler');
const socketIO = require('socket.io');

let currentColor = { r: 255, g: 255, b: 255 };
let io; // Socket.io instance

router.use(express.json());

// controllable_led.js
mqttClient.mqttClient.subscribe('esp32/device/list');

mqttClient.mqttClient.on('message', (topic, message) => {
  if (topic === 'esp32/device/list') {
    const data = JSON.parse(message.toString());
    updateLedColor(data);
  }
});

function updateLedColor(data) {
  const color = data.color || { r: 0, g: 0, b: 0 };
  currentColor = color;
  console.log('Received controllable_led-update:', data);
  // Emit the update to all connected clients using Socket.io
  if (io) {
    io.emit('controllable_led-update', { color });
  }
}

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

router.get('/get-color', (req, res) => {
  res.json({ color: currentColor });
});

router.initializeSocketIO = function (httpServer) {
  io = socketIO(httpServer);  // Use the httpServer instance here
  io.on('connection', (socket) => {
    console.log('Socket.io connection established.');

    // Send the current LED color to the new client upon connection
    socket.emit('controllable_led-update', { color: currentColor });
  });
};

module.exports = router;
