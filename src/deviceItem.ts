enum DeviceState {
  ACTIVE= 1,
  INACTIVE =0
}

export default class DeviceItem {
    device: MediaDeviceInfo
    state: DeviceState
    addedTime: string // can we add timestamp
    updatedTime: string // can we 

    constructor(device: MediaDeviceInfo){
        this.device = device
        this.state = DeviceState.INACTIVE;
        this.addedTime = Date.now().toLocaleString();
        this.updatedTime = Date.now().toLocaleString();
    }
}