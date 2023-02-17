/* eslint-disable */
import { MediaStreamTrackKind } from '../peer-connection';

/**
 * This is a 'stub' implementation of MediaStreamTrack, made to reflect a browser's
 * implementation.
 */
class MediaStreamTrackStub {
  // default MediaStreamTrack value
  enabled = true;
  // Technically this should map to a list of handlers, but for now modeling a single handler should
  // be fine.
  eventListeners: Map<string, any> = new Map();

  kind?: MediaStreamTrackKind;

  /**
   * Callback call onmute.
   */
  onmute(): void {}

  /**
   * Stop this track.
   */
  stop(): void {}

  getSettings(): MediaTrackSettings {
    return {} as MediaTrackSettings;
  }

  addEventListener(event: string, handler: any): void {
    this.eventListeners.set(event, handler);
  }

  removeEventListener(event: string, handler: any): void {
    this.eventListeners.delete(event);
  }
}

/**
 * We do this to fill in the type that would normally be in the dom.
 */
Object.defineProperty(window, 'MediaStreamTrack', {
  writable: true,
  value: MediaStreamTrackStub,
});
Object.defineProperty(window, 'MediaDeviceInfo', {
  writable: true,
  value: MediaStreamTrackStub,
});


export default MediaStreamTrackStub;
