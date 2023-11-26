const mqtt = require('mqtt');
const mqttBroker = 'mqtt://broker.hivemq.com'; // Replace with your MQTT broker URL
const mqttPort = 1883; // Replace with your MQTT broker port

const mqttClient = mqtt.connect(`${mqttBroker}:${mqttPort}`);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    // Set up any initial subscriptions or logic here
});

module.exports = {
    mqttClient,
    publish: (topic, message) => {
        mqttClient.publish(topic, message);
    }
};
