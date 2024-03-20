import { AddEvents, TypedEvent, WithEventsDummyType } from '@webex/ts-events';

export enum StreamEventNames {
  MuteStateChange = 'mute-state-change',
  Ended = 'stream-ended',
}

interface StreamEvents {
  [StreamEventNames.MuteStateChange]: TypedEvent<(muted: boolean) => void>;
  [StreamEventNames.Ended]: TypedEvent<() => void>;
}

/**
 * Base stream class.
 */
abstract class _Stream {
  // The output stream should never be reassigned, since it is the stream that is being given out.
  readonly outputStream: MediaStream;

  // TODO: these should be protected, but we need the helper type in ts-events
  // to hide the 'emit' method from TypedEvent.
  [StreamEventNames.MuteStateChange] = new TypedEvent<(muted: boolean) => void>();

  [StreamEventNames.Ended] = new TypedEvent<() => void>();

  /**
   * Create a Stream from the given values.
   *
   * @param stream - The initial output MediaStream for this Stream.
   */
  constructor(stream: MediaStream) {
    this.outputStream = stream;
    this.handleTrackMuted = this.handleTrackMuted.bind(this);
    this.handleTrackUnmuted = this.handleTrackUnmuted.bind(this);
    this.handleTrackEnded = this.handleTrackEnded.bind(this);
    this.addTrackHandlers(this.outputTrack);
  }

  /**
   * Handler which is called when a track's mute event fires.
   */
  protected handleTrackMuted() {
    this[StreamEventNames.MuteStateChange].emit(true);
  }

  /**
   * Handler which is called when a track's unmute event fires.
   */
  protected handleTrackUnmuted() {
    this[StreamEventNames.MuteStateChange].emit(false);
  }

  /**
   * Handler which is called when a track's ended event fires.
   */
  private handleTrackEnded() {
    this[StreamEventNames.Ended].emit();
  }

  /**
   * Add event handlers to a MediaStreamTrack.
   *
   * @param track - The MediaStreamTrack.
   */
  protected addTrackHandlers(track: MediaStreamTrack) {
    track.addEventListener('mute', this.handleTrackMuted);
    track.addEventListener('unmute', this.handleTrackUnmuted);
    track.addEventListener('ended', this.handleTrackEnded);
  }

  /**
   * Remove event handlers from a MediaStreamTrack.
   *
   * @param track - The MediaStreamTrack.
   */
  protected removeTrackHandlers(track: MediaStreamTrack) {
    track.removeEventListener('mute', this.handleTrackMuted);
    track.removeEventListener('unmute', this.handleTrackUnmuted);
    track.removeEventListener('ended', this.handleTrackEnded);
  }

  /**
   * Get the ID of the output stream.
   *
   * @returns The ID of the output stream.
   */
  get id(): string {
    return this.outputStream.id;
  }

  /**
   * Check whether or not this stream is muted.
   *
   * @returns True if the stream is muted, false otherwise.
   */
  abstract get muted(): boolean;

  /**
   * Get the track of the output stream.
   *
   * @returns The output track.
   */
  protected get outputTrack(): MediaStreamTrack {
    return this.outputStream.getTracks()[0];
  }

  /**
   * Get the settings of this stream.
   *
   * @returns The settings.
   */
  abstract getSettings(): MediaTrackSettings;

  /**
   * Stop this stream.
   */
  abstract stop(): void;
}

export const Stream = AddEvents<typeof _Stream, StreamEvents>(_Stream);

export type Stream = _Stream & WithEventsDummyType<StreamEvents>;
