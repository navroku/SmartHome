// routes/register.js
const express = require('express');
const router = express.Router();
const pool = require('./db');
const { hashPassword, isAdmin } = require('./auth');

router.get('/register', isAdmin, (req, res) => {
  // Render the register view with a success message if it exists in the session
  const successMessage = req.session.successMessage;
  req.session.successMessage = null; // Clear the success message after rendering
  res.render('register', { successMessage });
});

router.post('/register', async (req, res) => {
  const { username, password, isAdmin } = req.body;

  // Validate the username and password (add more validation as needed)

  const hashedPassword = await hashPassword(password);
  await pool.execute('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)', [username, hashedPassword, isAdmin ? 1 : 0]);

  // Set a success message in the session
  req.session.successMessage = 'Registration successful';

  // Redirect to the register page
  res.redirect('/register');
});

module.exports = router;
