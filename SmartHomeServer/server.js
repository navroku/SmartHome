// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs-mate');
const http = require('http');
const { router: esp32Router, io: esp32Io } = require('./routes/esp32'); // Update the path accordingly
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('ejs', ejs);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));

// Routes
app.use(require('./routes/login'));
app.use(require('./routes/register'));
app.use(require('./routes/index'));
app.use(require('./routes/logout'));

// Include the new ESP32 route and WebSocket server
app.use(esp32Router);

// Start HTTP server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Attach the WebSocket server to the HTTP server
esp32Io.attach(server);
