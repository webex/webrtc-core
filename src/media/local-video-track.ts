import { logger } from '../util/logger';
import { LocalTrack } from './local-track';

export enum FacingMode {
  user = 'user',
  environment = 'environment',
}

export enum OptimizationMode {
  motion = 'motion',
  detail = 'detail',
}

export type ConstrainLong = {
  min?: number;
  max?: number;
  ideal?: number;
  exact?: number;
};

export type VideoEncoderConfig = {
  bitRateMin?: number;
  bitrateMax?: number;
  frameRate?: number | ConstrainLong;
  height?: number | ConstrainLong;
  width?: number | ConstrainLong;
  aspectRatio?: number;
};

export const staticVideoEncoderConfig = {
  '1080P': { frameRate: 15, bitrateMax: 2080 },
  '720P': { frameRate: 15, bitrateMax: 1130 },
  '480P': { frameRate: 15, bitrateMax: 500 },
  '360P': { frameRate: 15, bitrateMax: 400 },
  '240P': { frameRate: 15, bitrateMax: 200 },
  '180P': { frameRate: 15, bitrateMax: 140 },
  '120P': { frameRate: 15, bitrateMax: 65 },
};

export type VideoConstraints = {
  cameraDeviceId?: string;
  facingMode?: FacingMode;
  optimizationMode?: OptimizationMode;
  encoderConfig?: VideoEncoderConfig;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TrackEffect = any;
// TBD: Fix this once types are published separately
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
   * Adds the virtual background effect.
   *
   * @param effect - Pass the virtual background effect.
   */
  async addVirtualBackgroundEffect(effect: TrackEffect): Promise<void> {
    // check if the effect is of kind virtual background
    await this.addEffect('virtual-background', effect);
  }

  /**
   * Adds the blur background effect.
   *
   * @param effect - Pass the blur background effect.
   */
  async addBlurBackgroundEffect(effect: TrackEffect): Promise<void> {
    // add checks for if someone has passed blur background effect
    await this.addEffect('background-blur', effect);
  }

  /**
   * Applies the passed video constraints.
   *
   * @param encoderConfig - Custom encoder config for video.
   */
  setEncoderConfig(encoderConfig: VideoEncoderConfig): void {
    this.getMediaStreamTrack().applyConstraints(encoderConfig);
  }
}
