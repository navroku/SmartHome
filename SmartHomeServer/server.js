// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs-mate');
const http = require('http');
const mqttHandler = require('./routes/mqttHandler');
const deviceListRouter = require('./routes/deviceList');
const temperatureHumidityRouter = require('./routes/devices/temperature_humidity');
const controllableLedRouter = require('./routes/devices/controllable_led');
const socketIOHandler = require('./routes/socketioHandler');
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
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/font', express.static(__dirname + '/node_modules/bootstrap-icons/font'));
// Routes
app.use(require('./routes/login'));
app.use(require('./routes/register'));
app.use(require('./routes/index'));
app.use(require('./routes/logout'));
// Mount the deviceListRouter at the specified path
app.use('/devices', deviceListRouter);

// Start HTTP server
const server = http.createServer(app);

// Initialize Socket.io for the controllable LED and temperature/humidity routers
socketIOHandler.initializeSocketIO(server);


// Use the MQTT handler for all routes in the devices folder
app.use('/devices/controllable-led', controllableLedRouter);
app.use('/device-list', deviceListRouter);
app.use('/devices/temperature_humidity', temperatureHumidityRouter);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
