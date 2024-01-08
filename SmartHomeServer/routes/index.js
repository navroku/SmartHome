// routes/index.js
const express = require('express');
const router = express.Router();
const deviceListRouter = require('./deviceList'); 
const socketIOHandler = require('./socketioHandler'); 

// GET route to render the index page
router.get('/', async (req, res) => {

  // Check if the user is authenticated
  if (!req.session.user) {
    return res.redirect('/login');
  }

  // Read devices from the JSON file
  try {
    const devices = deviceListRouter.readDevices();
    res.render('index', { user: req.session.user, devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.render('index', { user: req.session.user, devices: [] });
  }
});

router.io = socketIOHandler.io;

module.exports = router;
