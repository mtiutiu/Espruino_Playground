const TX_POWER_LVL = 4;
const BLE_ADVERTISE_INTERVAL_MS = 600;
const DEVICE_NAME = "TempSens";
const DATA_REPORT_INTERVAL_MS = 30000;


function onInit() {
  I2C1.setup({
    scl: 19,
    sda: 20
  });
  var htu = require('HTU21D').connect(I2C1);
  htu.setResolution(htu.RH_8_BITS_TEMP_12_BITS);

  NRF.setTxPower(TX_POWER_LVL);


  setInterval(function() {
    var batteryLvl = E.clip(Math.round((NRF.getBattery()/3.0) * 100), 0, 100);
    var temperature = htu.readTemperature();
    var humidity = htu.readHumidity();

    NRF.setAdvertising({
        0x180F: batteryLvl,
        0x2A6E: temperature,
        0x2A6F: humidity
      },
      {
        name: DEVICE_NAME,
        interval: BLE_ADVERTISE_INTERVAL_MS
     });
  }, DATA_REPORT_INTERVAL_MS);
}
