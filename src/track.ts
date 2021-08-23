import { EventEmitter } from 'events';

/**
 * Base Track class.
 */
export abstract class Track extends EventEmitter {
  /**
   * The underlying MediaStreamTrack object.
   */
  private track: MediaStreamTrack;

  /**
   * Constructor for the Track class. Will create an empty MediaStreamTrack if one is not provided.
   *
   * @param track - (Optional) MediaStreamTrack.
   */
  constructor(track?: MediaStreamTrack) {
    super();

    this.track = track || new MediaStreamTrack();
  }

  /**
   * Gets the underlying track.
   *
   * @returns The underlying track.
   */
  getUnderlyingTrack(): MediaStreamTrack {
    return this.track;
  }

  /**
   * Sets the underlying track.
   *
   * @param track - The new underlying track.
   */
  setUnderlyingTrack(track: MediaStreamTrack): void {
    this.track = track;
  }
}
