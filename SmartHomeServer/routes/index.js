// index.js
const express = require('express');
const router = express.Router();
const deviceListRouter = require('./deviceList'); // Import your deviceList router
const socketIOHandler = require('./socketioHandler'); // Import your socketIOHandler

// ... (your existing code)

// GET route to render the index page
router.get('/', async (req, res) => {
  // Check if the user is authenticated (you can modify this based on your session setup)
  if (!req.session.user) {
    return res.redirect('/login');
  }

  // Fetch the devices from your deviceList route
  try {
    const devices = deviceListRouter.readDevices();
    console.log('Devices:', devices);
    res.render('index', { user: req.session.user, devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.render('index', { user: req.session.user, devices: [] }); // Handle the error appropriately
  }
});

// Add Socket.io connection
router.io = socketIOHandler.io;

module.exports = router;
