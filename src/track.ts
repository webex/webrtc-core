



export class Track{

  trackMediaType: String;
    /**
     * @param {String} trackMediaType audio or video
     */
   
    constructor(trackMediaType: String) {
       this.trackMediaType = trackMediaType
    }

    /** 
     * @property {boolean} isPlaying are the track active
     * @name Track#isPlaying
     */

    /** 
     * @property {string} trackMediaType media type of the track 
     * @name Track#trackMediaType
     */

    /**
     * gets all the event listners 
     * @returns {Function}
     */
    getListeners(){

    }

    /**
     * get the mediastream track 
     * @returns {MediaStreamTrack}
     */
    getMediaStreamTrack() {

    }

    /**
     * Track id generated on the sdk side
     * @returns {string}
     */

    getTrackID(){}

   /**
     * play the track on the element
     * @param {string} element id of the dom element
     * @param {HTMLElement} videoDom  actual video dom 
     * @returns {void}
     */
    play() {

    }

   /**
     * stops the track
     * @returns {void}
     */
    stop() {

    }
} 