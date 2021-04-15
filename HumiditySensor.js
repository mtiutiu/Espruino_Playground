/* ===================== BLE Stuff ============================= */
const DEVICE_NAME = "SMS_BK_01";
const TX_POWER_LVL = 4;
const BLE_ADVERTISE_INTERVAL_MS = 600;
const DATA_REPORT_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes
/* ============================================================= */

/* ======================== Humidity Sensor ==================== */
const HUMIDITY_SENSOR_ANALOG_PIN = 5;
const HUMIDITY_SENSOR_PWR_PIN = 6;
const HUMIDITY_SENSOR_AIR_VALUE = 0.7;
const HUMIDITY_SENSOR_WATER_VALUE = 0.35;
/* ============================================================= */

const LOW = 0;
const HIGH = 1;


function map(value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function getHumidityPercentage() {
  const SAMPLES = 100;
  var sensorData = 0.0;
  var humidityPercentage = 0;

  digitalWrite(HUMIDITY_SENSOR_PWR_PIN, HIGH);
  for (var i = 0; i < SAMPLES; i++) {
    sensorData += (analogRead(HUMIDITY_SENSOR_ANALOG_PIN)) / SAMPLES;
  }
  digitalWrite(HUMIDITY_SENSOR_PWR_PIN, LOW);

  humidityPercentage = Math.round(map(sensorData, HUMIDITY_SENSOR_AIR_VALUE, HUMIDITY_SENSOR_WATER_VALUE, 0, 100));

  return E.clip(humidityPercentage, 0, 100);
}

function getBatteryPercentage() {
  const MAX_BATT_VOLTAGE = 3.0;
  
  var battLvlPercentage = Math.round((NRF.getBattery()/MAX_BATT_VOLTAGE) * 100);

  return E.clip(battLvlPercentage, 0, 100);
}

function updateBLEAdvertisingData() {
  NRF.setAdvertising({
      0xCACA: [getBatteryPercentage(), getHumidityPercentage()]
    },
    {
      name: DEVICE_NAME,
      interval: BLE_ADVERTISE_INTERVAL_MS
    });
}

function onInit() {
  NRF.setTxPower(TX_POWER_LVL);

  // advertise initial readings at start up
  updateBLEAdvertisingData();

  // advertise readings periodically
  setInterval(function() {
    updateBLEAdvertisingData();
  }, DATA_REPORT_INTERVAL_MS);
}
