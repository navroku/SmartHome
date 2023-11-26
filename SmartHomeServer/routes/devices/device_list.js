// routes/devices/device_list.js
const express = require('express');
const router = express.Router();
const { mqttClient } = require('../mqttHandler'); // Import the MQTT client

// Subscribe to the topic when the route is initialized
mqttClient.subscribe('esp32/device/list');

// Handle incoming MQTT messages
mqttClient.on('message', (topic, message) => {
    if (topic === 'esp32/device/list') {
        const deviceList = JSON.parse(message.toString());
        // Handle device list as needed
        console.log('Received device list:', deviceList);
    }
});

// Define routes for device list if needed

module.exports = router;
