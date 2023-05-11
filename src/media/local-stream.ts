import { AddEvents, TypedEvent, WithEventsDummyType } from '@webex/ts-events';
import { BaseEffect, EffectEvent } from '@webex/web-media-effects';
import { Stream, StreamEventNames } from './stream';

export enum LocalStreamEventNames {
  ConstraintsChange = 'constraints-change',
}

interface LocalStreamEvents {
  [LocalStreamEventNames.ConstraintsChange]: TypedEvent<() => void>;
}

export type TrackEffect = BaseEffect;

type EffectItem = { name: string; effect: TrackEffect };

/**
 * Replace an existing track on a media stream for a new track. This method assumes a single track
 * per stream.
 *
 * @param stream - The stream in which the track is to be replaced.
 * @param track - The track to add to the stream.
 */
const replaceTrack = (stream: MediaStream, track: MediaStreamTrack) => {
  stream.removeTrack(stream.getTracks()[0]);
  stream.addTrack(track);
};

/**
 * A stream which originates on the local device.
 */
abstract class _LocalStream extends Stream {
  [LocalStreamEventNames.ConstraintsChange] = new TypedEvent<() => void>();

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

  /**
   * Adds an effect to a local stream.
   *
   * @param name - The name of the effect.
   * @param effect - The effect to add.
   */
  async addEffect(name: string, effect: TrackEffect): Promise<void> {
    // Load the effect
    this.loadingEffects.set(name, effect);
    const outputTrack = await effect.load(this.outputStream.getTracks()[0]);

    // Check that the loaded effect is the latest one and dispose if not
    if (effect !== this.loadingEffects.get(name)) {
      await effect.dispose();
      throw new Error(`Effect "${name}" not required after loading`);
    }

    // Use the effect
    this.loadingEffects.delete(name);
    this.effects.push({ name, effect });
    replaceTrack(this.outputStream, outputTrack);

    // When the effect's track is updated, update the next effect or output stream.
    effect.on(EffectEvent.TrackUpdated, (track: MediaStreamTrack) => {
      const effectIndex = this.effects.findIndex((e) => e.name === name);
      if (effectIndex === this.effects.length - 1) {
        replaceTrack(this.outputStream, track);
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
    // Dispose of any effects currently in use
    if (this.effects.length > 0) {
      replaceTrack(this.outputStream, this.inputTrack);
      await Promise.all(this.effects.map((item: EffectItem) => item.effect.dispose()));
      this.effects = [];
      this.loadingEffects.clear();
    }
  }
}

export const LocalStream = AddEvents<typeof _LocalStream, LocalStreamEvents>(_LocalStream);

export type LocalStream = _LocalStream & WithEventsDummyType<LocalStreamEvents>;
