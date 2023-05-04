import { AddEvents, TypedEvent, WithEventsDummyType } from '@webex/ts-events';

export enum StreamEventNames {
  Muted = 'stream-muted',
}

interface StreamEvents {
  [StreamEventNames.Muted]: TypedEvent<(muted: boolean) => void>;
}

/**
 * Base stream class.
 */
abstract class _Stream {
  protected outputStream: MediaStream;

  // TODO: this should be protected, but we need the helper type in ts-events
  // to hide the 'emit' method from TypedEvent.
  [StreamEventNames.Muted] = new TypedEvent<(muted: boolean) => void>();

  /**
   * Create a Stream from the given values.
   *
   * @param stream - The initial output MediaStream for this Stream.
   */
  constructor(stream: MediaStream) {
    this.outputStream = stream;
  }

  /**
   * Check whether or not this stream is muted.
   *
   * @returns True if the stream is muted, false otherwise.
   */
  abstract get muted(): boolean;
}

export const Stream = AddEvents<typeof _Stream, StreamEvents>(_Stream);

export type Stream = _Stream & WithEventsDummyType<StreamEvents>;
