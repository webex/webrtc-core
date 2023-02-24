import { LocalTrack } from './local-track';

export type MicrophoneConstraints = Pick<
  MediaTrackConstraints,
  'deviceId' | 'echoCancellation' | 'sampleRate' | 'sampleSize' | 'channelCount'
>;

/**
 * Represents a audio track for a audio source.
 */
export class LocalAudioTrack extends LocalTrack {
  /**
   * Makes sure to apply the encoderConstraints for the audio.
   *
   * @param encoderConstraints - Encoder constraints for audio.
   */
  setEncoderConstraints(encoderConstraints: MicrophoneConstraints): void {
    this.getMediaStreamTrack().applyConstraints(encoderConstraints);
  }
}
