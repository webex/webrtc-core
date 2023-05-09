import { AddEvents, TypedEvent, WithEventsDummyType } from '@webex/ts-events';
import { Stream, StreamEventNames } from './stream';

export enum LocalStreamEventNames {
  ConstraintsChange = 'constraints-change',
}

interface LocalStreamEvents {
  [LocalStreamEventNames.ConstraintsChange]: TypedEvent<() => void>;
}

/**
 * A stream which originates on the local device.
 */
abstract class _LocalStream extends Stream {
  [LocalStreamEventNames.ConstraintsChange] = new TypedEvent<() => void>();

  // The output stream can change to reflect any effects that have
  // been added.  This member will always point to the MediaStream
  // that this LocalStream was originally created with.
  protected inputStream: MediaStream;

  /**
   * Create a LocalStream from the given values.
   *
   * @param stream - The initial output MediaStream for this Stream.
   */
  constructor(stream: MediaStream) {
    super(stream);
    this.inputStream = stream;
  }

  /**
   * Get the track within the MediaStream with which this LocalStream was created.
   *
   * @returns The track within the MediaStream with which this LocalStream
   * was created.
   */
  protected get inputTrack(): MediaStreamTrack {
    return this.inputStream.getTracks()[0];
  }

  /**
   * Get whether or not this stream is currently muted.
   *
   * @returns True if this stream is muted, false otherwise.
   */
  get muted(): boolean {
    return !this.inputTrack.enabled;
  }

  /**
   * Set the mute state of this stream.
   *
   * @param isMuted - True to mute, false to unmute.
   */
  setMuted(isMuted: boolean): void {
    if (this.inputTrack.enabled === isMuted) {
      this.inputTrack.enabled = !isMuted;
      this[StreamEventNames.Muted].emit(isMuted);
    }
  }
}

export const LocalStream = AddEvents<typeof _LocalStream, LocalStreamEvents>(_LocalStream);

export type LocalStream = _LocalStream & WithEventsDummyType<LocalStreamEvents>;
