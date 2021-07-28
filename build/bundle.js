(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Build = {}));
}(this, (function (exports) { 'use strict';

	class Track {
	    trackMediaType;
	    constructor(trackMediaType) {
	        this.trackMediaType = trackMediaType;
	    }
	    getListeners() {
	    }
	    getMediaStreamTrack() {
	    }
	    getTrackID() { }
	    play() {
	    }
	    stop() {
	    }
	}

	class LocalTrack extends Track {
	    close() {
	    }
	    setEnabled() {
	    }
	    getTrackLabel() {
	    }
	}

	class LocalAudioTrack extends LocalTrack {
	    getVolumeLevel() {
	    }
	    setAudioFrameCallback() {
	    }
	    setPlaybackDevice() {
	    }
	    setVolume() {
	    }
	}

	class LocalVideoTrack extends LocalTrack {
	    getCurrentFrameData() {
	    }
	    setOptimizationMode() {
	    }
	}

	var DeviceState;
	(function (DeviceState) {
	    DeviceState[DeviceState["ACTIVE"] = 1] = "ACTIVE";
	    DeviceState[DeviceState["INACTIVE"] = 0] = "INACTIVE";
	})(DeviceState || (DeviceState = {}));
	class DeviceItem {
	    device;
	    state;
	    addedTime;
	    updatedTime;
	    constructor(device) {
	        this.device = device;
	        this.state = DeviceState.INACTIVE;
	        this.addedTime = Date.now().toLocaleString();
	        this.updatedTime = Date.now().toLocaleString();
	    }
	}

	class Devices {
	    devices = {};
	    getDevices() {
	        return navigator.mediaDevices.enumerateDevices()
	            .then((devicesList) => {
	            devicesList.forEach((device) => {
	                this.devices[device.deviceId] = new DeviceItem(device);
	            });
	            return devicesList;
	        });
	    }
	}

	class MicroPhoneAudioTrack extends LocalAudioTrack {
	    setDevice(deviceId) {
	    }
	}

	class Media {
	    static instance;
	    devices;
	    constructor() {
	        this.devices = new Devices();
	    }
	    createAudioTrack(audioTrackConfig) {
	        return Promise.resolve(new MicroPhoneAudioTrack('audio'));
	    }
	    createVideoTrack(cameraVideoTrackConfig) {
	        return navigator.mediaDevices.getUserMedia({
	            video: {
	                width: { min: 640, ideal: 1920 },
	                height: { min: 400, ideal: 1080 },
	                aspectRatio: { ideal: 1.7777777778 }
	            },
	            audio: {
	                sampleSize: 16,
	                channelCount: 2
	            }
	        }).then(stream => {
	            return stream;
	        }).catch(Error);
	    }
	    createAudioVideoTrack() {
	    }
	    createScreenTrack() {
	    }
	    getCameraDevices() {
	    }
	    getDevices() {
	        return this.devices.getDevices();
	    }
	    getMicrophoneDevices() {
	    }
	    getPlaybackDevices() {
	    }
	    isAudioTrackActive(remoteAudioTrack, timout) {
	    }
	    static getInstance() {
	        if (!Media.instance) {
	            Media.instance = new Media();
	        }
	        return Media.instance;
	    }
	}

	class PeerConnection {
	    sdpRevision = 0;
	    iceConnectionState = "INIT";
	    iceGatheringState = "INIT";
	    constructor(peerConnectionConfig) {
	    }
	    addTransceiver(track, mid) { }
	    updateTransceiver(peerConnection, transceiver, track) { }
	    setRemoteDescription(remoteDescription) { }
	    createOffer(offerSdp) { }
	    createAnswer(answerSdp) { }
	    _handleGlare() {
	    }
	    close() { }
	    _recycleTransciver() { }
	    initiateIceRestart() { }
	    restartDtls() { }
	}

	class RemoteTrack extends Track {
	    getUserId() {
	    }
	}

	class RemoteAudioTrack extends RemoteTrack {
	    getVolumeLevel() {
	    }
	    setAudioFrameCallback() {
	    }
	    setPlaybackDevice() {
	    }
	    setVolume() {
	    }
	}

	class RemoteVideoTrack extends RemoteTrack {
	    getCurrentFrameData() {
	    }
	}

	class CameraVideoTrack extends LocalVideoTrack {
	    setEncoderConfiguration() {
	    }
	}

	class PeerConnectionManager {
	    constructor(config) {
	    }
	}

	const WebRtcCore = {
	    media: new Media(),
	    peerConnectionManager: new PeerConnectionManager({ logLevel: 0, iceServer: ['server1'], simulcast: true, noOfTracksReceived: 3, maxBitrate: 20000, frameRate: 30, frameSize: 3869 })
	};
	window.WebRtcCore = WebRtcCore || {};

	exports.CameraVideoTrack = CameraVideoTrack;
	exports.LocalAudioTrack = LocalAudioTrack;
	exports.LocalTrack = LocalTrack;
	exports.LocalVideoTrack = LocalVideoTrack;
	exports.Media = Media;
	exports.MicroPhoneAudioTrack = MicroPhoneAudioTrack;
	exports.PeerConnection = PeerConnection;
	exports.RemoteAudioTrack = RemoteAudioTrack;
	exports.RemoteTrack = RemoteTrack;
	exports.RemoteVideoTrack = RemoteVideoTrack;
	exports.Track = Track;
	exports.default = WebRtcCore;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
