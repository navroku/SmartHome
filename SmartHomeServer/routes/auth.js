// routes/auth.js
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

function isAdmin(req, res, next) {
  // Check if the user is logged in and is an admin
  if (req.session.user && req.session.user.isAdmin === 1) {
    return next(); // User is logged in and is an admin, so continue with the request
  } else {
    res.redirect('/');
  }
}

module.exports = { hashPassword, comparePasswords, isAdmin };