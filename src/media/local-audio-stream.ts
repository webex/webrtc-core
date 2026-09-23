import { logger } from '../util/logger';
import { LocalStream, LocalStreamEventNames } from './local-stream';

// Audio constraints that can be applied via applyConstraints.
export type AppliableAudioConstraints = Pick<
  MediaTrackConstraints,
  | 'autoGainControl'
  | 'echoCancellation'
  | 'noiseSuppression'
  | 'sampleRate'
  | 'sampleSize'
  | 'channelCount'
>;

/**
 * An audio LocalStream.
 */
export class LocalAudioStream extends LocalStream {
  /**
   * Apply constraints to the existing input track.
   *
   * Note: on Chrome, `applyConstraints` silently ignores `autoGainControl`,
   * `echoCancellation`, and `noiseSuppression` — the promise resolves but the
   * value stays unchanged. To change those reliably, use an effect that emits
   * a `constraints-required` event.
   * See https://issues.chromium.org/issues/40555809.
   *
   * @param constraints - The constraints to apply.
   * @returns Resolves when the browser finishes processing the request.
   */
  async applyConstraints(constraints?: AppliableAudioConstraints): Promise<void> {
    logger.log(`Applying constraints to local track:`, constraints);
    return this.inputTrack.applyConstraints(constraints).then(() => {
      this[LocalStreamEventNames.ConstraintsChange].emit();
    });
  }
}
