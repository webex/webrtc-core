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
  protected _outputStream: MediaStream;

  // TODO: this should be protected, but we need the helper type in ts-events
  // to hide the 'emit' method from TypedEvent.
  [StreamEventNames.MuteStateChange] = new TypedEvent<(muted: boolean) => void>();

  [StreamEventNames.Ended] = new TypedEvent<() => void>();

  /**
   * Create a Stream from the given values.
   *
   * @param stream - The initial output MediaStream for this Stream.
   */
  constructor(stream: MediaStream) {
    this._outputStream = stream;
  }

  /**
   * Check whether or not this stream is muted.
   *
   * @returns True if the stream is muted, false otherwise.
   */
  abstract get muted(): boolean;

  /**
   * Get the output stream.
   *
   * @returns The output stream.
   */
  get outputStream(): MediaStream {
    return this._outputStream;
  }
}

export const Stream = AddEvents<typeof _Stream, StreamEvents>(_Stream);

export type Stream = _Stream & WithEventsDummyType<StreamEvents>;
