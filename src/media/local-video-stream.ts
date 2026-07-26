import { AddEvents, TypedEvent, WithEventsDummyType } from '@webex/ts-events';
import { logger } from '../util/logger';
import { LocalStream, LocalStreamEventNames } from './local-stream';

// These are the video constraints that can be applied via applyConstraints.
export type AppliableVideoConstraints = Pick<
  MediaTrackConstraints,
  'aspectRatio' | 'frameRate' | 'height' | 'width'
>;

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/contentHint.
 */
export type VideoContentHint = 'motion' | 'detail' | 'text' | '';

export enum LocalVideoStreamEventNames {
  ContentHintChange = 'content-hint-change',
}

interface LocalVideoStreamEvents {
  [LocalVideoStreamEventNames.ContentHintChange]: TypedEvent<
    (contentHint: VideoContentHint) => void
  >;
}

/**
 * A video LocalStream.
 */
class _LocalVideoStream extends LocalStream {
  [LocalVideoStreamEventNames.ContentHintChange] = new TypedEvent<
    (contentHint: VideoContentHint) => void
  >();

  /**
   * Apply constraints to the stream.
   *
   * @param constraints - The constraints to apply.
   * @returns A promise which resolves when the constraints have been successfully applied.
   */
  async applyConstraints(constraints?: AppliableVideoConstraints): Promise<void> {
    logger.log(`Applying constraints to local track:`, constraints);
    return this.inputTrack.applyConstraints(constraints).then(() => {
      this[LocalStreamEventNames.ConstraintsChange].emit();
    });
  }

  /**
   * Get the content hint for this stream.
   *
   * @returns The content hint setting for this stream, or undefined if none has been set.
   */
  get contentHint(): VideoContentHint {
    return this.inputTrack.contentHint as VideoContentHint;
  }

  /**
   * Set the content hint for this stream.
   *
   * @param hint - The content hint to set.
   */
  set contentHint(hint: VideoContentHint) {
    if (this.inputTrack.contentHint !== hint) {
      this.inputTrack.contentHint = hint;
      this[LocalVideoStreamEventNames.ContentHintChange].emit(hint);
    }
  }

  /**
   * Check the resolution and then return how many layers will be active.
   *
   * @returns The active layers count.
   */
  getNumActiveSimulcastLayers(): number {
    let activeSimulcastLayersNumber = 0;
    const videoHeight = this.inputTrack.getSettings().height;
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

export const LocalVideoStream = AddEvents<typeof _LocalVideoStream, LocalVideoStreamEvents>(
  _LocalVideoStream
);

export type LocalVideoStream = _LocalVideoStream & WithEventsDummyType<LocalVideoStreamEvents>;
