const express = require('express');
const router = express.Router();
const mqttClient = require('../mqttHandler');
const socketIO = require('socket.io');

router.use(express.json());

let currentColor = { r: 0, g: 0, b: 0 };
let io; // Socket.io instance

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

mqttClient.mqttClient.subscribe('esp32/device/list');

mqttClient.mqttClient.on('message', (topic, message) => {
  if (topic === 'esp32/device/list') {
    const deviceInfo = JSON.parse(message.toString());
    currentColor = deviceInfo.color;

    // Emit the color update to all connected clients using Socket.io
    if (io) {
      io.emit('color-update', { color: currentColor });
    }
  }
});

// Export a function to initialize Socket.io with the server
router.initializeSocketIO = function (httpServer) {
  io = socketIO(httpServer);
  io.on('connection', (socket) => {
    console.log('Socket.io connection established.');

    // Send the current color to the newly connected client
    socket.emit('color-update', { color: currentColor });
  });
};

module.exports = router;
