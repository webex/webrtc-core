import { AddEvents, TypedEvent, WithEventsDummyType } from '@webex/ts-events';
import { Stream, StreamEventNames } from './stream';

export enum RemoteMediaState {
  Started = 'started',
  Stopped = 'stopped',
}

export enum RemoteStreamEventNames {
  MediaStateChange = 'media-state-change',
}

interface RemoteStreamEvents {
  [RemoteStreamEventNames.MediaStateChange]: TypedEvent<(state: RemoteMediaState) => void>;
}

/**
 * A stream originating from a remote peer.
 */
class _RemoteStream extends Stream {
  [RemoteStreamEventNames.MediaStateChange] = new TypedEvent<(state: RemoteMediaState) => void>();

  /**
   * Create a RemoteStream from the given values.
   *
   * @param stream - The initial output MediaStream for this Stream.
   */
  constructor(stream: MediaStream) {
    super(stream);
    this.handleMediaStarted = this.handleMediaStarted.bind(this);
    this.handleMediaStopped = this.handleMediaStopped.bind(this);
    this.outputTrack.addEventListener('mute', this.handleMediaStopped);
    this.outputTrack.addEventListener('unmute', this.handleMediaStarted);
  }

  /**
   * @inheritdoc
   */
  protected handleMediaStarted(): void {
    this[RemoteStreamEventNames.MediaStateChange].emit(RemoteMediaState.Started);
  }

  /**
   * @inheritdoc
   */
  protected handleMediaStopped(): void {
    this[RemoteStreamEventNames.MediaStateChange].emit(RemoteMediaState.Stopped);
  }

  /**
   * Helper function to add event handlers to a MediaStreamTrack. See
   * {@link Stream.addTrackHandlersForStreamEvents} for why this is useful.
   *
   * @param track - The MediaStreamTrack.
   */
  private addTrackHandlersForRemoteStreamEvents(track: MediaStreamTrack): void {
    track.addEventListener('mute', this.handleMediaStopped);
    track.addEventListener('unmute', this.handleMediaStarted);
  }

  /**
   * @inheritdoc
   */
  protected addTrackHandlers(track: MediaStreamTrack): void {
    super.addTrackHandlers(track);
    this.addTrackHandlersForRemoteStreamEvents(track);
  }

  /**
   * @inheritdoc
   */
  protected removeTrackHandlers(track: MediaStreamTrack): void {
    super.removeTrackHandlers(track);
    track.removeEventListener('mute', this.handleMediaStopped);
    track.removeEventListener('unmute', this.handleMediaStarted);
  }

  /**
   * Check whether the media on this stream has started or stopped.
   *
   * @returns The state of the media.
   */
  get mediaState(): RemoteMediaState {
    return this.outputTrack.muted ? RemoteMediaState.Stopped : RemoteMediaState.Started;
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

export const RemoteStream = AddEvents<typeof _RemoteStream, RemoteStreamEvents>(_RemoteStream);

export type RemoteStream = _RemoteStream & WithEventsDummyType<RemoteStreamEvents>;
