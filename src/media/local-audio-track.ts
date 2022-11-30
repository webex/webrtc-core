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
  /**
   * Makes sure to apply the encoderConfig for the audio.
   *
   * @param encoderConfig - Encoder config for audio.
   */
  setEncoderConfig(encoderConfig: AudioEncoderConfig): void {
    this.getMediaStreamTrack().applyConstraints(encoderConfig);
  }
}
