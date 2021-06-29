import cloneDeep from "lodash/cloneDeep";
import isFunction from "lodash/isFunction";
import isEqual from "lodash/isEqual";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import find from "lodash/find";
import trim from "lodash/trim";
import concat from "lodash/concat";
import debounce from "lodash/debounce";
import noop from "lodash/noop";

import EventEmitter from "event-emitter";

import WebRtcUtil from "./webrtc.js";

import LocalStorage from "@cma/localstorage";

export const StorageKeys = {
  SELECTED_CAMERA: "@cma/media/devices/SELECTED_CAMERA",
  SELECTED_MICROPHONE: "@cma/media/devices/SELECTED_MICROPHONE",
};

const state = {
  cameras: [],
  microphones: [],
  selectedCamera: null,
  selectedMicrophone: null,
  isReady: false,
  _deviceChangeEventHandler: noop,
};

export const Events = {
  CHANGE_SELECTED_DEVICES: "devices:change:inputdevices",
  CHANGE_AVAILABLE_DEVICES: "devices:change:devicelist",
  READY: "devices:ready",
};

const emitter = EventEmitter({
  selectCamera(cam) {
    const camera = find(state.cameras, { id: cam.id });
    if (!isEqual(camera, state.selectedCamera)) {
      state.selectedCamera = camera;

      if (state.selectedCamera) {
        LocalStorage.setStorageVariable(StorageKeys.SELECTED_CAMERA, camera);
      }

      this.emit(Events.CHANGE_SELECTED_DEVICES, {
        camera,
        microphone: state.selectedMicrophone,
        isCameraChanged: true,
        isMicrophoneChanged: false,
      });
    }
  },

  selectMicrophone(mic) {
    const microphone = find(state.microphones, { id: mic.id });
    if (!isEqual(microphone, state.selectedMicrophone)) {
      state.selectedMicrophone = microphone;

      if (state.selectedMicrophone) {
        LocalStorage.setStorageVariable(StorageKeys.SELECTED_MICROPHONE, mic);
      }

      this.emit(Events.CHANGE_SELECTED_DEVICES, {
        camera: state.selectedCamera,
        microphone,
        isCameraChanged: false,
        isMicrophoneChanged: true,
      });
    }
  },

  // Switches to the next camera in the list. Used for mobile camera selection
  switchToNextCamera() {
    const currentCamera = state.selectedCamera;

    const switchableCameras = state.cameras.filter(
      (cam) => !cam.wasAddedByMediaLib
    );
    if (!switchableCameras.length) {
      return;
    }

    let nextCamera = switchableCameras[0];

    if (
      currentCamera &&
      !(currentCamera.wasAddedByMediaLib && currentCamera.id === "none")
    ) {
      const nextCameraIndex =
        switchableCameras.findIndex((cam) => cam.id === currentCamera.id) + 1;

      if (switchableCameras.length > nextCameraIndex) {
        nextCamera = switchableCameras[nextCameraIndex];
      }
    }

    this.selectCamera(nextCamera);
  },

  getSelectedCamera() {
    return cloneDeep(state.selectedCamera);
  },

  getSelectedMicrophone() {
    return cloneDeep(state.selectedMicrophone);
  },

  getCameraList() {
    return cloneDeep(state.cameras);
  },

  getMicrophoneList() {
    return cloneDeep(state.microphones);
  },

  ready() {
    if (state.isReady) {
      return;
    }
    state.isReady = true;
    this.emit(Events.READY);
  },

  isReady() {
    return state.isReady;
  },

  start() {
    this.updateDeviceLists();
    state._deviceChangeEventHandler = debounce(
      this.updateDeviceLists.bind(this),
      100
    );
    if (isFunction(navigator.mediaDevices.addEventListener)) {
      navigator.mediaDevices.addEventListener(
        "devicechange",
        state._deviceChangeEventHandler
      );
    } else {
      navigator.mediaDevices.ondevicechange = state._deviceChangeEventHandler;
    }
  },

  stop() {
    if (isFunction(navigator.mediaDevices.removeEventListener)) {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        state._deviceChangeEventHandler
      );
    } else {
      navigator.mediaDevices.ondevicechange = null;
    }
  },

  updateDeviceLists() {
    const self = this;
    return WebRtcUtil.enumerateDevices().then(function (deviceList) {
      const devicesByKind = groupBy(deviceList, "kind");

      const cameras = createDeviceList(devicesByKind["videoinput"]);
      const microphones = createDeviceList(devicesByKind["audioinput"]);

      state.cameras = cameras;
      state.microphones = microphones;

      // We must still trigger this if only the names changed so that the UI updates the names appropriately
      self.emit(Events.CHANGE_AVAILABLE_DEVICES, {
        cameras: cloneDeep(state.cameras),
        microphones: cloneDeep(state.microphones),
      });

      refreshSelectedDevices();

      self.ready();
      return Promise.resolve();
    });
  },
});

function createDeviceList(enumeratedDeviceList) {
  if (!enumeratedDeviceList || enumeratedDeviceList.length === 0) {
    return [];
  }

  const devices = map(enumeratedDeviceList, (device, index) => {
    return {
      id: device.deviceId,
      displayName: trim(device.label) || index + 1,
    };
  });

  return concat(
    {
      id: "none",
      displayName: null,
      wasAddedByMediaLib: true,
    },
    devices
  );
}

function findMatchingDevice(device, deviceList) {
  if (!device) {
    return null;
  }
  return (
    find(deviceList, { id: device.id }) ||
    find(deviceList, { displayName: device.displayName })
  );
}

// Returns whether or not the selected device changed. Returns false if only its name has changed,
// to avoid a double permissions request in Firefox and to stop Safari from getting confused
function refreshSelectedDevice(deviceProperty, deviceList, storageKey) {
  const storedSelection = findMatchingDevice(
    LocalStorage.getStorageVariable(storageKey),
    deviceList
  );

  const current =
    state[deviceProperty] && find(deviceList, { id: state[deviceProperty].id });

  if (storedSelection && storedSelection !== current) {
    state[deviceProperty] = storedSelection;
    return true;
  }

  if (current) {
    return false;
  }

  // At this point, we don't have a valid selected device, so we choose either the default one (defined by the
  // browser), the second device in the devices list (because the first is "No Camera" / "No Microphone"), or null
  const oldValue = state[deviceProperty];
  state[deviceProperty] =
    find(deviceList, { id: "default" }) ||
    (deviceList.length > 1 && deviceList[1]) ||
    null;

  return state[deviceProperty] !== oldValue;
}

function refreshSelectedCamera() {
  return refreshSelectedDevice(
    "selectedCamera",
    state.cameras,
    StorageKeys.SELECTED_CAMERA
  );
}

function refreshSelectedMicrophone() {
  return refreshSelectedDevice(
    "selectedMicrophone",
    state.microphones,
    StorageKeys.SELECTED_MICROPHONE
  );
}

function refreshSelectedDevices() {
  const hasCameraChanged = refreshSelectedCamera();
  const hasMicrophoneChanged = refreshSelectedMicrophone();

  if (hasCameraChanged || hasMicrophoneChanged) {
    emitter.emit(Events.CHANGE_SELECTED_DEVICES, {
      camera: state.selectedCamera,
      microphone: state.selectedMicrophone,
      isCameraChanged: hasCameraChanged,
      isMicrophoneChanged: hasMicrophoneChanged,
    });
  }
}

export default emitter;
