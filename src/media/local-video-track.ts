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

/**
 * A class to map resolution with video constraints.
 */
export const StaticVideoEncoderConfig: { [key: string]: VideoEncoderConfig } = {
  '1080p': { frameRate: 15, bitrateMax: 2080, width: 1920, height: 1080 },

  '720p': { frameRate: 15, bitrateMax: 1130, width: 1280, height: 720 },

  '480p': { frameRate: 15, bitrateMax: 500, width: 640, height: 480 },

  '360p': { frameRate: 15, bitrateMax: 400, width: 640, height: 360 },

  '240p': { frameRate: 15, bitrateMax: 200, width: 320, height: 240 },

  '180p': { frameRate: 15, bitrateMax: 140, width: 320, height: 180 },

  '120p': { frameRate: 15, bitrateMax: 65, width: 160, height: 120 },
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
  /**
   * Applies the passed video constraints.
   *
   * @param encoderConfig - Custom encoder config for video.
   */
  setEncoderConfig(encoderConfig: VideoEncoderConfig): void {
    this.getMediaStreamTrack().applyConstraints(encoderConfig);
  }
}
