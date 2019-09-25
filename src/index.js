import { Controller } from 'zigbee-herdsman'
import zigbeeShepherdConverters from 'zigbee-shepherd-converters'

const ZIGBEE_DEVICE_PATH = '/dev/tty.usbmodem14101'

async function connectDevice(controller) {
  await controller.start()
  await controller.permitJoin(true)
}

const controller = new Controller({
  databasePath: '../device-db.json',
  serialPort: { 
    path: ZIGBEE_DEVICE_PATH 
  }
})

controller.on('message', (event) => {
  const deviceModel = zigbeeShepherdConverters.findByZigbeeModel(event.device.modelID)

  if ('attributeReport' === event.type && deviceModel.fromZigbee) {
    const triggered = deviceModel.fromZigbee
      .filter(converter => converter.cid === event.cluster && 'devChange' !== converter.type)
      .map(converter => converter.convert(deviceModel, { ...event, data: event })) // TODO: figure out the `msg` format.

    console.log(triggered)
  }
})

connectDevice(controller)