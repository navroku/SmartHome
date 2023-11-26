const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs-mate');
const http = require('http');
const mqttHandler = require('./routes/mqttHandler');
const controllableLedRouter = require('./routes/devices/controllable_led');
const deviceListRouter = require('./routes/devices/device_list');
const socketIO = require('socket.io');
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
// Use the MQTT handler for all routes in the devices folder
app.use('/devices/controllable-led', controllableLedRouter);
app.use('/devices/device-list', deviceListRouter);

// Start HTTP server
const server = http.createServer(app);
const io = socketIO(server);

// Initialize Socket.io for the controllable LED router
controllableLedRouter.initializeSocketIO(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
