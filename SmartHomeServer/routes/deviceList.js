// deviceList.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mqttHandler = require('./mqttHandler');
const socketIOHandler = require('./socketioHandler');
const { isAdmin } = require('./auth');

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

    if (timeDifference > 10000) {
      device.status = 'unavailable';
    } else {
      device.status = 'available';
    }
    if (device.cardType) {
      device.cardType = device.cardType;
    }
  });

  saveDevices(devices);
}


// Timer to update device status every 5 seconds
setInterval(() => {
  const devices = readDevices();
  updateDeviceStatus(devices);
}, 5000);

// Initialize MQTT subscriptions
mqttHandler.mqttClient.subscribe('esp32/device/list');

// Handle MQTT messages
mqttHandler.mqttClient.on('message', (topic, message) => {
  if (topic === 'esp32/device/list') {
    const deviceInfo = JSON.parse(message);
    const devices = readDevices();
    const existingDeviceIndex = devices.findIndex(device => device.ip === deviceInfo.ip);

    if (existingDeviceIndex !== -1) {
      deviceInfo.cardType = devices[existingDeviceIndex].cardType;
      devices[existingDeviceIndex] = { ...deviceInfo, lastReceivedTime: Date.now() };
    } else {
      devices.push({ ...deviceInfo, lastReceivedTime: Date.now(), status: 'available' });
    }

    updateDeviceStatus(devices);
  }
});


// GET route to retrieve the initial list of devices
router.get('/', (req, res) => {
  const devices = readDevices();
  res.json(devices);
});



// POST route to remove a device and update the list
router.post('/remove', isAdmin, (req, res) => {
  const { ip } = req.body;
  const devices = readDevices();
  const deviceIndex = devices.findIndex(device => device.ip === ip);

  if (deviceIndex !== -1) {
    devices.splice(deviceIndex, 1);
    saveDevices(devices);
    res.json({ success: true, message: 'Device removed successfully.' });
  } else {
    res.status(404).json({ error: 'Device not found.' });
  }
});


// GET route to retrieve the list of available cards
router.get('/cards', async (req, res) => {
  const cardsFolderPath = path.join(__dirname, '..', 'views', 'cards');

  try {
    const files = await fs.promises.readdir(cardsFolderPath);
    console.log('Files:', files);
    res.json(files);
  } catch (err) {
    console.error('Error reading cards folder:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST route to update the card type of a device
router.post('/update-card-type', isAdmin, (req, res) => {
  const { ip, cardType } = req.body;
  const devicesBeforeUpdate = readDevices();
  if (!ip || !cardType) {
    return res.status(400).json({ error: 'Both IP and cardType are required.' });
  }

  const devices = readDevices();
  const deviceIndex = devices.findIndex(device => device.ip === ip);

  if (deviceIndex !== -1) {
    devices[deviceIndex].cardType = cardType; 

    saveDevices(devices);
    res.json({ success: true, message: 'Card type updated successfully.' });
  } else {
    res.status(404).json({ error: 'Device not found.' });
  }
});



// GET route to retrieve the information of a specific device by IP
router.get('/:ip', isAdmin, (req, res) => {
  const ip = req.params.ip;
  const devices = readDevices();
  const device = devices.find(device => device.ip === ip);

  if (device) {
    // Exclude "lastReceivedTime" and "status" from the response
    const { lastReceivedTime, status, ...deviceInfo } = device;
    res.json(deviceInfo);
  } else {
    res.status(404).json({ error: 'Device not found.' });
  }
});

module.exports = router;
module.exports.readDevices = readDevices;
