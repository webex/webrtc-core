

/**
 * A {@link LocalTrack} Class handles the basic MediaStreamTrack
 * @extends Track
 */

import { Track } from "./track";

export class LocalTrack extends Track{
/**
  * event for success of failur for setting local sdp
  * @event LocalTrack:track-ended
  * @instance
  * @memberof LocalTrack
*/

   /**
     * close the track cannot be reused later on
     * @returns {void}
     */

   close() {

   }

    /**
     * The sdk does disable the tracks, this does not stop track
     * @param {boolean} enabled toogle to enable and disable track
     * @returns {void}
     */
    setEnabled() {
        
    }

    /**
     * returns the track label MediaStreamTrack.label / MediaDeviceInfo.label
     * @returns {String} label
     */

     getTrackLabel()  {

     }

 }