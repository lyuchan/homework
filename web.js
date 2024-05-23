require('dotenv').config();//環境變數
const express = require("express");
const WebSocket = require('ws');
const { Client, middleware } = require('@line/bot-sdk');//line bot
const line = require('@line/bot-sdk');
const app = express();
const server = app.listen(8080, () => {
    console.log("Application started and Listening on port 8080");
});
app.use(express.static(__dirname + "/web"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/web/index.html");
});
let v, a, w, f, sw, swflag;
const wss = new WebSocket.Server({ server });
// ??WebSocket???
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        let data = JSON.parse(message)
        if (data.get == "open") {
            sw = true;
        } else if (data.get == "colse") {
            sw = false;
        }
    });
    ws.on('close', () => {
    });
});
function send(data) {
    let clients = wss.clients;
    clients.forEach((client) => {
        client.send(data);
    });
}

let baudRate = 9600//讀取速率
let id = 1//站號
let loopdelay = 250//循環讀取延遲(為0則只讀取一次)

var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();
client.connectRTUBuffered("/dev/ttyS0", { baudRate: baudRate }, write);
client.setID(id);
if (loopdelay == 0) {
    read()
} else {
    setInterval(read, loopdelay);
}

//name                  address     type        長度
//votage                0x0000      FLOAT32     2
//current               0x0004      FLOAT32     2
//frequency             0x0014      FLOAT32     2
//pf                    0x0012      FLOAT32     2
//w                     0x0006      FLOAT32     2
//poweroutput(relay)    0x0209      INT16U      1

function read() {
    client.readHoldingRegisters(0x0000, 2).then((data) => {
        v = buffertofloat32(data.buffer, 2)
    }).then(() => {
        client.readHoldingRegisters(0x0004, 2).then((data) => {
            a = buffertofloat32(data.buffer, 2)
        }).then(() => {
            client.readHoldingRegisters(0x0014, 2).then((data) => {
                f = buffertofloat32(data.buffer, 2)
            }).then(() => {
                client.readHoldingRegisters(0x0006, 2).then((data) => {
                    w = buffertofloat32(data.buffer, 2)
                }).then(() => {
                    client.readHoldingRegisters(0x0209, 1).then((data) => {
                        swflag = data.buffer[1];
                        console.log(`V:${v} A:${a} W:${w} F:${f}`)
                        send(JSON.stringify({ v: v, i: a, p: w, f: f, sw: swflag }))
                    }).then(() => {
                        if (sw) {
                            client.writeRegisters(0x0209, [0x10])
                        } else {
                            client.writeRegisters(0x0209, [0])
                        }
                    })
                })
            })
        })
    })
}


function buffertofloat32(buffer, fixed) {
    return parseFloat((buffer.readFloatBE(0)).toFixed(fixed));
}



const lineConfig = {
    channelAccessToken: process.env["CHANNEL_ACCESS_TOKEN"],
    channelSecret: process.env["CHANNEL_SECRET"]
};
const client = new Client(lineConfig);
app.post('/linebotwebhook', middleware(lineConfig), async (req, res) => {
    try {
        let result = await req.body.events.map(handleEvent);
        res.json(result);
    }
    catch (err) {
        console.log(err);
    }
});

const handleEvent = (event) => {
    switch (event.type) {
        case 'join': //這隻機器人加入別人的群組
            break;
        case 'follow': //追蹤這隻機器人
            break;
        case 'message': //傳訊息給機器人
            switch (event.message.type) {
                case 'text':
                    try {
                        let resText;
                        switch (event.message.text) {
                            case '/uuid':
                                resText = `uuid is:${event.source.userId}`;
                                break;
                            case 'test':
                                resText = `測試`;
                                break;
                            case '目前電壓':
                                resText = `目前電壓為:${v}福特`
                                break;
                            case '目前電流':
                                resText = `目前電流為:${a}安培`
                                break;
                            case '目前功率':
                                resText = `目前功率為:${w}瓦特`
                                break;
                            case '目前頻率':
                                resText = `目前頻率為:${f}赫茲`
                                break;
                            case '開啟':
                                if (sw) {
                                    resText = `目前已經是開啟了`
                                } else {
                                    sw = true;
                                    resText = `幫你開啟了`
                                }
                                break;
                            case '關閉':
                                if (sw == false) {
                                    resText = `目前已經是關閉了`
                                } else {
                                    sw = false;
                                    resText = `幫你關閉了`
                                }
                                break;
                            default:
                                resText = '我不太清楚你再說什麼';
                        }
                        return client.replyMessage(event.replyToken, {
                            type: 'text',
                            text: resText
                        });
                    } catch (err) {
                        console.log(err)
                    }
                    break;
                case 'sticker':
                    // do sth with sticker
                    return
            }
    }
}


