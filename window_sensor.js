/* ========================= BLE Stuff ============================== */
const DEVICE_NAME = "WND_SNS_01";
const TX_POWER_LVL = 4;
const BLE_ADVERTISE_INTERVAL_MS = 600;
const DATA_REPORT_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes
/* ================================================================== */

/* ========================= 433MHz Transmitter ============================== */
const RADIO_DATA_PIN = 5;
const REED_SENSOR_PIN = 6;
const REED_SWITCH_DEBOUNCE_MS = 50;
const PROTOCOL_NUMBER = 1;
const REPEATS = 20;
const GROUP_ID = "11110";
const DEVICE_ID = "10000";

var rf433 = require("RcSwitch").connect(PROTOCOL_NUMBER, RADIO_DATA_PIN, REPEATS);
/* =========================================================================== */

const LOW = 0;
const HIGH = 1;


function getSensorState() {
  return digitalRead(REED_SENSOR_PIN);
}

function rf433Sleep() {
  const DATA_PIN_PULSE_MS = 10;

  digitalPulse(RADIO_DATA_PIN, HIGH, DATA_PIN_PULSE_MS);
}

function getBatteryPercentage() {
  const MAX_BATT_VOLTAGE = 3.0;

  var battLvlPercentage = Math.round((NRF.getBattery()/MAX_BATT_VOLTAGE) * 100);

  return E.clip(battLvlPercentage, 0, 100);
}

function updateBLEAdvertisingData(state) {
  NRF.setAdvertising({
      0xCACA: [getBatteryPercentage(), getSensorState()]
    },
    {
      name: DEVICE_NAME,
      interval: BLE_ADVERTISE_INTERVAL_MS
    });
}

function onInit() {
  rf433Sleep();

  NRF.setTxPower(TX_POWER_LVL);

  // advertise initial readings at start up
  updateBLEAdvertisingData();

  // advertise readings periodically
  setInterval(function() {
    updateBLEAdvertisingData();
  }, DATA_REPORT_INTERVAL_MS);

  // magnetic switch watcher
  setWatch(function(e) {
    if (e.state == LOW) {
      rf433.switchOn(GROUP_ID, DEVICE_ID);
    }

    if (e.state == HIGH) {
      rf433.switchOff(GROUP_ID, DEVICE_ID);
    }

    rf433Sleep();

    updateBLEAdvertisingData();
  }, REED_SENSOR_PIN, { repeat: true, edge: 'both', debounce: REED_SWITCH_DEBOUNCE_MS });
}

