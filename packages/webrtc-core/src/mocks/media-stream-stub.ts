/* eslint-disable */
import './media-stream-track-stub';

/**
 * This is a 'stub' implementation of MediaStream, made to reflect a browser's implementation.
 */
class MediaStreamStub {
  private tracks: MediaStreamTrack[];

  constructor(tracks: MediaStreamTrack[] = []) {
    this.tracks = tracks;
  }

  addTrack(track: MediaStreamTrack) {
    this.tracks.push(track);
  }

  removeTrack(track: MediaStreamTrack) {
    this.tracks = this.tracks.filter((t) => t !== track);
  }

  /**
   * Stubbed method to return tracks that are part of this MediaStream.
   *
   * @returns An array of MediaStreamTrack objects.
   */
  getTracks(): MediaStreamTrack[] {
    return this.tracks;
  }

  getVideoTracks(): MediaStreamTrack[] {
    return [];
  }

  getAudioTracks(): MediaStreamTrack[] {
    return [];
  }

  ensureDevicePermissions(): MediaDeviceInfo[] {
    return [];
  }
}


export default MediaStreamStub;
