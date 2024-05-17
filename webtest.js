const express = require("express");
const WebSocket = require('ws');
const app = express();
const server = app.listen(8080, () => {
    console.log("Application started and Listening on port 8080");
});
app.use(express.static(__dirname + "/web"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/web/index.html");
});
const wss = new WebSocket.Server({ server });
// 監聽WebSocket連線
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        let data = JSON.parse(message)
        if (data.get == "open") {
            // write the values 0, 0xffff to registers starting at address 5
            // on device number 1.
            client.writeRegisters(0x0209, [0x10])
        } else if (data.get == "colse") {
            // write the values 0, 0xffff to registers starting at address 5
            // on device number 1.
            client.writeRegisters(0x0209, [0])
        }
    });
    // 斷開WebSocket連線
    ws.on('close', () => {
    });
});
function send(data) {
    let clients = wss.clients;
    clients.forEach((client) => {
        client.send(data);//回去的資料
    });
}
