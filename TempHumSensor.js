const TX_POWER_LVL = 4;
const BLE_ADVERTISE_INTERVAL_MS = 600;
const DEVICE_NAME = "THS";
const DATA_REPORT_INTERVAL_MS = 30000;

var isConnectable = true;
var isScannable = true;

function encodeFloat(num, precision) {
  var d = Math.round(num.toFixed(precision) * 100);
  return [ d & 255, d >> 8 ];
}

function sendData(sensor) {
  var batteryLvl = E.clip(Math.round((NRF.getBattery()/3.0) * 100), 0, 100);
  var temperature = sensor.readTemperature();
  var humdity = sensor.getCompensatedHumidity(sensor.readHumidity(), temperature);


  NRF.setAdvertising({
      0x180F: batteryLvl,
      0x2A6E: encodeFloat(temperature, 1), // ble cannot advertise floats directly (must be "endcoded" in an array)
      0x2A6F: encodeFloat(humdity, 1) // ble cannot advertise floats directly (must be "endcoded" in an array)
    },
    {
      name: DEVICE_NAME,
      interval: BLE_ADVERTISE_INTERVAL_MS,
      connectable: isConnectable,
      scannable: isScannable
  });
}

function onInit() {
  I2C1.setup({
    scl: 19,
    sda: 20
  });
  var htu = require('HTU21D').connect(I2C1);
  htu.setResolution(htu.RH_8_BITS_TEMP_12_BITS);

  NRF.setTxPower(TX_POWER_LVL);

  // disable uart service and connectivity after one minute
  setTimeout(function() {
    NRF.setServices({}, {uart: false});
    isConnectable = false;
    isScannable = false;
  }, 60000);

  sendData(htu); // advertise initial readings at start up

  // advertise readings periodically
  setInterval(function() {
    sendData(htu);
  }, DATA_REPORT_INTERVAL_MS);
}
