// routes/mqttHandler.js
const mqtt = require('mqtt');
const mqttBroker = 'mqtt://broker.hivemq.com'; 
const mqttPort = 1883; 

const mqttClient = mqtt.connect(`${mqttBroker}:${mqttPort}`);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
});

module.exports = {
    mqttClient,
    publish: (topic, message) => {
        mqttClient.publish(topic, message);
    }
};
