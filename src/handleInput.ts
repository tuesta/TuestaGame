import * as P from "peerjs";

import * as API from "./apiType"

type Movement
    = {type: "left"}
    | {type: "right"}
    | {type: "up"}
    | {type: "down"}

export function setupHandleInput(callbackMovement: (m: Movement) => void) {
    const pc = new P.Peer("b9bc559f-dd20-4e17-8b44-d4b9074eaff8", {
        host: location.hostname,
        port: 3000,
        path: '/peerjs',
        debug: 1,
    });

    pc.on('open', (id) => {
        console.log(`PC listo con ID: ${id}`);
    });

    pc.on('connection', (conn: P.DataConnection) => {
        console.log('Móvil intentando conectar');

        conn.on('data', dataRAW => {
            if (dataRAW === -1) { console.log("-1") }

            const data = dataRAW as API.MobileMessage

            switch (data) {
                case API.MobileMessage.MobileReady:
                    console.log('Móvil listo, enviando START');
                    API.sendMessageToMobil(conn, API.PCMessage.Start)
                    console.log('Enviado START al móvil');
                    return;
                case API.MobileMessage.Up:
                    callbackMovement({type:"up"})
                    return;
                case API.MobileMessage.Down:
                    callbackMovement({type:"down"})
                    return;
                case API.MobileMessage.Left:
                    callbackMovement({type:"left"})
                    return;
                case API.MobileMessage.Right:
                    callbackMovement({type:"right"})
                    return;
                case API.MobileMessage.Test:
                    console.log("0")
                    return;

            }
        });

        conn.on('open', () => {
            console.log('Conexión abierta con móvil');
        });

        conn.on('error', (err) => {
            console.error('connection error:', err);
        });
    });
}
