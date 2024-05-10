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


var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();
// open connection to a serial port
client.connectRTUBuffered("COM8", { baudRate: 9600 }, write);
let i = 0;
function write() {
    client.setID(1);
    //read();
    setInterval(read, 1000);
}
let v, a, w;
function read() {
    client.readHoldingRegisters(0, 2).then((data) => {
        v = buffertofloat32(data.buffer, 2);
    })
    setTimeout(() => {
        client.readHoldingRegisters(0x0004, 2).then((data) => {

            a = buffertofloat32(data.buffer, 3);

        })
        setTimeout(() => {
            client.readHoldingRegisters(0x0006, 2).then((data) => {

                w = buffertofloat32(data.buffer, 3);
                console.log(`V:${v} A:${a}  W:${w}`)
                send(JSON.stringify({ v: v, i: a, p: w }))
            })
        }, 50)
    }, 50)

}


function buffertofloat32(buffer, fixed) {
    return parseFloat((buffer.readFloatBE(0)).toFixed(fixed));
}