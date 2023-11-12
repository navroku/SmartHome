// routes/login.js
const express = require('express');
const router = express.Router();
const pool = require('./db');
const { comparePasswords } = require('./auth');

router.get('/login', (req, res) => {
  // Check if the user is already authenticated
  if (req.session.user) {
    return res.redirect('/');
  }

  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate the username and password (add more validation as needed)

  const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
  const user = rows[0];

  if (!user || !(await comparePasswords(password, user.password))) {
    return res.status(401).send('Invalid username or password');
  }

  // Set up session and redirect to the home page
  req.session.user = { id: user.id, username: user.username, isAdmin: user.isAdmin };
  res.redirect('/');
});

module.exports = router;
