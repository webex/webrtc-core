import { logger } from '../util/logger';
import { LocalStream, LocalStreamEventNames } from './local-stream';

// TODO: for applyConstraints, we only support things which can be changed on the
// track itself.  This would not include 'deviceId', and maybe more of these values.
// Might need to define one AudioConstraints for use with getUserMedia, and refine
// it even further for applyConstraints here.
export type AudioConstraints = Pick<
  MediaTrackConstraints,
  | 'autoGainControl'
  | 'channelCount'
  | 'deviceId'
  | 'echoCancellation'
  | 'noiseSuppression'
  | 'sampleRate'
  | 'suppressLocalAudioPlayback'
>;

/**
 * An audio LocalStream.
 */
export class LocalAudioStream extends LocalStream {
  /**
   * Apply constraints to the stream.
   *
   * @param constraints - The constraints to apply.
   * @returns A promise which resolves when the constraints have been successfully applied.
   */
  async applyConstraints(constraints?: AudioConstraints): Promise<void> {
    logger.log(`Applying constraints to local track:`, constraints);
    return this.originTrack.applyConstraints(constraints).then(() => {
      this[LocalStreamEventNames.ConstraintsChange].emit();
    });
  }
}
