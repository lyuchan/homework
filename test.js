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
            })
        }, 50)
    }, 50)

}


function buffertofloat32(buffer, fixed) {
    return parseFloat((buffer.readFloatBE(0)).toFixed(fixed));
}