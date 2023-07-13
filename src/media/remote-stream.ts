import { Stream, StreamEventNames } from './stream';

/**
 * A stream originating from a remote peer.
 */
export class RemoteStream extends Stream {
  /**
   * @inheritdoc
   */
  get muted(): boolean {
    return !this.outputTrack.enabled;
  }

  /**
   * @inheritdoc
   */
  getSettings(): MediaTrackSettings {
    return this.outputTrack.getSettings();
  }

  /**
   * Replace the existing track on the output stream for a new track.
   *
   * @param newTrack - The track to add to the stream.
   */
  replaceTrack(newTrack: MediaStreamTrack): void {
    const oldTrack = this.outputTrack;
    this.removeTrackHandlers(oldTrack);
    this.outputStream.removeTrack(oldTrack);

    this.outputStream.addTrack(newTrack);
    this.addTrackHandlers(newTrack);

    // TODO: Chrome/React may not automatically refresh the media element with the new track when
    // the output track has changed, so we may need to emit an event here if this is the case.
    // this[StreamEventNames.OutputTrackChange].emit(newTrack);
  }

  /**
   * @inheritdoc
   */
  stop(): void {
    this.outputTrack.stop();
    // calling stop() will not automatically emit Ended, so we emit it here
    this[StreamEventNames.Ended].emit();
  }
}
