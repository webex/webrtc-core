import { LocalTrack } from './local-track';

export type MicrophoneConstraints = Pick<
  MediaTrackConstraints,
  | 'deviceId'
  | 'echoCancellation'
  | 'autoGainControl'
  | 'noiseSuppression'
  | 'sampleRate'
  | 'sampleSize'
  | 'channelCount'
>;

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
  setEncoderConfig(encoderConfig: MicrophoneConstraints): void {
    this.getMediaStreamTrack().applyConstraints(encoderConfig);
  }
}
