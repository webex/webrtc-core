/**
 * class to accessing media resource
 */

import { Devices } from "./devices";
import { LocalAudioTrack } from "./LocalAudioTrack";
import { LocalVideoTrack } from "./localVideoTrack";
import MicrophoneAudioTrack from "./microphoneAudioTrack"

export interface AudioEncoderConfiguration { 
    sampleRate: number,
    stereo: boolean,
    bitrate: number,
}

/** Configuration for creating microphone track  */
export interface MicrophoneAudioTrackConfig {
/** Provide your own ID to the track */
id: string;

 /** provide the microphone id */ 
microphoneId: string, 

/** Audio echo cancellation */
AEC: boolean,

/** Audio gain control  */
AGC:boolean,

/**  Audio noice cancellation */
ANS: boolean,

/**  audio encoder config or predefined set of configuration*/
encoderConfig: AudioEncoderConfiguration | string,
}


export interface VideoEncoderConfig { 
  
}
/**
 * Video Camera configuration
 */
export interface CameraVideoTrackConfig { 
  cameraId : string,
  /**  front and back camera */
  facingMode: string,

  /** suitable for motion or detail */
  optimizationMode: string,

}

/**
 * Media class to expost media api
 * @public
 */
export default class Media {
  private static instance: Media;
  devices: Devices

  constructor() {
      this.devices = new Devices();
  }
/**
  * event event opn onMicrophoneChanged
  * @event Media:onMicrophoneDevicesChanged
*/
/**
  * event event opn onCameraDevicesChanged
  * @event Media:onCameraDevicesChanged
*/
/**
  * event event opn onPlaybackDeviceChanged
  * @event Media:onPlaybackDevicesChanged
  * @instance
  * @memberof Media
*/
/**
  * event event opn audioautoplaybackfailed
  * @event Media:onAudioAutoplayFailed
*/

/**
 * create audio track using microphone or other source.
 * @param audioTrackConfig - audio track configuration
 * @returns - MicroPhoneAudioTrack 
**/


public createAudioTrack(audioTrackConfig: MicrophoneAudioTrackConfig): Promise<MicrophoneAudioTrack> {

  return Promise.resolve(new MicrophoneAudioTrack('audio'))
}


/**
 * create video track
* @returns {Promise} cameraVideoTrack  
**/

public createVideoTrack(cameraVideoTrackConfig: CameraVideoTrackConfig) {


// Handle 
// Already requested for getUserMedia 
// Someone force updating the media ?
// set state on device so that we know we are requesting permissions for it 

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
  return  stream;
}).catch(Error);
}


/**
 * create video track
* @param {VideoTrackConfig} videoTrackConfig audio encoder config
* @param {AudioTrackConfig} audioTrackConfig
* @returns {Promise} cameraVideoTrack  
**/
createAudioVideoTrack() {

}

/**
 * create share track
* @param {ScreenTrackConfig} screenTrackConfig screen track config
* @param {Boolean} withAudio share audio during share
* @param {VideoEncoderConfig} screenTrackConfig.videoEncoderConfiguration
* @param {ScreenEncoderConfig} screenTrackConfig.screenEncoderConfiguration
* @param {String} screenTrackConfig.optimizationMode suitable for motion or detail
* @returns {Promise} [LocalVideoTrack, LocalAudioTrack] 
**/
createScreenTrack() {

}


/**
 * get all supported cameras
* @param {Boolean} skipPermissionCheck get more accurate results for camera
* @returns {Promise} [MediaDeviceInfo]
**/
getCameraDevices() {

}


// createBufferSourceAudioTrack
// createCustomVideoTrack
// createCustomAudioTrack

/**
 * get all input and output supported devices
* @param {Boolean} skipPermissionCheck get more accurate results for all the devices
* @returns {Promise} [MediaDeviceInfo]   
**/
getDevices() {
  return this.devices.getDevices();
}

/**
 * get all supported Microphones
* @param {Boolean} skipPermissionCheck get more accurate results for microphone
* @returns {Promise} [MediaDeviceInfo]
**/
getMicrophoneDevices() {

}


 /**
 * get all supported playback device for output
* @param {Boolean} skipPermissionCheck get more accurate results for microphone
* @returns {Promise} [MediaDeviceInfo]
**/
getPlaybackDevices() {

}

// need to be called before the joining of the call 
// does the volume check before the start of the meeting

 /**
 * checks if the audioTrack passed has audio coming through it 
* @param {LocalAudioTrack} localAudioTrack local audio track 
* @param {RemoteAudioTrack} remoteAudioTrack remote audio track
* @param {function} timeout timeout to gather samples  
* @returns {boolean}   
**/
isAudioTrackActive(remoteAudioTrack: LocalAudioTrack, timout: Function) {

}

 /**
 * checks if the audioTrack passed has audio coming through it 
* @param {LocalVideoTrack} localVideoTrack local video track 
* @param {RemoteVideoTrack} remoteVideoTrack remote video track
* @param {number} timout timeout to gather samples  
* @returns {boolean}   
**/
// isVideoTrackActive(localVideoTrack, timout)
// {

// }

// setRemoteVideoStreamType  // sets the remote media quality 



// LocalTrack <-- LocalAudioTrack<--MicrophoneAudioTrack<--BufferSourceAudioTrack
// LocalTrack <-- LocalVideoTrack <-CameraVideoTrack
// remoteTrack<--remoteVideoTrack
// remoteTrack<-- remoteAudioTrack


// /**
//  * Restart the given {@link LocalMediaTrack} if it has been inadvertently stopped.
//  * @private
//  * @param {LocalAudioTrack|LocalVideoTrack} localMediaTrack
//  * @returns {function} Clean up listeners attached by the workaround
//  */
//  restartWhenInadvertentlyStopped(localMediaTrack) { 
//   const { _log: log, kind } = localMediaTrack;
//   const detectSilence = { audio: detectSilentAudio, video: detectSilentVideo }[kind];

//   let { _dummyEl: el, mediaStreamTrack } = localMediaTrack;
//   let trackChangeInProgress = null;

//   function checkSilence() {
//   }

//   function shouldReacquireTrack() {

//   }

//   function maybeRestart() {
//       // NOTE(mmalavalli): If the MediaStreamTrack ends before the DOM is visible,
//       // then this makes sure that visibility callback for phase 2 is called only
//       // after the MediaStreamTrack is re-acquired.
//   }

//   function onMute() {
//     // NOTE(mmalavalli): When a LocalMediaTrack is muted without the app being
//     // backgrounded, and the inadvertently paused elements are played before it
//     // is restarted, it never gets unmuted due to the WebKit Bug 213853. Hence,
//     // setting this Deferred will make sure that the inadvertently paused elements
//     // are played only after the LocalMediaTrack is unmuted.
//     //
//     // Bug: https://bugs.webkit.org/show_bug.cgi?id=213853
//     //

//   }

//   function addMediaStreamTrackListeners() {
//     mediaStreamTrack.addEventListener('ended', maybeRestart);
//     mediaStreamTrack.addEventListener('mute', onMute);
//     mediaStreamTrack.addEventListener('unmute', maybeRestart);
//   }

//   function removeMediaStreamTrackListeners() {
//     mediaStreamTrack.removeEventListener('ended', maybeRestart);
//     mediaStreamTrack.removeEventListener('mute', onMute);
//     mediaStreamTrack.removeEventListener('unmute', maybeRestart);
//   }


//   return () => {
//     documentVisibilityMonitor.offVisible(1, maybeRestart);
//     removeMediaStreamTrackListeners();
//   };
// }

static getInstance(): Media {
  if (!Media.instance) {
    Media.instance = new Media();
  }

  return Media.instance;
}

}