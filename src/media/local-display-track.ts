import { LocalTrack } from './local-track';

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/contentHint.
 */
export type VideoContentHint = 'motion' | 'detail';

/**
 * Represents a local track for a display source.
 */
export class LocalDisplayTrack extends LocalTrack {
  protected _videoContentHint?: VideoContentHint;

  /**
   * Create a LocalDisplayTrack from the given values.
   *
   * @param stream - The MediaStream for this track.
   * @param videoContentHint - An optional content hint, describing the content of the track.
   */
  constructor(stream: MediaStream, videoContentHint?: VideoContentHint) {
    super(stream);
    this._videoContentHint = videoContentHint;
    this.underlyingTrack.contentHint = videoContentHint || '';
  }

  /**
   * Get the VideoContentHint for this track.
   *
   * @returns The VideoContentHint for this track.
   */
  get videoContentHint(): VideoContentHint | undefined {
    return this._videoContentHint;
  }
}
