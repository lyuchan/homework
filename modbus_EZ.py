import serial
import modbus_tk.defines as cst
import modbus_tk.modbus_rtu as rtu
import struct
import time

#建立Modbus的連線
serial_conn = rtu.RtuMaster(serial.Serial('/dev/ttyS0',115200))
serial_conn.set_timeout(5)
serial_conn.set_verbose(True)

#擷取資料的函數
def get_data(address):
    tmp = serial_conn.execute(3,cst.READ_HOLDING_REGISTERS,address,2)
    time.sleep(0.001)
    return round(struct.unpack('>f', struct.pack('>HH', tmp[0], tmp[1]))[0],2)

def send_data(address,data):
    serial_conn.execute(3,cst.WRITE_SINGLE_REGISTER,address,output_value=data)
    time.sleep(0.001)

print('電壓: ' + str(get_data(0x0000)) + 'V')
print('電流: ' + str(get_data(0x0004)) + 'A')
print('有效功率: ' + str(get_data(0x0006)) + 'W')
print('頻率: ' + str(get_data(0x0014)) + 'Hz')
