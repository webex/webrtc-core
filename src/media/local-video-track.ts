import { LocalTrack } from './local-track';

export enum FacingMode {
  user = 'user',
  environment = 'environment',
}

export enum OptimizationMode {
  motion = 'motion',
  detail = 'detail',
}

type BaseVideoConstraints = Pick<
  MediaTrackConstraints,
  'aspectRatio' | 'height' | 'width' | 'frameRate' | 'deviceId'
>;

export interface VideoConstraints extends BaseVideoConstraints {
  facingMode?: FacingMode;
  optimizationMode?: OptimizationMode;
}

/**
 * A class to map resolution with video constraints.
 */
export const StaticVideoEncoderConfig: { [key: string]: VideoConstraints } = {
  '1080p': { frameRate: 15, width: 1920, height: 1080 },

  '720p': { frameRate: 15, width: 1280, height: 720 },

  '480p': { frameRate: 15, width: 640, height: 480 },

  '360p': { frameRate: 15, width: 640, height: 360 },

  '240p': { frameRate: 15, width: 320, height: 240 },

  '180p': { frameRate: 15, width: 320, height: 180 },

  '120p': { frameRate: 15, width: 160, height: 120 },
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
   * @param constraints - Custom encoder config for video.
   */
  setEncoderConfig(constraints: VideoConstraints): void {
    this.getMediaStreamTrack().applyConstraints(constraints);
  }
}
