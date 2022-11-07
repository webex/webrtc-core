import { staticVideoEncoderConfig, videoEncoderConfig } from '../device/device-management';
import { logger } from '../util/logger';
import { LocalTrack } from './local-track';

export type TrackEffect = any;
// TBD: Fix this once types are published seperatly
// export type TrackEffect = BaseMicrophoneEffect | BaseCameraEffect;

/**
 * Represents a local video track.
 */
export class LocalVideoTrack extends LocalTrack {
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
    this.setMediaStreamTrackWithEffects(effect.getUnderlyingStream().getVideoTracks()[0]);
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
  addVirtualBackgroundEffect() {}

  /**
   *
   */
  addBlurBackgroundEffect() {}

  /**
   * @param encoderConfig
   */
  setEncoderConfig(encoderConfig: staticVideoEncoderConfig | videoEncoderConfig): void {}
}
