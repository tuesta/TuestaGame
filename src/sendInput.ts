import * as P from "peerjs";

import * as API from "./apiType"

import { LinearAccelerationSensorManager } from "./linearAcceleration"
import { Classifier } from "./HaskellWay/classifier";

const streamTransform = new Classifier();

let sendData: boolean = false;
let connection: P.DataConnection | null  = null;
let test: number = 0;

const sensorManager = new LinearAccelerationSensorManager({
    frequency: 100,
    onReading: readings => {
        if (!sendData || !connection) {return}
        
        const event = streamTransform.classifier(readings);

        if (event) {API.sendMessageToPC(connection, event);}
        if (readings.timestamp - test > 300 && event === null) {
            API.sendMessageToPC(connection, API.MobileMessage.Test)
        }
    },
});

try {
    await sensorManager.start();
} catch (error) {
    console.error('Error:', error);
}

const mobile = new P.Peer({
    host: location.hostname,
    port: 3000,
    debug: 1,
    path: '/peerjs',
});

mobile.on('open', () => {
    conectar();
});

function conectar() {
    const pcID = "b9bc559f-dd20-4e17-8b44-d4b9074eaff8";
    const conn: P.DataConnection = mobile.connect(pcID);

    connection = conn;

    conn.on('open', () => {
        API.sendMessageToPC(conn, API.MobileMessage.MobileReady)
    });

    conn.on('data', dataRAW => {
        const data = dataRAW as API.PCMessage
        switch (data) {
            case API.PCMessage.Start:
                sendData = true;
                return;
        }
    });

    conn.on('error', (err) => {
        console.error('Connection error:', err);
    });

    conn.on('close', () => {});
}
