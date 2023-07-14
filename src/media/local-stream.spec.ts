import { BaseEffect } from '@webex/web-media-effects';
import { createBrowserMock } from '../mocks/create-browser-mock';
import MediaStreamStub from '../mocks/media-stream-stub';
import MediaStreamTrackStub from '../mocks/media-stream-track-stub';
import { mocked } from '../mocks/mock';
import { createMockedStream } from '../util/test-utils';
import { LocalStream } from './local-stream';

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
    it('should change the input track state based on being muted & unmuted', () => {
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
    it('should get the settings of the input track', () => {
      expect.assertions(1);

      const settings = localStream.getSettings();
      expect(settings).toBe(mockStream.getTracks()[0].getSettings());
    });
  });

  describe('stop', () => {
    it('should call the stop method of the input track', () => {
      expect.assertions(1);

      const spy = jest.spyOn(mockStream.getTracks()[0], 'stop');

      localStream.stop();
      expect(spy).toHaveBeenCalledWith();
    });
  });
});

describe('LocalTrack addEffect', () => {
  createBrowserMock(MediaStreamStub, 'MediaStream');

  // eslint-disable-next-line jsdoc/require-jsdoc
  const createMockedTrackEffect = () => {
    const effectTrack = mocked(new MediaStreamTrackStub());
    const effect = {
      dispose: jest.fn().mockResolvedValue(undefined),
      load: jest.fn().mockResolvedValue(effectTrack),
      on: jest.fn(),
    };

    return { effectTrack, effect };
  };

  // TODO: addTrack and removeTrack do not work the current implementation of createMockedStream, so
  // we have to use the stubs here directly for now
  const mockTrack = mocked(new MediaStreamTrackStub()) as unknown as MediaStreamTrack;
  const mockStream = mocked(new MediaStreamStub([mockTrack])) as unknown as MediaStream;
  let localStream: LocalStream;
  beforeEach(() => {
    localStream = new TestLocalStream(mockStream);
  });

  it('loads and uses the effect when there is no loading effect', async () => {
    expect.hasAssertions();

    const { effectTrack, effect } = createMockedTrackEffect();

    const addEffectPromise = localStream.addEffect('test-effect', effect as unknown as BaseEffect);

    await expect(addEffectPromise).resolves.toBeUndefined();
    expect(localStream.outputStream.getTracks()[0]).toBe(effectTrack);
  });

  it('does not use the effect when the loading effect is cleared during load', async () => {
    expect.hasAssertions();

    const { effect } = createMockedTrackEffect();

    // Add effect and immediately dispose all effects to clear loading effects
    const addEffectPromise = localStream.addEffect('test-effect', effect as unknown as BaseEffect);
    await localStream.disposeEffects();

    await expect(addEffectPromise).rejects.toThrow('not required after loading');
    expect(localStream.outputStream).toBe(mockStream);
  });

  it('loads and uses the latest effect when the loading effect changes during load', async () => {
    expect.hasAssertions();
    const { effect: firstEffect } = createMockedTrackEffect();
    const { effectTrack, effect: secondEffect } = createMockedTrackEffect();

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
