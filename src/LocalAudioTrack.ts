/**
 * A {@link LocalAudioTrack} Class handles the basic MediaStreamTrack
 * @extends LocalTrack
 */

import { LocalTrack } from "./localTrack";

   export class LocalAudioTrack extends LocalTrack{

    /**
     * get the volume level for the audio
     * @returns {Number} 0-1
     */
     getVolumeLevel(){

    }

    /**
     * we can set it to get AudioBuffer once callback is set(PCM data format)
     * @param {function} audioCallback
     * @param {number} frameSize
     */
    setAudioFrameCallback(){

    }

    /**
     * set playback devices only supports chrome
     * @param {string} deviceId device Id for the playback device
     * @returns {Promise}
     */

    setPlaybackDevice(){

    }

    /**
     * sets the volume level for the audio ranging from 0-1000
     * @param {number} volume 
     */

    setVolume(){

    }
 }