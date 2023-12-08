// temperature_humidity.js

const express = require('express');
const router = express.Router();
const mqttClient = require('../mqttHandler');
const socketIO = require('socket.io');

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
  latestEnvironmentInfo[ip] = { temperature, humidity };

  // Emit the update to all connected clients using Socket.io
  if (io) {
    io.emit('temperature_humidity-update', { ip, temperature, humidity });
  }
}

// Export a function to initialize Socket.io with the server
router.initializeSocketIO = function (httpServer) {
  io = socketIO(httpServer);
  io.on('connection', (socket) => {
    console.log('Socket.io connection established.');

    // Send the latest environment information to the newly connected client
    for (const ip in latestEnvironmentInfo) {
      if (latestEnvironmentInfo.hasOwnProperty(ip)) {
        socket.emit('temperature_humidity-update', {
          ip,
          ...latestEnvironmentInfo[ip],
        });
      }
    }
  });
};

module.exports = router;
