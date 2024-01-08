// routes/users.js
const express = require('express');
const router = express.Router();
const pool = require('./db');
const { isAdmin } = require('./auth');

// Function to fetch all users
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows, fields] = await connection.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Function to remove a user and update the list
router.post('/remove', isAdmin, async (req, res) => {
  const { userId } = req.body;

  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true, message: 'User removed successfully' });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;
