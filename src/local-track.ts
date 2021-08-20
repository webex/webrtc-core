import { Track } from 'track';

/**
 * A wrapper around MediaStreamTrack.
 */
export class LocalTrack extends Track {
  /**
   * Sets the track to be enabled or disabled.
   *
   * @param enabled - Whether the track should be enabled.
   */
  setEnabled(enabled: boolean): void {
    this.getUnderlyingTrack().enabled = enabled;
  }

  /**
   * Adds the callback handler to be notified of a track ending, this event occurs when the track
   * will no longer provide data to the stream for any reason.
   *
   * Note: Handler will not fire when user calls stop().
   *
   * @param handler - The callback function to execute.
   */
  setOnEndedHandler(handler: () => void): void {
    this.getUnderlyingTrack().onended = handler;
  }
}
