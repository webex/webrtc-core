import { Track } from './track';

/**
 * A wrapper around MediaStreamTrack.
 */
export class LocalTrack extends Track {
  /**
   * Exchange the underlying track with a new track. If there is an existing track, stop it and emit
   * the `track-update` event to alert listeners to an update on a new track.
   *
   * @param track - New underlying track.
   * @fires LocalTrack.Events.TrackUpdate
   */
  replaceUnderlyingTrack(track: MediaStreamTrack): void {
    const underlyingTrack = this.getUnderlyingTrack();
    if (underlyingTrack) {
      this.emit(LocalTrack.Events.TrackUpdate, underlyingTrack.id, track);
      underlyingTrack.stop();
    }

    this.setUnderlyingTrack(track);
  }

  /**
   * If underlying track exists, sets it to be enabled or disabled.
   *
   * @param enabled - Whether the track should be enabled.
   */
  setEnabled(enabled: boolean): void {
    const underlyingTrack = this.getUnderlyingTrack();
    if (underlyingTrack) {
      underlyingTrack.enabled = enabled;
    }
  }
}
