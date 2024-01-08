// routes/login.js
const express = require('express');
const router = express.Router();
const pool = require('./db');
const { comparePasswords } = require('./auth');

router.get('/login', async (req, res) => {
  // Check if the user is already authenticated
  if (req.session.user) {
    return res.redirect('/');
  }

  const [users] = await pool.execute('SELECT * FROM users');
  
  // Check if there is at least one user with isAdmin=true
  const isAdminUserExists = users.some(user => user.isAdmin);

  if (!isAdminUserExists) {
    // Automatically authenticate the user (bypass login) since there are no users or no admin user
    req.session.user = { username: 'DefaultUser', isAdmin: true };
    return res.redirect('/');
  }

  res.render('login');
});

// POST route to handle user login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
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
