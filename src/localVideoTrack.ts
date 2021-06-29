/**
 * A {@link LocalVideoTrack} Class handles local video track
 * @extends LocalTrack
 */

import { LocalTrack } from "./localTrack";

 export class LocalVideoTrack extends LocalTrack{

    /**
     * gets the current image data
     * @returns {ImageData} 
     */
     getCurrentFrameData(){

    }

    /**
     * we can set it to get AudioBuffer once callback is set(PCM data format)
     * @param {string} mode balance/motion/detail
     */
     setOptimizationMode(){

    }
 }