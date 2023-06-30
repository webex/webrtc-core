import { logger } from '../util/logger';
import { LocalStream, LocalStreamEventNames } from './local-stream';

// These are the audio constraints that can be applied via applyConstraints.
export type AppliableAudioConstraints = Pick<
  MediaTrackConstraints,
  'autoGainControl' | 'echoCancellation' | 'noiseSuppression' | 'suppressLocalAudioPlayback'
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
  async applyConstraints(constraints?: AppliableAudioConstraints): Promise<void> {
    logger.log(`Applying constraints to local track:`, constraints);
    return this.inputTrack.applyConstraints(constraints).then(() => {
      this[LocalStreamEventNames.ConstraintsChange].emit();
    });
  }
}
