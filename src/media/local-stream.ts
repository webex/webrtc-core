import { AddEvents, TypedEvent, WithEventsDummyType } from '@webex/ts-events';
import type { BaseEffect, EffectEvent } from '@webex/web-media-effects-types';
import { WebrtcCoreError, WebrtcCoreErrorType } from '../errors';
import { logger } from '../util/logger';
import { Stream, StreamEventNames } from './stream';

export type TrackEffect = BaseEffect;

export enum LocalStreamEventNames {
  UserMuteStateChange = 'user-mute-state-change',
  SystemMuteStateChange = 'system-mute-state-change',
  ConstraintsChange = 'constraints-change',
  OutputTrackChange = 'output-track-change',
  EffectAdded = 'effect-added',
}

interface LocalStreamEvents {
  [LocalStreamEventNames.UserMuteStateChange]: TypedEvent<(muted: boolean) => void>;
  [LocalStreamEventNames.SystemMuteStateChange]: TypedEvent<(muted: boolean) => void>;
  [LocalStreamEventNames.ConstraintsChange]: TypedEvent<() => void>;
  [LocalStreamEventNames.OutputTrackChange]: TypedEvent<(track: MediaStreamTrack) => void>;
  [LocalStreamEventNames.EffectAdded]: TypedEvent<(effect: TrackEffect) => void>;
}

/**
 * A stream which originates on the local device.
 */
abstract class _LocalStream extends Stream {
  [LocalStreamEventNames.UserMuteStateChange] = new TypedEvent<(muted: boolean) => void>();

  [LocalStreamEventNames.SystemMuteStateChange] = new TypedEvent<(muted: boolean) => void>();

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
    this.handleTrackMutedBySystem = this.handleTrackMutedBySystem.bind(this);
    this.handleTrackUnmutedBySystem = this.handleTrackUnmutedBySystem.bind(this);
    this.addTrackHandlersForLocalStreamEvents(this.inputTrack);
  }

  /**
   * Handler which is called when a track's mute event fires.
   */
  private handleTrackMutedBySystem(): void {
    this[LocalStreamEventNames.SystemMuteStateChange].emit(true);
  }

  /**
   * Handler which is called when a track's unmute event fires.
   */
  private handleTrackUnmutedBySystem(): void {
    this[LocalStreamEventNames.SystemMuteStateChange].emit(false);
  }

  /**
   * Helper function to add event handlers to a MediaStreamTrack. See
   * {@link Stream.addTrackHandlersForStreamEvents} for why this is useful.
   *
   * @param track - The MediaStreamTrack.
   */
  private addTrackHandlersForLocalStreamEvents(track: MediaStreamTrack): void {
    track.addEventListener('mute', this.handleTrackMutedBySystem);
    track.addEventListener('unmute', this.handleTrackUnmutedBySystem);
  }

  /**
   * @inheritdoc
   */
  protected addTrackHandlers(track: MediaStreamTrack): void {
    super.addTrackHandlers(track);
    this.addTrackHandlersForLocalStreamEvents(track);
  }

  /**
   * @inheritdoc
   */
  protected removeTrackHandlers(track: MediaStreamTrack): void {
    super.removeTrackHandlers(track);
    track.removeEventListener('mute', this.handleTrackMutedBySystem);
    track.removeEventListener('unmute', this.handleTrackUnmutedBySystem);
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
   * Check whether or not this stream is muted. This considers both whether the stream has been
   * muted by the user (see {@link userMuted}) and whether the stream has been muted by the system
   * (see {@link systemMuted}).
   *
   * @returns True if the stream is muted, false otherwise.
   */
  get muted(): boolean {
    return this.userMuted || this.systemMuted;
  }

  /**
   * Check whether or not this stream has been muted by the user. This is equivalent to checking the
   * MediaStreamTrack "enabled" state.
   *
   * @returns True if the stream has been muted by the user, false otherwise.
   */
  get userMuted(): boolean {
    return !this.inputTrack.enabled;
  }

  /**
   * Check whether or not this stream has been muted by the user. This is equivalent to checking the
   * MediaStreamTrack "muted" state.
   *
   * @returns True if the stream has been muted by the system, false otherwise.
   */
  get systemMuted(): boolean {
    return this.inputTrack.muted;
  }

  /**
   * Set the user mute state of this stream.
   *
   * Note: This sets the user-toggled mute state, equivalent to changing the "enabled" state of the
   * track. It is separate from the system-toggled mute state.
   *
   * @param isMuted - True to mute, false to unmute.
   */
  setUserMuted(isMuted: boolean): void {
    if (this.inputTrack.enabled === isMuted) {
      this.inputTrack.enabled = !isMuted;
      this[LocalStreamEventNames.UserMuteStateChange].emit(isMuted);
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
    this.disposeEffects();
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
    if (this.effects.some((e) => e.id === effect.id)) {
      return;
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

    /**
     * Handle when the effect's output track has been changed. This will update the input of the
     * next effect in the effects list of the output of the stream.
     *
     * @param track - The new output track of the effect.
     */
    const handleEffectTrackUpdated = (track: MediaStreamTrack) => {
      const effectIndex = this.effects.findIndex((e) => e.id === effect.id);
      if (effectIndex === this.effects.length - 1) {
        this.changeOutputTrack(track);
      } else if (effectIndex >= 0) {
        this.effects[effectIndex + 1]?.replaceInputTrack(track);
      } else {
        logger.error(`Effect with ID ${effect.id} not found in effects list.`);
      }
    };

    /**
     * Handle when the effect has been disposed. This will remove all event listeners from the
     * effect.
     */
    const handleEffectDisposed = () => {
      effect.off('track-updated' as EffectEvent.TrackUpdated, handleEffectTrackUpdated);
      effect.off('disposed' as EffectEvent.Disposed, handleEffectDisposed);
    };

    effect.on('track-updated' as EffectEvent.TrackUpdated, handleEffectTrackUpdated);
    effect.on('disposed' as EffectEvent.Disposed, handleEffectDisposed);

    // Add the effect to the effects list. If an effect of the same kind has already been added,
    // dispose the existing effect and replace it with the new effect. If the existing effect was
    // enabled, also enable the new effect.
    const existingEffectIndex = this.effects.findIndex((e) => e.kind === effect.kind);
    if (existingEffectIndex >= 0) {
      const [existingEffect] = this.effects.splice(existingEffectIndex, 1, effect);
      if (existingEffect.isEnabled) {
        // If the existing effect is not the first effect in the effects list, then the input of the
        // new effect should be the output of the previous effect in the effects list. We know the
        // output track of the previous effect must exist because it must have been loaded (and all
        // loaded effects have an output track).
        const inputTrack =
          existingEffectIndex === 0
            ? this.inputTrack
            : (this.effects[existingEffectIndex - 1].getOutputTrack() as MediaStreamTrack);
        await effect.replaceInputTrack(inputTrack);
        // Enabling the new effect will trigger the track-updated event, which will handle the new
        // effect's updated output track.
        await effect.enable();
      }
      await existingEffect.dispose();
    } else {
      this.effects.push(effect);
    }

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
   * Get an effect from the effects list by kind.
   *
   * @param kind - The kind of the effect you want to get.
   * @returns The effect or undefined.
   */
  getEffectByKind(kind: string): TrackEffect | undefined {
    return this.effects.find((effect) => effect.kind === kind);
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
   * Method to serialize data about input, output streams
   * and also effects from LocalStream.
   *
   * @returns - A JSON-compatible object representation with data from LocalStream.
   */
  toJSON() {
    return {
      muted: this.muted,
      label: this.label,
      readyState: this.readyState,
      inputStream: {
        active: this.inputStream.active,
        id: this.inputStream.id,
        enabled: this.inputTrack.enabled,
        muted: this.inputTrack.muted,
      },
      outputStream: {
        active: this.outputStream.active,
        id: this.outputStream.id,
      },
      effects: this.effects.map((effect) => {
        return {
          id: effect.id,
          kind: effect.kind,
          isEnabled: effect.isEnabled,
        };
      }),
    };
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
