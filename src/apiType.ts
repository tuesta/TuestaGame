import * as P from "peerjs";

export enum MobileMessage {
  MobileReady,
  Up,
  Down,
  Left,
  Right,
  Test,
}

export enum PCMessage {
    Start,
    Test
}

export function sendMessageToMobil(conn: P.DataConnection, message: PCMessage) {
    conn.send(message);
    return;
}

export function sendMessageToPC(conn: P.DataConnection, message: MobileMessage) {
    conn.send(message);
    return;
}
