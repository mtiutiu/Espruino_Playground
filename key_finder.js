const DEVICE_NAME = 'Key_Finder';
const ADVERTISING_INTERVAL_MS = 320;
const TX_POWER_LVL_DB = 4;
const BLE_CONNECTION_INTERVAL_MS = 750;
const BATTERY_UPDATE_INTERVAL_MS = 60000;
const UART_DISABLE_TIMEOUT_MS = 120000;

const DEVICE_BLE_SERVICES = {
  // alert service and characteristics
  0x1802: {
    0x2A06: {
      value : 0,
      maxLen : 1,
      readable : true,
      writable : true,
      onWrite : function(evt) {
        triggerAlarm(evt.data[0]);
      }
    }
  },
  // battery service and characteristics
  0x180F: {
    0x2A19: {
      value : getBattLvl(),
      maxLen : 1,
      readable : true,
      notify : true,
    }
  }
};

function getBattLvl() {
  return E.clip(Math.round((NRF.getBattery()/3.0) * 100), 0, 100);
}

function triggerAlarm(triggerLevel) {
  switch(triggerLevel) {
    case 0x00:
      digitalWrite(D28, LOW);
      break;
    case 0x01:
      analogWrite(D28, 0.5, { freq : 1, soft: true });
      break;
    case 0x02:
      analogWrite(D28, 0.5, { freq : 3, soft: true });
      break;
    default:
  }
}

function setBluetoothStuff() {
  NRF.setTxPower(TX_POWER_LVL_DB);
  NRF.setConnectionInterval(BLE_CONNECTION_INTERVAL_MS);

  // advertising
  NRF.setAdvertising({}, {
      name: DEVICE_NAME,
      interval: ADVERTISING_INTERVAL_MS
  });

  // services and characteristics
  NRF.setServices(DEVICE_BLE_SERVICES);

  // update battery level on a regular basis
  setInterval(function() {
    NRF.updateServices({
      0x180F : {
        0x2A19 : {
          value : getBattLvl()
        }
      }
    });
  }, BATTERY_UPDATE_INTERVAL_MS);
}

function onInit() {
  setBluetoothStuff();

  // disable the BLE UART console after a while
  setTimeout(function() {
    NRF.setServices(DEVICE_BLE_SERVICES, { uart: false });
  }, UART_DISABLE_TIMEOUT_MS);
}
