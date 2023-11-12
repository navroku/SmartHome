// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // Check if the user is authenticated (you can modify this based on your session setup)
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('index', { user: req.session.user });
});

module.exports = router;
