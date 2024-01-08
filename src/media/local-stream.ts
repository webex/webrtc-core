import { AddEvents, TypedEvent, WithEventsDummyType } from '@webex/ts-events';
import { BaseEffect, EffectEvent } from '@webex/web-media-effects';
import { WebrtcCoreError, WebrtcCoreErrorType } from '../errors';
import { Stream, StreamEventNames } from './stream';

export type TrackEffect = BaseEffect;

export enum LocalStreamEventNames {
  ConstraintsChange = 'constraints-change',
  OutputTrackChange = 'output-track-change',
  EffectAdded = 'effect-added',
}

interface LocalStreamEvents {
  [LocalStreamEventNames.ConstraintsChange]: TypedEvent<() => void>;
  [LocalStreamEventNames.OutputTrackChange]: TypedEvent<(track: MediaStreamTrack) => void>;
  [LocalStreamEventNames.EffectAdded]: TypedEvent<(effect: TrackEffect) => void>;
}

/**
 * A stream which originates on the local device.
 */
abstract class _LocalStream extends Stream {
  [LocalStreamEventNames.ConstraintsChange] = new TypedEvent<() => void>();

  [LocalStreamEventNames.OutputTrackChange] = new TypedEvent<(track: MediaStreamTrack) => void>();

  [LocalStreamEventNames.EffectAdded] = new TypedEvent<(effect: TrackEffect) => void>();

  private effects: TrackEffect[] = [];

  private loadingEffects: Map<string, TrackEffect> = new Map();

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
   * @inheritdoc
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
      // setting `enabled` will not automatically emit MuteStateChange, so we emit it here
      this[StreamEventNames.MuteStateChange].emit(isMuted);
    }
  }

  /**
   * @inheritdoc
   */
  getSettings(): MediaTrackSettings {
    return this.inputTrack.getSettings();
  }

  /**
   * Get the label of the input track on this stream.
   *
   * @returns The label of the track.
   */
  get label(): string {
    return this.inputTrack.label;
  }

  /**
   * Get the readyState of the input track on this stream.
   *
   * @returns The readyState of the track.
   */
  get readyState(): string {
    return this.inputTrack.readyState;
  }

  /**
   * Change the track of the output stream to a different track.
   *
   * Note: this method assumes and enforces that if both input and output streams have the same
   * track, then they must also be the same stream.
   *
   * @param newTrack - The track to be used in the output stream.
   */
  private changeOutputTrack(newTrack: MediaStreamTrack): void {
    if (this.outputTrack.id !== newTrack.id) {
      // If the input track and the *old* output track are currently the same, then the streams must
      // be the same too. We want to apply the new track to the output stream without affecting the
      // input stream, so we separate them by setting the input stream to be its own stream.
      if (this.inputTrack.id === this.outputTrack.id) {
        this.inputStream = new MediaStream(this.inputStream);
      }

      this.outputStream.removeTrack(this.outputTrack);
      this.outputStream.addTrack(newTrack);

      // If the input track and the *new* output track are now the same, then we want the streams to
      // be the same too.
      if (this.inputTrack.id === this.outputTrack.id) {
        this.inputStream = this.outputStream;
      }

      this[LocalStreamEventNames.OutputTrackChange].emit(newTrack);
    }
  }

  /**
   * @inheritdoc
   */
  stop(): void {
    this.inputTrack.stop();
    this.outputTrack.stop();
    // calling stop() will not automatically emit Ended, so we emit it here
    this[StreamEventNames.Ended].emit();
  }

  /**
   * Adds an effect to a local stream.
   *
   * @param effect - The effect to add.
   */
  async addEffect(effect: TrackEffect): Promise<void> {
    // Check if the effect has already been added.
    if (this.effects.includes(effect)) {
      throw new WebrtcCoreError(
        WebrtcCoreErrorType.ADD_EFFECT_FAILED,
        `Effect ${effect.id} has already been added to this stream.`
      );
    }

    // Load the effect. Because loading is asynchronous, keep track of the loading effects.
    this.loadingEffects.set(effect.kind, effect);
    await effect.load(this.outputTrack);

    // After loading, check whether or not we still want to use this effect. If another effect of
    // the same kind was added while this effect was loading, we only want to use the latest effect,
    // so dispose this one. If the effects list was cleared while this effect was loading, also
    // dispose it.
    if (effect !== this.loadingEffects.get(effect.kind)) {
      await effect.dispose();
      throw new WebrtcCoreError(
        WebrtcCoreErrorType.ADD_EFFECT_FAILED,
        `Another effect with kind ${effect.kind} was added while effect ${effect.id} was loading, or the effects list was cleared.`
      );
    }
    this.loadingEffects.delete(effect.kind);

    // Add the effect to the effects list.
    this.effects.push(effect);

    // When the effect's track is updated, update the next effect or output stream.
    // TODO: using EffectEvent.TrackUpdated will cause the entire web-media-effects lib to be built
    // and makes the size of the webrtc-core build much larger, so we use type assertion here as a
    // temporary workaround.
    effect.on('track-updated' as EffectEvent, (track: MediaStreamTrack) => {
      const effectIndex = this.effects.indexOf(effect);
      if (effectIndex === this.effects.length - 1) {
        this.changeOutputTrack(track);
      } else {
        this.effects[effectIndex + 1]?.replaceInputTrack(track);
      }
    });

    // Emit an event with the effect so others can listen to the effect events.
    this[LocalStreamEventNames.EffectAdded].emit(effect);
  }

  /**
   * Get an effect from the effects list by ID.
   *
   * @param id - The id of the effect you want to get.
   * @returns The effect or undefined.
   */
  getEffectById(id: string): TrackEffect | undefined {
    return this.effects.find((effect) => effect.id === id);
  }

  /**
   * Get all the effects from the effects list with the given kind.
   *
   * @param kind - The kind of the effects you want to get.
   * @returns A list of effects.
   */
  getEffectsByKind(kind: string): TrackEffect[] {
    return this.effects.filter((effect) => effect.kind === kind);
  }

  /**
   * Get all the effects from the effects list.
   *
   * @returns A list of effects.
   */
  getEffects(): TrackEffect[] {
    return this.effects;
  }

  /**
   * Cleanup the local effects.
   */
  async disposeEffects(): Promise<void> {
    this.loadingEffects.clear();

    // Dispose of any effects currently in use
    if (this.effects.length > 0) {
      this.changeOutputTrack(this.inputTrack);
      await Promise.all(this.effects.map((effect) => effect.dispose()));
      this.effects = [];
    }
  }
}

export const LocalStream = AddEvents<typeof _LocalStream, LocalStreamEvents>(_LocalStream);

export type LocalStream = _LocalStream & WithEventsDummyType<LocalStreamEvents>;
