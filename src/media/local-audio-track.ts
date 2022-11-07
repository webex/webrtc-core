import { logger } from '../util/logger';
import { LocalTrack } from './local-track';

import { audioEncoderConfig, StaticAudioEncoderConfig } from '../device/device-management';

export type TrackEffect = any;
/**
 * Represents a audio track for a audio source.
 */
export class LocalAudioTrack extends LocalTrack {
  private effects: Map<string, TrackEffect> = new Map();

  /**
   *
   */
  public getVolumeLevel() {}

  /**
   * @param level
   */
  public setVolume(level: number) {}

  /**
   * @param device
   */
  setPlayBackDevice(device: MediaDeviceInfo): void {}

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
   *
   */
  addBNREffect() {}

  /**
   * @param encoderConfig
   */
  setEncoderConfig(encoderConfig: StaticAudioEncoderConfig | audioEncoderConfig): void {}
}
