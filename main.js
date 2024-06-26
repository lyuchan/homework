//https://www.adtek.com.tw/uploads/product_download/tw/A23-01-MWH-7A-Manual-TC-V15-240221.pdf
let baudRate = 9600//讀取速率
let id = 1//站號
let loopdelay = 250//循環讀取延遲(為0則只讀取一次)
let relay = true//開關

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
//poweroutput(relay)    0x0209      INT16U      1

function read() {
    client.readHoldingRegisters(0x0000, 2).then((data) => {
        console.log(`v is :${buffertofloat32(data.buffer, 2)}`)
    }).then(() => {
        client.readHoldingRegisters(0x0004, 2).then((data) => {
            console.log(`a is :${buffertofloat32(data.buffer, 2)}`)
        }).then(() => {
            client.readHoldingRegisters(0x0014, 2).then((data) => {
                console.log(`f is :${buffertofloat32(data.buffer, 2)}`)
            }).then(() => {
                client.readHoldingRegisters(0x0012, 2).then((data) => {
                    console.log(`pf is :${buffertofloat32(data.buffer, 2)}`)
                })
            })
        })
    })
}


function buffertofloat32(buffer, fixed) {
    return parseFloat((buffer.readFloatBE(0)).toFixed(fixed));
}

function write() {
    if (relay) {
        client.writeRegister(0x0209, 0x00);
    } else {
        client.writeRegister(0x0209, 0x10);
    }

}


