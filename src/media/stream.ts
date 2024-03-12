import { AddEvents, TypedEvent, WithEventsDummyType } from '@webex/ts-events';

export enum StreamEventNames {
  Ended = 'stream-ended',
}

interface StreamEvents {
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
  [StreamEventNames.Ended] = new TypedEvent<() => void>();

  /**
   * Create a Stream from the given values.
   *
   * @param stream - The initial output MediaStream for this Stream.
   */
  constructor(stream: MediaStream) {
    this.outputStream = stream;
    this.handleTrackEnded = this.handleTrackEnded.bind(this);
    this.addTrackHandlersForStreamEvents(this.outputTrack);
  }

  /**
   * Handler which is called when a track's ended event fires.
   */
  private handleTrackEnded() {
    this[StreamEventNames.Ended].emit();
  }

  /**
   * Helper function to add event handlers to a MediaStreamTrack. Unlike the virtual
   * {@link addTrackHandlers} function, which can be overridden, this function is internal to this
   * class and will only add the event handlers relevant to this class. It prevents, for example,
   * accidentally adding the same event handlers multiple times, which could happen if the virtual
   * `addTrackHandlers` method was called from a subclass's constructor.
   *
   * @param track - The MediaStreamTrack.
   */
  private addTrackHandlersForStreamEvents(track: MediaStreamTrack) {
    track.addEventListener('ended', this.handleTrackEnded);
  }

  /**
   * Add event handlers to a MediaStreamTrack.
   *
   * @param track - The MediaStreamTrack.
   */
  protected addTrackHandlers(track: MediaStreamTrack) {
    this.addTrackHandlersForStreamEvents(track);
  }

  /**
   * Remove event handlers from a MediaStreamTrack.
   *
   * @param track - The MediaStreamTrack.
   */
  protected removeTrackHandlers(track: MediaStreamTrack) {
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
