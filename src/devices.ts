import DeviceItem from "./deviceItem";

export class Devices {
    devices:{[key: string]: DeviceItem} = {}

    getDevices() {
        return navigator.mediaDevices.enumerateDevices()
        .then((devicesList) => {
            devicesList.forEach((device: MediaDeviceInfo) => {
                this.devices[device.deviceId] = new DeviceItem(device);
            })
            return devicesList;
        })
    }
}