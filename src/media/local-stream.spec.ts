import { WebrtcCoreError } from '../errors';
import { createMockedStream } from '../util/test-utils';
import { LocalStream, LocalStreamEventNames, TrackEffect } from './local-stream';

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

  describe('addEffect', () => {
    let effect: TrackEffect;
    let loadSpy: jest.SpyInstance;
    let emitSpy: jest.SpyInstance;

    beforeEach(() => {
      effect = {
        id: 'test-id',
        kind: 'test-kind',
        isEnabled: false,
        dispose: jest.fn().mockResolvedValue(undefined),
        load: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
      } as unknown as TrackEffect;

      loadSpy = jest.spyOn(effect, 'load');
      emitSpy = jest.spyOn(localStream[LocalStreamEventNames.EffectAdded], 'emit');
    });

    it('should load and add an effect', async () => {
      expect.hasAssertions();

      const addEffectPromise = localStream.addEffect(effect);

      await expect(addEffectPromise).resolves.toBeUndefined();
      expect(loadSpy).toHaveBeenCalledWith(mockStream.getTracks()[0]);
      expect(localStream.getEffects()).toStrictEqual([effect]);
      expect(emitSpy).toHaveBeenCalledWith(effect);
    });

    it('should load and add multiple effects with different IDs and kinds', async () => {
      expect.hasAssertions();

      const firstEffect = effect;
      const secondEffect = {
        ...effect,
        id: 'another-id',
        kind: 'another-kind',
      } as unknown as TrackEffect;
      await localStream.addEffect(firstEffect);
      await localStream.addEffect(secondEffect);

      expect(loadSpy).toHaveBeenCalledTimes(2);
      expect(localStream.getEffects()).toStrictEqual([firstEffect, secondEffect]);
      expect(emitSpy).toHaveBeenCalledTimes(2);
    });

    it('should not load an effect with the same ID twice', async () => {
      expect.hasAssertions();

      await localStream.addEffect(effect);
      const secondAddEffectPromise = localStream.addEffect(effect);

      await expect(secondAddEffectPromise).resolves.toBeUndefined(); // no-op
      expect(loadSpy).toHaveBeenCalledTimes(1);
      expect(localStream.getEffects()).toStrictEqual([effect]);
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if an effect of the same kind is added while loading', async () => {
      expect.hasAssertions();

      const firstEffect = effect;
      const secondEffect = { ...effect, id: 'another-id' } as unknown as TrackEffect; // same kind
      const firstAddEffectPromise = localStream.addEffect(firstEffect);
      const secondAddEffectPromise = localStream.addEffect(secondEffect);

      await expect(firstAddEffectPromise).rejects.toBeInstanceOf(WebrtcCoreError);
      await expect(secondAddEffectPromise).resolves.toBeUndefined();
      expect(loadSpy).toHaveBeenCalledTimes(2);
      expect(localStream.getEffects()).toStrictEqual([secondEffect]);
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should replace the effect if an effect of the same kind is added after loading', async () => {
      expect.hasAssertions();

      const firstEffect = effect;
      const secondEffect = { ...effect, id: 'another-id' } as unknown as TrackEffect; // same kind
      await localStream.addEffect(firstEffect);
      const secondAddEffectPromise = localStream.addEffect(secondEffect);

      await expect(secondAddEffectPromise).resolves.toBeUndefined();
      expect(loadSpy).toHaveBeenCalledTimes(2);
      expect(localStream.getEffects()).toStrictEqual([secondEffect]);
      expect(emitSpy).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if effects are cleared while loading', async () => {
      expect.hasAssertions();

      const addEffectPromise = localStream.addEffect(effect);
      await localStream.disposeEffects();

      await expect(addEffectPromise).rejects.toBeInstanceOf(WebrtcCoreError);
      expect(loadSpy).toHaveBeenCalledTimes(1);
      expect(localStream.getEffects()).toStrictEqual([]);
      expect(emitSpy).toHaveBeenCalledTimes(0);
    });
  });
});
