// Add to your HTML head
<script src="https://sdk.amazonaws.com/js/aws-sdk-2.1.12.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js"></script>

// Replace the simulated connection with real AWS IoT
function connectToAWS() {
    const client = new Paho.MQTT.Client(
        'a28vm0dgr18gwe-ats.iot.eu-north-1.amazonaws.com',
        443,
        'clientId' + Math.random()
    );
    
    client.onMessageArrived = function(message) {
        const data = JSON.parse(message.payloadString);
        updateSensorValues(data.humidity, data.temperature);
    };
    
    client.connect({
        useSSL: true,
        onSuccess: function() {
            client.subscribe('iotfrontier/pub');
            updateStatus('connected', '✅ Connected to AWS IoT Core');
        }
    });
}