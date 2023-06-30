import { Stream, StreamEventNames } from './stream';

/**
 * A stream originating from a remote peer.
 */
export class RemoteStream extends Stream {
  /**
   * Create a RemoteStream from the given values.
   *
   * @param stream - The output MediaStream for this Stream.
   */
  constructor(stream: MediaStream) {
    super(stream);
    this._outputStream = stream;

    this.handleTrackMuted = this.handleTrackMuted.bind(this);
    this.handleTrackUnmuted = this.handleTrackUnmuted.bind(this);

    const outputTrack = this._outputStream.getTracks()[0];
    this.addTrackHandlers(outputTrack);
  }

  /**
   * Handler which is called when a track's mute event fires.
   */
  private handleTrackMuted() {
    this[StreamEventNames.MuteStateChange].emit(true);
  }

  /**
   * Handler which is called when a track's unmute event fires.
   */
  private handleTrackUnmuted() {
    this[StreamEventNames.MuteStateChange].emit(false);
  }

  /**
   * Add event handlers to a MediaStreamTrack.
   *
   * @param track - The MediaStreamTrack.
   */
  private addTrackHandlers(track: MediaStreamTrack) {
    track.addEventListener('mute', this.handleTrackMuted);
    track.addEventListener('unmute', this.handleTrackUnmuted);
  }

  /**
   * Remove event handlers from a MediaStreamTrack.
   *
   * @param track - The MediaStreamTrack.
   */
  private removeTrackHandlers(track: MediaStreamTrack) {
    track.removeEventListener('mute', this.handleTrackMuted);
    track.removeEventListener('unmute', this.handleTrackUnmuted);
  }

  /**
   * @inheritdoc
   */
  get muted(): boolean {
    return !this._outputStream.getTracks()[0].enabled;
  }

  /**
   * Replace the existing track on the output stream for a new track.
   *
   * @param newTrack - The track to add to the stream.
   */
  replaceTrack(newTrack: MediaStreamTrack): void {
    const oldTrack = this._outputStream.getTracks()[0];
    this.removeTrackHandlers(oldTrack);
    this.outputStream.removeTrack(oldTrack);

    this.outputStream.addTrack(newTrack);
    this.addTrackHandlers(newTrack);
  }
}
