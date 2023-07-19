import { AddEvents, TypedEvent, WithEventsDummyType } from '@webex/ts-events';
import { BaseEffect, EffectEvent } from '@webex/web-media-effects';
import { Stream, StreamEventNames } from './stream';

export enum LocalStreamEventNames {
  ConstraintsChange = 'constraints-change',
  OutputTrackChange = 'output-track-change',
}

interface LocalStreamEvents {
  [LocalStreamEventNames.ConstraintsChange]: TypedEvent<() => void>;
  [LocalStreamEventNames.OutputTrackChange]: TypedEvent<(track: MediaStreamTrack) => void>;
}

export type TrackEffect = BaseEffect;

type EffectItem = { name: string; effect: TrackEffect };

/**
 * A stream which originates on the local device.
 */
abstract class _LocalStream extends Stream {
  [LocalStreamEventNames.ConstraintsChange] = new TypedEvent<() => void>();

  [LocalStreamEventNames.OutputTrackChange] = new TypedEvent<(track: MediaStreamTrack) => void>();

  private effects: EffectItem[] = [];

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
   * @param name - The name of the effect.
   * @param effect - The effect to add.
   */
  async addEffect(name: string, effect: TrackEffect): Promise<void> {
    // Load the effect
    this.loadingEffects.set(name, effect);
    const outputTrack = await effect.load(this.outputTrack);

    // Check that the loaded effect is the latest one and dispose if not
    if (effect !== this.loadingEffects.get(name)) {
      await effect.dispose();
      throw new Error(`Effect "${name}" not required after loading`);
    }

    // Use the effect
    this.loadingEffects.delete(name);
    this.effects.push({ name, effect });
    this.changeOutputTrack(outputTrack);

    // When the effect's track is updated, update the next effect or output stream.
    // TODO: using EffectEvent.TrackUpdated will cause the entire web-media-effects lib to be built
    // and makes the size of the webrtc-core build much larger, so we use type assertion here as a
    // temporary workaround.
    effect.on('track-updated' as EffectEvent, (track: MediaStreamTrack) => {
      const effectIndex = this.effects.findIndex((e) => e.name === name);
      if (effectIndex === this.effects.length - 1) {
        this.changeOutputTrack(track);
      } else {
        this.effects[effectIndex + 1]?.effect.replaceInputTrack(track);
      }
    });
  }

  /**
   * Get an effect from the effects list.
   *
   * @param name - The name of the effect you want to get.
   * @returns The effect or undefined.
   */
  getEffect(name: string): TrackEffect | undefined {
    return this.effects.find((e) => e.name === name)?.effect;
  }

  /**
   * Cleanup the local effects.
   */
  async disposeEffects(): Promise<void> {
    this.loadingEffects.clear();

    // Dispose of any effects currently in use
    if (this.effects.length > 0) {
      this.changeOutputTrack(this.inputTrack);
      await Promise.all(this.effects.map((item: EffectItem) => item.effect.dispose()));
      this.effects = [];
    }
  }
}

export const LocalStream = AddEvents<typeof _LocalStream, LocalStreamEvents>(_LocalStream);

export type LocalStream = _LocalStream & WithEventsDummyType<LocalStreamEvents>;
