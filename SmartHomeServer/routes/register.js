// routes/register.js
const express = require('express');
const router = express.Router();
const pool = require('./db');
const { hashPassword, isAdmin } = require('./auth');

// GET route to render the registration form
router.get('/register', isAdmin, (req, res) => {
  const successMessage = req.session.successMessage;
  const errorMessage = req.session.errorMessage;
  
  req.session.successMessage = null; 
  req.session.errorMessage = null; 

  res.render('register', { successMessage, errorMessage });
});

// POST route to handle user registration
router.post('/register', async (req, res) => {
  const { username, password, confirmPassword, isAdmin } = req.body;

  try {
    // Check if the username already exists
    const [existingUser] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      req.session.errorMessage = 'Username is already taken. Choose a different username.';
      return res.json({ success: false, message: 'Username is already taken. Choose a different username.' });
    }

    // Validate the username and password
    if (username.length < 6) {
      req.session.errorMessage = 'Username must be at least 6 characters long.';
      return res.json({ success: false, message: 'Username must be at least 6 characters long.' });
    }

    if (password.length < 8) {
      req.session.errorMessage = 'Password must be at least 8 characters long.';
      return res.json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    if (password !== confirmPassword) {
      req.session.errorMessage = 'Passwords do not match.';
      return res.json({ success: false, message: 'Passwords do not match.' });
    }

    const hashedPassword = await hashPassword(password);
    
    // Insert the user into the database
    await pool.execute('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)', [username, hashedPassword, isAdmin ? 1 : 0]);

    // Redirect to the register page
    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error( error + ': Internal Server Error' );
    req.session.errorMessage = 'Error registering user. Please try again later.';
    res.json({ success: false, message: 'Error registering user. Please try again later.' });
  }
});

module.exports = router;
