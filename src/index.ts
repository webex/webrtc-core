/**
 * Webrtc core and media library
 *
 * @packageDocumentation
 */

import { LocalAudioTrack } from "./LocalAudioTrack";
import { LocalVideoTrack } from "./localVideoTrack";
import {default as Media , AudioEncoderConfiguration, MicrophoneAudioTrackConfig, VideoEncoderConfig, CameraVideoTrackConfig} from "./media";
import MicroPhoneAudioTrack from "./microphoneAudioTrack";
import {default as PeerConnection} from "./peerconnection";
import { RemoteAudioTrack } from "./remoteAudioTrack";
import { Track } from "./track";
import { LocalTrack } from "./localTrack";
import { RemoteVideoTrack } from "./remoteVideoTrack";
import {RemoteTrack} from './remoteTrack'
import {CameraVideoTrack} from './cameravideotrack'
import PeerConnectionManager from "./peerConnectionManager";

/**
 * Public abstract for webrtc core 
 * @alpha
 */
const  WebRtcCore   = {
    media:  new Media(),
    peerConnectionManager : new PeerConnectionManager({logLevel: 0, iceServer:['server1'], simulcast:true, noOfTracksReceived: 3, maxBitrate:20000, frameRate:30, frameSize:3869})
    }

declare global {
    interface Window { WebRtcCore:any }
}

/**
 * Public abstract for webrtc core 
 * @public
 */
window.WebRtcCore = WebRtcCore || {};

export default WebRtcCore;
export { 
    Media,
    PeerConnection,
    LocalVideoTrack,
    LocalAudioTrack,
    LocalTrack,
    MicroPhoneAudioTrack,
    RemoteAudioTrack,
    RemoteVideoTrack,
    RemoteTrack,
    Track,
    CameraVideoTrack,
    MicrophoneAudioTrackConfig,
    AudioEncoderConfiguration,
    VideoEncoderConfig,
    CameraVideoTrackConfig
}