// socketIOHandler.js
const socketIO = require('socket.io');

let io; 

function initializeSocketIO(httpServer) {
  io = socketIO(httpServer);

  io.on('connection', (socket) => {
    console.log('Socket.io connection established.');
  });
}

function emitColorUpdate(currentColors) {
  io.emit('color-update', currentColors);
}

function emitTemperatureHumidityUpdate(data) {
  if (io) {
    io.emit('temperature_humidity-update', data);
  }
}

function emitDeviceListUpdate(devices) {
  if (io) {
    io.emit('device-list-update', devices);
  }
}

module.exports = {
  initializeSocketIO,
  emitColorUpdate,
  emitTemperatureHumidityUpdate,
  emitDeviceListUpdate,
};
