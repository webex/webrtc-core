import './media-stream-track-stub';

/**
 * This is a 'stub' implementation of MediaStream, made to reflect a browser's implementation.
 */
class MediaStreamStub {
  /**
   * Stubbed method to return tracks that are part of this MediaStream.
   *
   * @returns An array of MediaStreamTrack objects.
   */
  // eslint-disable-next-line class-methods-use-this
  getTracks(): MediaStreamTrack[] {
    return [];
  }
}

/**
 * We do this to fill in the type that would normally be in the dom.
 */
Object.defineProperty(window, 'MediaStream', {
  writable: true,
  value: MediaStreamStub,
});

export { MediaStreamStub as MediaStream };
