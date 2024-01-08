// routes/logout.js
const express = require('express');
const router = express.Router();

// Destroy the session to log the user out
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      res.sendStatus(500);
    } else {
      res.redirect('/'); // Redirect to the home page after logout
    }
  });
});

module.exports = router;
