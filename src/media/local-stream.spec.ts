import { WebrtcCoreError } from '../errors';
import { createMockedStream } from '../util/test-utils';
import { LocalStream, LocalStreamEventNames, TrackEffect } from './local-stream';

/**
 * A dummy LocalStream implementation, so we can instantiate it for testing.
 */
class TestLocalStream extends LocalStream {}

describe('LocalStream', () => {
  const mockStream = createMockedStream();
  let localStream: LocalStream;

  beforeEach(() => {
    localStream = new TestLocalStream(mockStream);
  });

  describe('constructor', () => {
    it('should add the correct event handlers on the track', () => {
      expect.assertions(4);

      const addEventListenerSpy = jest.spyOn(mockStream.getTracks()[0], 'addEventListener');

      expect(addEventListenerSpy).toHaveBeenCalledTimes(3);
      expect(addEventListenerSpy).toHaveBeenCalledWith('ended', expect.anything());
      expect(addEventListenerSpy).toHaveBeenCalledWith('mute', expect.anything());
      expect(addEventListenerSpy).toHaveBeenCalledWith('unmute', expect.anything());
    });
  });

  describe('setMuted', () => {
    let emitSpy: jest.SpyInstance;

    beforeEach(() => {
      localStream = new TestLocalStream(mockStream);
      emitSpy = jest.spyOn(localStream[LocalStreamEventNames.UserMuteStateChange], 'emit');
    });

    it('should change the input track enabled state and fire an event', () => {
      expect.assertions(6);

      // Simulate the default state of the track's enabled state.
      mockStream.getTracks()[0].enabled = true;

      localStream.setUserMuted(true);
      expect(mockStream.getTracks()[0].enabled).toBe(false);
      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenLastCalledWith(true);

      localStream.setUserMuted(false);
      expect(mockStream.getTracks()[0].enabled).toBe(true);
      expect(emitSpy).toHaveBeenCalledTimes(2);
      expect(emitSpy).toHaveBeenLastCalledWith(false);
    });

    it('should not fire an event if the same mute state is set twice', () => {
      expect.assertions(1);

      // Simulate the default state of the track's enabled state.
      mockStream.getTracks()[0].enabled = true;

      localStream.setUserMuted(false);
      expect(emitSpy).toHaveBeenCalledTimes(0);
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

  describe('toJSON', () => {
    it('should correctly serialize data', () => {
      expect.assertions(1);

      const testLocalStream = new TestLocalStream(mockStream);
      const jsonLocalStream = localStream.toJSON();
      const jsonTestLocalStream = testLocalStream.toJSON();

      expect(JSON.stringify(jsonLocalStream)).toStrictEqual(JSON.stringify(jsonTestLocalStream));
    });

    it('should return an object with inputStream, outputStream and effects properties', () => {
      expect.assertions(6);

      const jsonLocalStream = localStream.toJSON();

      expect(jsonLocalStream).toHaveProperty('muted');
      expect(jsonLocalStream).toHaveProperty('label');
      expect(jsonLocalStream).toHaveProperty('readyState');
      expect(jsonLocalStream).toHaveProperty('inputStream');
      expect(jsonLocalStream).toHaveProperty('outputStream');
      expect(jsonLocalStream).toHaveProperty('effects');
    });
  });
});
