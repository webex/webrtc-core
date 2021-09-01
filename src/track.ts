import { EventEmitter } from './event-emitter';

/**
 * Base Track class.
 */
export abstract class Track extends EventEmitter {
  /**
   * Enum for Track Events.
   *
   * @readonly
   * @enum {string}
   */
  static Events = {
    /** Fired when a non-null or undefined underlying track is replaced. */
    TrackUpdate: 'track-update',
    /**
     * Adds the callback handler to be notified of a track ending, this event occurs when the track
     * will no longer provide data to the stream for any reason. Note: Handler will not fire when
     * user calls stop() on the underlying track.
     */
    TrackEnded: 'track-ended',
  };

  /**
   * The underlying MediaStreamTrack object.
   */
  private track: MediaStreamTrack | undefined;

  /**
   * Constructor for the Track class.
   *
   * @param track - (Optional) MediaStreamTrack.
   */
  constructor(track?: MediaStreamTrack) {
    super();

    if (track) {
      this.setUnderlyingTrack(track);
    }
  }

  /**
   * Gets the underlying track.
   *
   * @returns The underlying track.
   */
  getUnderlyingTrack(): MediaStreamTrack | undefined {
    return this.track;
  }

  /**
   * Sets the underlying track.
   *
   * @param track - The new underlying track.
   */
  setUnderlyingTrack(track: MediaStreamTrack): void {
    // eslint-disable-next-line no-param-reassign, jsdoc/require-jsdoc
    track.onended = (ev: Event) => {
      this.emit(Track.Events.TrackEnded, ev);
    };
    this.track = track;
  }
}
