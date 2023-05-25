import { BaseEffect } from '@webex/web-media-effects';
import MediaStreamStub from '../mocks/media-stream-stub';
import MediaStreamTrackStub from '../mocks/media-stream-track-stub';
import { mocked } from '../mocks/mock';
import { createMockedStream } from '../util/test-utils';
import { LocalStream } from './local-stream';

/**
 * Create a mocked track effect.
 *
 * @returns A mocked TrackEvent.
 */
const createMockedTrackEffect = () => {
  const effectTrack = mocked(new MediaStreamTrackStub());
  const effect = {
    dispose: jest.fn().mockResolvedValue(undefined),
    load: jest.fn().mockResolvedValue(effectTrack),
    on: jest.fn(),
  };

  return { effectTrack, effect };
};

/**
 * A dummy LocalStream implementation so we can instantiate it for testing.
 */
class TestLocalStream extends LocalStream {
  /**
   * Fake method to get output stream.
   *
   * @returns The output stream.
   */
  getOutputStream() {
    return this.outputStream;
  }

  /**
   * Fake method to get output track.
   *
   * @returns The output track.
   */
  getOutputTrack() {
    return this.outputStream.getTracks()[0];
  }
}

describe('LocalStream', () => {
  const mockStream = createMockedStream();
  let localStream: LocalStream;
  beforeEach(() => {
    localStream = new TestLocalStream(mockStream);
  });

  it('should change the underlying track state based on being muted & unmuted', () => {
    expect.assertions(2);
    // Simulate the default state of the track's enabled state.
    mockStream.getTracks()[0].enabled = true;

    localStream.setMuted(true);
    expect(mockStream.getTracks()[0].enabled).toBe(false);
    localStream.setMuted(false);
    expect(mockStream.getTracks()[0].enabled).toBe(true);
  });
});

describe('LocalTrack addEffect', () => {
  // eslint-disable-next-line jsdoc/require-jsdoc
  const setup = () => {
    const mockedStream = mocked(new MediaStreamStub());
    const localStream = new TestLocalStream(mockedStream as unknown as MediaStream);
    const { effectTrack, effect } = createMockedTrackEffect();
    return { mockedStream, localStream, effectTrack, effect };
  };

  it('loads and uses the effect when there is no loading effect', async () => {
    expect.hasAssertions();

    const { localStream, effectTrack, effect } = setup();

    const addEffectPromise = localStream.addEffect('test-effect', effect as unknown as BaseEffect);

    await expect(addEffectPromise).resolves.toBeUndefined();
    expect(localStream.getOutputTrack()).toBe(effectTrack);
  });

  it('does not use the effect when the loading effect is cleared during load', async () => {
    expect.hasAssertions();

    const { localStream, mockedStream, effect } = setup();

    // Add effect and immediately dispose all effects to clear loading effects
    const addEffectPromise = localStream.addEffect('test-effect', effect as unknown as BaseEffect);
    await localStream.disposeEffects();

    await expect(addEffectPromise).rejects.toThrow('not required after loading');
    expect(localStream.getOutputStream()).toBe(mockedStream);
  });

  it('loads and uses the latest effect when the loading effect changes during load', async () => {
    expect.hasAssertions();
    const { effect: firstEffect } = createMockedTrackEffect();
    const { localStream, effectTrack, effect: secondEffect } = setup();

    const firstAddEffectPromise = localStream.addEffect(
      'test-effect',
      firstEffect as unknown as BaseEffect
    );
    const secondAddEffectPromise = localStream.addEffect(
      'test-effect',
      secondEffect as unknown as BaseEffect
    );
    await expect(firstAddEffectPromise).rejects.toThrow('not required after loading');
    await expect(secondAddEffectPromise).resolves.toBeUndefined();

    expect(localStream.getOutputTrack()).toBe(effectTrack);
  });
});
