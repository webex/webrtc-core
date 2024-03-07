import { BrowserInfo } from '@webex/web-capabilities';
import { AppliableVideoConstraints, LocalVideoStream } from './local-video-stream';

export const defaultLocalDisplayStreamFrameRateConstraint: ConstrainDoubleRange = { min: 2 };

/**
 * A local display stream.
 */
export class LocalDisplayStream extends LocalVideoStream {
  /**
   * @inheritdoc
   */
  async applyConstraints(constraints?: AppliableVideoConstraints): Promise<void> {
    let modifiedConstraints = { ...constraints };

    // Chrome and Edge need a minimum frame rate of 2 to prevent share video from muting when the share content is static.
    // See https://issues.chromium.org/issues/326917480.
    if (BrowserInfo.isChrome() || BrowserInfo.isEdge()) {
      if (constraints?.frameRate) {
        if (typeof constraints.frameRate === 'number') {
          modifiedConstraints.frameRate = {
            ...defaultLocalDisplayStreamFrameRateConstraint,
            ideal: constraints.frameRate, // TODO: do we need to check ideal is less than min?
          };
        } else {
          modifiedConstraints.frameRate = {
            ...defaultLocalDisplayStreamFrameRateConstraint,
            ...constraints.frameRate,
          };
        }
      } else {
        modifiedConstraints = {
          ...constraints,
          frameRate: defaultLocalDisplayStreamFrameRateConstraint,
        };
      }
    }

    return super.applyConstraints(modifiedConstraints);
  }
}
