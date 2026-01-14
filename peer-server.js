import express from "express"
import * as http from "http"
import * as path from "path"
import { ExpressPeerServer } from "peer"
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || "3000";

const peerServer = ExpressPeerServer(server, {
  proxied: true,
  debug: true,
  path: "/peerjs",
  allow_discovery: true,
  concurrent_limit: 100, // Aumentar límite
  alive_timeout: 0, // Sin timeout
  ssl: {},
});

app.use(peerServer);

app.use(express.static(path.join(__dirname + "/dist")));

app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/index.html`);
});

server.listen(port);
console.log(`Listening on: ${port}`);
