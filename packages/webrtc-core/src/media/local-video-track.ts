import { LocalTrack } from './local-track';

export enum FacingMode {
  user = 'user',
  environment = 'environment',
}

export enum DisplaySurface {
  browser = 'browser',
  monitor = 'monitor',
  window = 'window',
}

type BaseVideoConstraints = Pick<
  MediaTrackConstraints,
  'aspectRatio' | 'height' | 'width' | 'frameRate' | 'deviceId'
>;

type BaseDisplayConstraints = Pick<
  MediaTrackConstraints,
  'aspectRatio' | 'height' | 'width' | 'frameRate' | 'deviceId' | 'suppressLocalAudioPlayback'
>;

export interface CameraConstraints extends BaseVideoConstraints {
  facingMode?: FacingMode;
}

export interface DisplayConstraints extends BaseDisplayConstraints {
  displaySurface?: DisplaySurface;
  logicalSurface?: boolean;
}

/**
 * A class to map resolution with video constraints.
 */
export const PresetCameraConstraints: { [key: string]: CameraConstraints } = {
  '1080p': { frameRate: 30, width: 1920, height: 1080 },

  '720p': { frameRate: 30, width: 1280, height: 720 },

  '480p': { frameRate: 30, width: 640, height: 480 },

  '360p': { frameRate: 30, width: 640, height: 360 },

  '240p': { frameRate: 30, width: 320, height: 240 },

  '180p': { frameRate: 30, width: 320, height: 180 },

  '120p': { frameRate: 30, width: 160, height: 120 },
};

/**
 * Represents a local video track.
 */
export class LocalVideoTrack extends LocalTrack {
  /**
   * Applies the passed video constraints.
   *
   * @param encoderConstraints - Custom encoder constraints  for video.
   */
  setEncoderConstraints(encoderConstraints: CameraConstraints): void {
    this.getMediaStreamTrack().applyConstraints(encoderConstraints);
  }
}
