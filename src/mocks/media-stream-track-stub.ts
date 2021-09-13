/**
 * This is a 'stub' implementation of MediaStreamTrack, made to reflect a browser's
 * implementation.
 */
class MediaStreamTrackStub {
  /**
   * Stop this track.
   */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  stop(): void {}
}

/**
 * We do this to fill in the type that would normally be in the dom.
 */
Object.defineProperty(window, 'MediaStreamTrack', {
  writable: true,
  value: MediaStreamTrackStub,
});
