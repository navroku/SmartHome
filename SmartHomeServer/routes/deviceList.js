const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mqttHandler = require('./mqttHandler'); // Import mqttHandler
const socketIOHandler = require('./socketioHandler'); // Import socketIOHandler

const devicesFilePath = path.join(__dirname, '..', 'data', 'devices.json');

// Read devices from the JSON file
function readDevices() {
  try {
    const devicesData = fs.readFileSync(devicesFilePath, 'utf-8');
    return JSON.parse(devicesData);
  } catch (error) {
    console.error('Error reading devices:', error);
    return [];
  }
}

// Save devices to the JSON file
function saveDevices(devices) {
  try {
    fs.writeFileSync(devicesFilePath, JSON.stringify(devices, null, 2), 'utf-8');
    console.log('Devices saved successfully.');

    // Emit the updated device list to all connected clients
    socketIOHandler.emitDeviceListUpdate(devices);
  } catch (error) {
    console.error('Error saving devices:', error);
  }
}

// Function to update device status
function updateDeviceStatus(devices) {
  const currentTime = Date.now();

  devices.forEach(device => {
    const lastReceivedTime = device.lastReceivedTime || 0;
    const timeDifference = currentTime - lastReceivedTime;

    if (timeDifference > 20000) {
      device.status = 'unavailable';
    } else {
      device.status = 'available';
    }
  });

  saveDevices(devices);
}

// Initialize MQTT subscriptions
mqttHandler.mqttClient.subscribe('esp32/device/list');

// Handle MQTT messages
mqttHandler.mqttClient.on('message', (topic, message) => {
  if (topic === 'esp32/device/list') {
    const { id, ip } = JSON.parse(message);
    const devices = readDevices();

    // Check if the device already exists
    const existingDevice = devices.find(device => device.ip === ip);

    if (existingDevice) {
      // Update last received time for existing device
      existingDevice.lastReceivedTime = Date.now();
    } else {
      // Add the new device
      devices.push({ id, ip, lastReceivedTime: Date.now(), status: 'available' });
    }

    // Update device status
    updateDeviceStatus(devices);
  }
});

// POST route to add a device
router.post('/', (req, res) => {
  const { id, ip } = req.body;

  // Validate input
  if (!id || !ip) {
    return res.status(400).json({ error: 'Both id and ip are required.' });
  }

  // Read existing devices
  const devices = readDevices();

  // Check if the device already exists
  const existingDevice = devices.find(device => device.ip === ip);

  if (existingDevice) {
    // Update last received time for existing device
    existingDevice.lastReceivedTime = Date.now();
  } else {
    // Add the new device
    devices.push({ id, ip, lastReceivedTime: Date.now(), status: 'available' });
  }

  // Update device status
  updateDeviceStatus(devices);

  res.json({ success: true, message: 'Device added successfully.' });
});

// POST route to remove an unavailable device
router.post('/remove', (req, res) => {
  const { ip } = req.body;

  // Read existing devices
  const devices = readDevices();

  // Find the device by IP
  const deviceIndex = devices.findIndex(device => device.ip === ip);

  if (deviceIndex !== -1) {
    // Remove the device
    devices.splice(deviceIndex, 1);

    // Save the updated devices
    saveDevices(devices);

    res.json({ success: true, message: 'Device removed successfully.' });
  } else {
    res.status(404).json({ error: 'Device not found.' });
  }
});

module.exports = router;
