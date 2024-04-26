import serial
import modbus_tk as tk
import modbus_tk.defines as cst
import modbus_tk.modbus_rtu as modbus_rtu

mbport = serial.Serial('COM1')
master = modbus_rtu.RtuMaster(mbport)
result = master.execute(4,cst.READ_INPUT_REGISTERS,0x0000,2)

print(result)
