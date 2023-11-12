// routes/logout.js
const express = require('express');
const router = express.Router();

router.post('/logout', (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login'); // Redirect to the login page after logout
  });
});

module.exports = router;
