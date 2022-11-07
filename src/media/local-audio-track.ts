import { logger } from '../util/logger';
import { LocalTrack } from './local-track';

export type AudioDeviceConstraints = {
  deviceId?: string;
};

export type StaticAudioEncoderConfig = {
  low: '16kHz';
};

export type AudioEncoderConfig = {
  bitrate?: number;
  sampleRate?: number;
  sampleSize?: number;
  channelCount?: number;
};

export type MicrophoneConstraints = {
  echoCancellation?: boolean;
  autoGainControl?: boolean;
  noiseSuppression?: boolean;
  microphoneDeviceId?: string;
  encoderConfig?: AudioEncoderConfig;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TrackEffect = any;
/**
 * Represents a audio track for a audio source.
 */
export class LocalAudioTrack extends LocalTrack {
  private effects: Map<string, TrackEffect> = new Map();

  /**
   * Get an effect by name.
   *
   * @param name - The effect name.
   * @returns A MicrophoneEffect.
   */
  getEffect(name: string): TrackEffect | undefined {
    const effect = this.effects.get(name);

    if (!effect) {
      logger.log(`No effect found with name '${name}'`);
    }

    return effect;
  }

  /**
   * Adds an effect to a local track.
   *
   * @param name - The name of the effect.
   * @param effect - The effect to add.
   */
  async addEffect(name: string, effect: TrackEffect): Promise<void> {
    await effect.load(new MediaStream([this.getMediaStreamTrack()]));
    this.setMediaStreamTrackWithEffects(effect.getUnderlyingStream().getAudioTracks()[0]);
    this.effects.set(name, effect);
  }

  /**
   * Cleanup local microphone track.
   */
  disposeEffects(): void {
    this.effects.forEach((effect: TrackEffect) => effect.dispose());
  }

  /**
   * Adds background noise cancellation effect.
   *
   * @param name - The name of the effect.
   * @param effect - The effect to add.
   */
  async addBNREffect(name: string, effect: TrackEffect): Promise<void> {
    // TODO: add validation checks to see if its a BNR effect passed in
    await this.addEffect(name, effect);
  }

  /**
   * Makes sure to apply the encoderConfig for the audio.
   *
   * @param encoderConfig - Encoder config for audio.
   */
  setEncoderConfig(encoderConfig: AudioEncoderConfig): void {
    this.getMediaStreamTrack().applyConstraints(encoderConfig);
  }
}
