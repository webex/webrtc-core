import { logger } from '../util/logger';
import { LocalStream, LocalStreamEventNames } from './local-stream';

// TODO: see note on AudioConstraints in local-audio-stream
export type VideoConstraints = Partial<
  Pick<MediaTrackConstraints, 'aspectRatio' | 'facingMode' | 'frameRate' | 'height' | 'width'>
>;

// TODO: content hint api/type should move here

/**
 * A video LocalStream.
 */
export class LocalVideoStream extends LocalStream {
  /**
   * Apply constraints to the stream.
   *
   * @param constraints - The constraints to apply.
   * @returns A promise which resolves when the constraints have been successfully applied.
   */
  async applyConstraints(constraints?: VideoConstraints): Promise<void> {
    logger.log(`Applying constraints to local track:`, constraints);
    return this.originTrack.applyConstraints(constraints).then(() => {
      this[LocalStreamEventNames.ConstraintsChange].emit();
    });
  }

  /**
   * Check the resolution and then return how many layers will be active.
   *
   * @returns The active layers count.
   */
  getNumActiveSimulcastLayers(): number {
    let activeSimulcastLayersNumber = 0;
    const videoHeight = this.originTrack.getSettings().height;
    if ((videoHeight as number) <= 180) {
      activeSimulcastLayersNumber = 1;
    } else if ((videoHeight as number) <= 360) {
      activeSimulcastLayersNumber = 2;
    } else {
      activeSimulcastLayersNumber = 3;
    }
    return activeSimulcastLayersNumber;
  }
}
