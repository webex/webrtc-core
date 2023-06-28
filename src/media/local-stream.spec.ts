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
class TestLocalStream extends LocalStream {}

describe('LocalStream', () => {
  const mockStream = createMockedStream();
  let localStream: LocalStream;
  beforeEach(() => {
    localStream = new TestLocalStream(mockStream);
  });

  describe('setMuted', () => {
    it('should change the output track state based on being muted & unmuted', () => {
      expect.assertions(2);
      // Simulate the default state of the track's enabled state.
      mockStream.getTracks()[0].enabled = true;

      localStream.setMuted(true);
      expect(mockStream.getTracks()[0].enabled).toBe(false);
      localStream.setMuted(false);
      expect(mockStream.getTracks()[0].enabled).toBe(true);
    });
  });

  describe('getSettings', () => {
    it('should get the settings of the output track', () => {
      expect.assertions(1);

      const settings = localStream.getSettings();
      expect(settings).toBe(mockStream.getTracks()[0].getSettings());
    });
  });

  describe('stop', () => {
    it('should call the stop method of the output track', () => {
      expect.assertions(1);

      const spy = jest.spyOn(mockStream.getTracks()[0], 'stop');

      localStream.stop();
      expect(spy).toHaveBeenCalledWith();
    });
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
    expect(localStream.outputStream.getTracks()[0]).toBe(effectTrack);
  });

  it('does not use the effect when the loading effect is cleared during load', async () => {
    expect.hasAssertions();

    const { localStream, mockedStream, effect } = setup();

    // Add effect and immediately dispose all effects to clear loading effects
    const addEffectPromise = localStream.addEffect('test-effect', effect as unknown as BaseEffect);
    await localStream.disposeEffects();

    await expect(addEffectPromise).rejects.toThrow('not required after loading');
    expect(localStream.outputStream).toBe(mockedStream);
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

    expect(localStream.outputStream.getTracks()[0]).toBe(effectTrack);
  });
});
