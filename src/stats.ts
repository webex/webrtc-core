//https://docs.agora.io/en/Video/in-call_quality_web_ng?platform=Web

/**
 * Class to send statsInformation
 */

export default class Stats {
    constructor() {

    }
/**
  * events related to local and remote network quality
  * @event Stats:networkQuality
  * @instance
  * @memberof Stats
  */

/**
  * Any exceptions related to media fps or bitrate not recovering
  * @event Stats:exceptions
  * @instance
  * @memberof Stats
  */


// Returns downlink and uplink network quality 


getRemoteNetworkQuality() {

}

overAllStats() {

}

getLocalVideoStats() {

}

getLocalAudioStats() {

}

getRemoteVideoStats() {

}

getRemoteAudioStats() {

} 

// FRAMERATE_INPUT_TOO_LOW Captured video frame rate is too low.
// FRAMERATE_INPUT_TOO_LOW_RECOVER Captured video frame rate recovers.
// FRAMERATE_SENT_TOO_LOW Sent video frame rate is too low.
// FRAMERATE_SENT_TOO_LOW_RECOVER Sent video frame rate recovers.
// SEND_VIDEO_BITRATE_TOO_LOW __ Sent video bitrate is too low.
// SEND_VIDEO_BITRATE_TOO_LOW_RECOVER _ Sent video bitrate recovers.
// RECV_VIDEO_DECODE_FAILED Decoding received video fails. 
// RECV_VIDEO_DECODE_FAILED_RECOVER Decoding received video recovers.
// AUDIO_INPUT_LEVEL_T0O_LOW Sent audio volume is too low. 
// AUDIO_INPUT_LEVEL_TOO_LOW_RECOVER Sent audio volume recovers.
// AUDIO_OUTPUT_LEVEL_TOO_LOW Received audio volume is too low. 
// AUDIO_OUTPUT_LEVEL_TOO_LOW_RECOVER Received audio volume recovers.
// SEND_AUDIO_BITRATE_TOO_LOW Sent audio bitrate is too low. 
// SEND_AUDIO_BITRATE_TOO_LOW_RECOVER Sent audio bitrate recovers.
// RECV_AUDIO_DECODE_FAILED Decoding received audio fails.
// RECV_AUDIO_DECODE_FAILED_RECOVER Decoding received audio recovers.
}

