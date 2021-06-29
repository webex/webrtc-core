import _ from 'lodash';
import EventEmitter from 'event-emitter';

import { isMobile, getBrowser } from '@cma/browser';
import LocalStorage from '@cma/localstorage';
import * as Logger from '@cma/logger';

import { PermissionState, JoinFailReason } from './media-constants.js';

import WebRTC from './webrtc.js';

import DeviceManager, {Events as DeviceManagerEvents} from './devices.js';
import AudioMonitor from './audioMonitor.js';

const USER_MEDIA_RELEASE_DELAY_MS = 3500;
const WEBRTC_GET_USER_MEDIA_DELAY_MS = 25;

const StorageKeys = {
  HD_MODE: '@cma/media/user_media/HD_MODE',
};

function getStoredHDMode() {
  const storedMode = LocalStorage.getStorageVariable(StorageKeys.HD_MODE);
  if (storedMode) {
    return true;
  } else if (storedMode === false) {
    return false;
  } else {
    // The default is different depending on desktop vs mobile
    return isMobile() ? false : true;
  } 
}

// PRIVATE MEMBERS
const UserMediaState = {
  permissionState: {camera: PermissionState.UNKNOWN, microphone: PermissionState.UNKNOWN},
  userMediaUsers: [],
  isUserMediaEnabled: false,
  resolveWhenRequestDone: [],
  localMutableStream: null,
  localStream: null,
  requestQueue: null,
  lastRequest: null,
  hasAudio: false,
  hasVideo: false,
  audioEnabled: false,
  videoEnabled: false,
  audioMuted: false,
  videoMuted: false,
  settingsListenerInterval: 0,
  isStarted: false,
  isHDEnabled: getStoredHDMode(),
};

let audioMonitor;

export const Events = {
  CHANGE_MICLEVEL: 'change:miclevel',
  CHANGE_MICLEVEL_SUPPORT: 'change:miclevel:support',
  CHANGE_LOCALSTREAM: 'change:localStream',
  CHANGE_LOCALSTREAM_SETTINGS: 'change:localStream:settings',
  CHANGE_USER_MEDIA_PERMISSIONS: 'change:permissions:userMedia',
};

const emitter = EventEmitter({
  requestUserMedia,
  releaseUserMedia,
  getLocalStream,
  setAudioMute,
  setVideoMute,
  setHDEnabled,
  isVideoMuted() {
    return !isEnabled() || !UserMediaState.videoEnabled || UserMediaState.videoMuted;
  },
  isAudioMuted() {
    return !isEnabled() || !UserMediaState.audioEnabled || UserMediaState.audioMuted;
  },
  isHDEnabled() {
    return UserMediaState.isHDEnabled;
  },
  hasAudio() {
    return UserMediaState.hasAudio;
  },
  hasVideo() {
    return UserMediaState.hasVideo;
  },
  start() {
    const self = this;
    DeviceManager.on(DeviceManagerEvents.CHANGE_SELECTED_DEVICES, function handleDeviceChange() {
      if (UserMediaState.isUserMediaEnabled) {
        handleUserMediaOptions({
          camera: DeviceManager.getSelectedCamera(),
          microphone: DeviceManager.getSelectedMicrophone(),
          forceUpdate: true
        });
      }
    });
    audioMonitor = new AudioMonitor({
      onReport: (level) => {
        self.emit(Events.CHANGE_MICLEVEL, level);
      },
      onSupportsMonitoring: () => {
        self.emit(Events.CHANGE_MICLEVEL_SUPPORT, true);
      }
    });

    // SERVER-10677 was caused by getUserMedia being called twice on Firefox. However, as Firefox doesn't support
    // permission query on camera/microphone (as of v74.0), we shouldn't hit this issue again.
    listenOnBrowserPermissionChange('microphone');
    listenOnBrowserPermissionChange('camera');

    UserMediaState.isStarted = true;
  }
});

function listenOnBrowserPermissionChange(deviceName) {
  if (navigator.permissions && _.isFunction(navigator.permissions.query)) { // as of v13.0.5, Safari doesn't support this
    navigator.permissions.query({name: deviceName})
    .then((permissionStatus) => {
      permissionStatus.onchange = () => {

        if (UserMediaState.isUserMediaEnabled) {
          // The reason we need to call getUserMedia instead of just DeviceManager.updateDeviceLists()
          // was because on Chrome 80, just updating the device list didn't give the app access to the
          // currently selected device (the device list was unchanged).
          handleUserMediaOptions({
            camera: DeviceManager.getSelectedCamera(),
            microphone: DeviceManager.getSelectedMicrophone(),
            forceUpdate: true
          });
        }
      };
    })
    .catch((e) => {
      if (e.name !== 'TypeError') { // as of v74.0, Firefox doesn't support permission query on camera/microphone and will throw a TypeError
        throw e;
      }
    });
  }
}

function setAudioMute(muted) {
  UserMediaState.audioMuted = muted;

  if (isEnabled() && UserMediaState.hasAudio) {
    UserMediaState.audioEnabled = !muted;
    _.each(UserMediaState.localMutableStream.getAudioTracks(), (track) => track.enabled = !muted);
  }
}

function setVideoMute(muted) {
  UserMediaState.videoMuted = muted;

  if (isEnabled() && UserMediaState.hasVideo) {
    UserMediaState.videoEnabled = !muted;
    _.each(UserMediaState.localMutableStream.getVideoTracks(), (track) => track.enabled = !muted);
  }
}

function setHDEnabled(isEnabled) {
  if (UserMediaState.isHDEnabled !== isEnabled) {
    UserMediaState.isHDEnabled = isEnabled;

    LocalStorage.setStorageVariable(StorageKeys.HD_MODE, isEnabled);

    if (UserMediaState.isUserMediaEnabled) {
      handleUserMediaOptions({
        camera: DeviceManager.getSelectedCamera(),
        microphone: DeviceManager.getSelectedMicrophone(),
        forceUpdate: true
      });
    }
  }
}

function setLocalStream(stream) {
  if (UserMediaState.localStream === stream) {
    return;
  }

  if (UserMediaState.localStream !== null) {
    WebRTC.stopTracksOnStream(UserMediaState.localStream);
    WebRTC.stopTracksOnStream(UserMediaState.localMutableStream);
    audioMonitor.stopMonitoring();
  }

  clearInterval(UserMediaState.settingsListenerInterval);

  UserMediaState.localStream = stream;
  UserMediaState.localMutableStream = (stream && _.isFunction(stream.clone)) ? stream.clone() : stream;
  UserMediaState.hasAudio = !!UserMediaState.localStream && UserMediaState.localStream.getAudioTracks().length > 0;
  UserMediaState.hasVideo = !!UserMediaState.localStream && UserMediaState.localStream.getVideoTracks().length > 0;

  if (UserMediaState.hasAudio) {
    if (UserMediaState.audioMuted) {
      _.each(UserMediaState.localMutableStream.getAudioTracks(), (track) => track.enabled = false);
    }

    audioMonitor.startMonitoring(UserMediaState.localStream);
  }

  if (UserMediaState.hasVideo) {
    if (UserMediaState.videoMuted) {
      _.each(UserMediaState.localMutableStream.getVideoTracks(), (track) => track.enabled = false);
    }

    let previousTrackSettings = UserMediaState.localStream.getVideoTracks()[0].getSettings();
    UserMediaState.settingsListenerInterval = setInterval(() => {

      const videotracks = UserMediaState.localStream.getVideoTracks();
      const newsettings = (videotracks.length && _.isFunction(videotracks[0].getSettings)) ? videotracks[0].getSettings() : {};

      if (!_.isEqual(newsettings, previousTrackSettings)) {
        previousTrackSettings = newsettings;
        emitter.emit(Events.CHANGE_LOCALSTREAM_SETTINGS, UserMediaState.localStream, newsettings);
      }
    }, 500);
  }

  UserMediaState.audioEnabled = UserMediaState.hasAudio && !UserMediaState.audioMuted;
  UserMediaState.videoEnabled = UserMediaState.hasVideo && !UserMediaState.videoMuted;

  if (stream === null) {
    emitter.emit(Events.CHANGE_LOCALSTREAM, false, {
      audio: false,
      video: false,
    });
  } else {
    emitter.emit(Events.CHANGE_LOCALSTREAM, UserMediaState.localStream, {
      audio: UserMediaState.hasAudio,
      video: UserMediaState.hasVideo,
    });
  }

}

function isEnabled() {
  return UserMediaState.localStream !== null;
}

function setRequestingPermission(devices, permissionState) {
  devices.forEach(device => UserMediaState.permissionState[device] = permissionState);

  if (permissionState === PermissionState.DENIED || permissionState === PermissionState.GRANTED) {
    UserMediaState.resolveWhenRequestDone.forEach(function (promiseRef) {
      promiseRef.resolve();
    });
    UserMediaState.resolveWhenRequestDone = [];

  } else if (permissionState === PermissionState.FAILED) {
    UserMediaState.resolveWhenRequestDone.forEach(function (promiseRef) {
      promiseRef.reject(JoinFailReason.CANNOT_ACCESS_LOCAL_MEDIA);
    });
    UserMediaState.resolveWhenRequestDone = [];
  }

  emitter.emit(Events.CHANGE_USER_MEDIA_PERMISSIONS, UserMediaState.permissionState);
}

function forceDisableUserMedia(stream) {
  Logger.info('Force disabling userMedia');
  UserMediaState.isUserMediaEnabled = false;
  if (stream !== null) {
    WebRTC.stopTracksOnStream(stream);
  }
  setLocalStream(null);
}

function onUserMediaSuccess(devices, stream) {
    DeviceManager.updateDeviceLists();

  if (UserMediaState.userMediaUsers.length === 0) {
    Logger.warn('Got onUserMediaSuccess but no longer need userMedia');
    forceDisableUserMedia(stream);
  } else {
    setLocalStream(stream);
  }
  setRequestingPermission(devices, PermissionState.GRANTED);

  if (UserMediaState.requestQueue) {
    handleUserMediaOptions(UserMediaState.requestQueue);
  }
}

function onUserMediaError(devices, error) {

  const deniedAndFailedPermissions = [PermissionState.DENIED, PermissionState.FAILED];

  const wasPreviousCamPermissionsAnError = deniedAndFailedPermissions.includes(UserMediaState.permissionState.camera);
  const wasPreviousMicPermissionsAnError = deniedAndFailedPermissions.includes(UserMediaState.permissionState.microphone);
  
  // we only need to remove the stream when both the cam and mic have errored.
  if ((devices.includes('camera')       && devices.includes('microphone')) ||
      (wasPreviousCamPermissionsAnError && devices.includes('microphone')) ||
      (wasPreviousMicPermissionsAnError && devices.includes('camera'))) {
    setLocalStream(null);
  }

  if (['PermissionDeniedError', 'NotAllowedError'].includes(error.name)) {
    setRequestingPermission(devices, PermissionState.DENIED);
  } else {
    setRequestingPermission(devices, PermissionState.FAILED);
  }

  if (UserMediaState.userMediaUsers.length === 0) {
    Logger.warn('Got userMediaError but no longer need userMedia');
    forceDisableUserMedia(null);
  }

  if (UserMediaState.requestQueue) {
    handleUserMediaOptions(UserMediaState.requestQueue);
  }

  Logger.warn('Could not access local media: ', error.name);
}

function buildVideoConstraints(options) {
  if (!options.camera || options.camera.id === 'none')return false;

  const constraints = {};

  if (options.camera.id === 'default' || !options.camera.id) {
    constraints.facingMode = {ideal: 'user'};
  } else {
    constraints.deviceId = {exact: options.camera.id};
  }

  if (options.useMinimumConstraints) {
    Logger.warn('Using minimum constraints for video:', constraints);
  } else {
    // We use a maximum of 1080p since people probably don't want to kill their devices by sending 4k video
    // unnecessarily. We don't have a minimum, as people with crappy cameras will still want them to work.
    // The ideal resolution depends on whether we are in HD or SD mode - we rely on the browser to obey it
    constraints.height = {
      max: 1080,
      ideal: UserMediaState.isHDEnabled ? 1080 : 480,
    };

    if (getBrowser().name !== 'ios') {
      // iOS only supports very specific resolutions in specific aspect ratios, otherwise they report invalid constraints
      // Therefore, we only constrain its height and let it do its own thing with the width to not fail to getUserMedia
      constraints.width = {
        max: 1920
      }

      // Some Android phones return NotReadableError if we specify both ideal width and height for SD, However,
      // for desktops we still want to set the ideal width, because this ensures we get 16/9 aspect ratio in SD mode.
      if (!isMobile()) {
        constraints.width.ideal = UserMediaState.isHDEnabled ? 1920 : 864;
      }
    }

    constraints.resizeMode = 'crop-and-scale';

    if (UserMediaState.isHDEnabled) {
      // In SD mode, we might want to use 4 / 3 or something else that works best. In HD mode, we want the browser to
      // try to do 16 / 9 if possible - if not possible, it will do whatever it can
      constraints.aspectRatio = 16 / 9;
    }
  }

  return constraints;
}

function buildAudioConstraints(options) {
  if (!options.microphone || options.microphone.id === 'none')return false;
  if (options.microphone.id === 'default' || !options.microphone.id)return true;
  return {
    deviceId: options.microphone.id
  };
}

function buildConstraints(options) {
  const videoConstraints = buildVideoConstraints(options);
  const audioConstraints = buildAudioConstraints(options);

  if (!videoConstraints && !audioConstraints) {
    return false;
  }

  return {
    video: videoConstraints,
    audio: audioConstraints
  };
}

function handleUserMediaOptions(options) {
  return getUserMedia(options).catch((e1) => {

    // if we've failed with both device options, we check with each device at a time
    if ((options.camera && options.camera.id !== 'none') &&
    (options.microphone && options.microphone.id !== 'none') &&
    (['PermissionDeniedError', 'NotAllowedError', 'NotReadableError'].includes(e1.name))) {

      setRequestingPermission(['microphone'], PermissionState.UNKNOWN);
      const {camera, ...nonCameraOptions} = options;
      
      // try with just the mic
      return getUserMedia(nonCameraOptions).then(() => {
        onUserMediaError(['camera'], e1);
      }).catch((e2) => {
        onUserMediaError(['microphone'], e2);

        // (sanity check) only check with camera if mic failed with errors we expect
        if (['PermissionDeniedError', 'NotAllowedError', 'NotReadableError'].includes(e2.name)) {
          const {microphone, ...nonMicrophoneOptions} = options;
          setRequestingPermission(['camera'], PermissionState.UNKNOWN);

          // try with just the camera
          return getUserMedia(nonMicrophoneOptions).catch(() => onUserMediaError(['camera'], e1));
        } else {
          onUserMediaError(['camera'], e1);
        }
      })
    } else if ((e1.name === 'OverconstrainedError') && (!options.useMinimumConstraints)) {
      Logger.warn('OverconstrainedError: constraint=', e1.constraint, 'msg=', e1.message);
      options.useMinimumConstraints = true;
      setRequestingPermission(['microphone', 'camera'], PermissionState.UNKNOWN);
      return handleUserMediaOptions(options);
    } else {
      onUserMediaError(['camera', 'microphone'], e1);
    }
  })
}

function getUserMedia(options) {
  return new Promise((resolve, reject) => {

    const {forceUpdate, ...rest} = options;
    const devices = Object.keys(rest);

    const isAlreadyRequestingPermissions =
      devices.reduce(
        (accum, device) => accum || UserMediaState.permissionState[device] === PermissionState.REQUESTING,
        false,
      );

    // If devices are unchanged (and media is enabled/requesting), do not request again
    if (!options.forceUpdate &&
        _.isEqual(UserMediaState.lastRequest, options) &&
        (isEnabled() || isAlreadyRequestingPermissions)) {
      return resolve();
    }

    if (isAlreadyRequestingPermissions) {
      UserMediaState.requestQueue = options;
      return resolve();
    }

    UserMediaState.requestQueue = null;
    UserMediaState.lastRequest = options;
    setRequestingPermission(devices, PermissionState.REQUESTING);

    if (UserMediaState.localStream !== null) {
      WebRTC.stopTracksOnStream(UserMediaState.localStream);
      WebRTC.stopTracksOnStream(UserMediaState.localMutableStream);
    }

    if (!UserMediaState.isStarted || (!options.camera && !options.microphone)) {
      setRequestingPermission(devices, PermissionState.GRANTED);
      return resolve();
    }

    // Allowing the browser (hi Safari) some time to clean up after the previous stream.
    _.delay(() => {
      try {
        const constraints = buildConstraints(options);
        if (!constraints) {
          onUserMediaSuccess(devices); // We aren't asking for any user media
          return resolve();
        }

        WebRTC.getUserMedia(
          constraints,
          (s) => {
            onUserMediaSuccess(devices, s);
            return resolve()
          },
          (e) => reject(e));
      } catch (e) {
        return reject(e);
      }
    }, WEBRTC_GET_USER_MEDIA_DELAY_MS);
  })
}

function enableUserMedia(microphone, camera) {
  if (UserMediaState.permissionState.camera === PermissionState.REQUESTING ||
      UserMediaState.permissionState.microphone === PermissionState.REQUESTING) {
    Logger.warn('calling getUserMedia again before user has accepted/rejected permission');
    return;
  }

  if (UserMediaState.permissionState.camera === PermissionState.DENIED &&
      UserMediaState.permissionState.microphone === PermissionState.DENIED) {
    return;
  }

  if (isEnabled()) {
    return;
  }

  // we need to account for the user permissions changing, while not in the callclient, from allowed -> block.
  DeviceManager.updateDeviceLists();
  handleUserMediaOptions({microphone, camera});
}

function disableUserMedia() {
  if (UserMediaState.permissionState.camera === PermissionState.REQUESTING ||
      UserMediaState.permissionState.microphone === PermissionState.REQUESTING) {
    Logger.warn('Trying to disable user media while requesting');
    return;
  }

  if (UserMediaState.permissionState.camera === PermissionState.DENIED &&
      UserMediaState.permissionState.microphone === PermissionState.DENIED) {
    return;
  }

  if (!isEnabled()) {
    return;
  }

  setLocalStream(null);
}

function enableUserMediaUsage() {
  if (!UserMediaState.isUserMediaEnabled) {
    UserMediaState.isUserMediaEnabled = true;

    if (!DeviceManager.isReady()) {
      DeviceManager.once(DeviceManagerEvents.READY, () => {
        enableUserMedia(DeviceManager.getSelectedMicrophone(), DeviceManager.getSelectedCamera());
      });
    } else {
      enableUserMedia(DeviceManager.getSelectedMicrophone(), DeviceManager.getSelectedCamera());
    }

  }
}

function disableUserMediaUsage() {
  if (UserMediaState.isUserMediaEnabled && UserMediaState.userMediaUsers.length === 0) {
    setRequestingPermission(['camera', 'microphone'], PermissionState.UNKNOWN);
    UserMediaState.isUserMediaEnabled = false;
    disableUserMedia();
  }
}

export function requestUserMedia(object) {
  // TODO Should provide options for only requesting some or none of audio/video
  return new Promise(function (resolve, reject) {

    if (UserMediaState.userMediaUsers.includes(object)) {
      resolve();
      return;
    }

    UserMediaState.userMediaUsers.push(object);
    if (UserMediaState.userMediaUsers.length === 1) {
      enableUserMediaUsage();
    }

    const permissionsArr =  Object.values(UserMediaState.permissionState);

    if ([PermissionState.REQUESTING, PermissionState.UNKNOWN].some(p => permissionsArr.includes(p))) {
      UserMediaState.resolveWhenRequestDone.push({resolve, reject});
    }
    else if ([PermissionState.GRANTED, PermissionState.DENIED].some(p => permissionsArr.includes(p))) {
      // if a device permission is granted while the other is denied, we still consider this a partial success.
      // we'll resolve requestUserMedia but the permission event emitted will reflect that one was denied.
      resolve();
    }
    else if (permissionsArr.includes(PermissionState.FAILED)) {
      reject(JoinFailReason.CANNOT_ACCESS_LOCAL_MEDIA);
    }
  });
}

export function releaseUserMedia(object, delay = true) {
  if (UserMediaState.userMediaUsers.includes(object)) {
    UserMediaState.userMediaUsers = _.without(UserMediaState.userMediaUsers, object);

    if (UserMediaState.userMediaUsers.length === 0) {
      if (delay) {
        _.delay(disableUserMediaUsage, USER_MEDIA_RELEASE_DELAY_MS);
      }
      else {
        // This is useful e.g. when leaving the JoinCall page and going into management mode,
        // as we then release the user media straight away - we will not need it in the call
        disableUserMediaUsage();
      }
    }
  }
}

export function getLocalStream(isRemote = false) {
  if (isRemote) {
    return UserMediaState.localMutableStream;
  }
  return UserMediaState.localStream;
}

export default emitter;