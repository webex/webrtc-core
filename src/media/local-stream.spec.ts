import { WebrtcCoreError } from '../errors';
import * as media from '.';
import { createMockedAudioStream, createMockedStream } from '../util/test-utils';
import { LocalStream, LocalStreamEventNames, TrackEffect } from './local-stream';
import { StreamEventNames } from './stream';

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

  describe('setUserMuted', () => {
    let emitSpy: jest.SpyInstance;

    beforeEach(() => {
      localStream = new TestLocalStream(mockStream);
      emitSpy = jest.spyOn(localStream[LocalStreamEventNames.UserMuteStateChange], 'emit');
    });

    it('should change the input track enabled state and fire an event', () => {
      expect.assertions(8);

      // Simulate the default state of the track's enabled state.
      mockStream.getTracks()[0].enabled = true;

      localStream.setUserMuted(true);
      expect(mockStream.getTracks()[0].enabled).toBe(false);
      expect(localStream.userMuted).toBe(true);
      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenLastCalledWith(true);

      localStream.setUserMuted(false);
      expect(mockStream.getTracks()[0].enabled).toBe(true);
      expect(localStream.userMuted).toBe(false);
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

  describe('handleAudioConstraintsRequired', () => {
    const audioSettings: MediaTrackSettings = {
      deviceId: 'test-device-id',
      sampleRate: 48000,
      channelCount: 1,
      sampleSize: 16,
      echoCancellation: true,
      autoGainControl: true,
      noiseSuppression: true,
    };

    let audioStream: MediaStream;
    let audioLocalStream: LocalStream;
    let effect: TrackEffect;
    let constraintsHandler: (constraints: MediaTrackConstraints) => Promise<void>;
    let getUserMediaSpy: jest.SpyInstance;
    let newAudioTrack: MediaStreamTrack;

    beforeEach(async () => {
      audioStream = createMockedAudioStream();
      audioLocalStream = new TestLocalStream(audioStream);

      const inputTrack = audioStream.getTracks()[0];
      jest.spyOn(inputTrack, 'getSettings').mockReturnValue(audioSettings);

      const eventHandlers = new Map<string, (...args: unknown[]) => void>();
      effect = {
        id: 'nr-effect',
        kind: 'noise-reduction',
        isEnabled: false,
        dispose: jest.fn().mockResolvedValue(undefined),
        load: jest.fn().mockResolvedValue(undefined),
        replaceInputTrack: jest.fn().mockResolvedValue(undefined),
        on: jest.fn().mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
          eventHandlers.set(event, handler);
        }),
        off: jest.fn(),
      } as unknown as TrackEffect;

      const newMockStream = createMockedAudioStream();
      [newAudioTrack] = newMockStream.getTracks();
      (newMockStream.getAudioTracks as jest.Mock).mockReturnValue([newAudioTrack]);

      getUserMediaSpy = jest.spyOn(media, 'getUserMedia').mockResolvedValue(newMockStream);

      await audioLocalStream.addEffect(effect);
      constraintsHandler = eventHandlers.get('constraints-required') as (
        constraints: MediaTrackConstraints
      ) => Promise<void>;
    });

    afterEach(() => {
      getUserMediaSpy.mockRestore();
    });

    it('should call getUserMedia with current settings and effect constraints', async () => {
      expect.hasAssertions();

      await constraintsHandler({ autoGainControl: false, noiseSuppression: false });

      expect(getUserMediaSpy).toHaveBeenCalledWith({
        audio: {
          deviceId: { exact: 'test-device-id' },
          sampleRate: 48000,
          channelCount: 1,
          sampleSize: 16,
          echoCancellation: true,
          autoGainControl: false,
          noiseSuppression: false,
        },
      });
    });

    it('should skip re-acquisition when constraints are empty and nothing saved', async () => {
      expect.hasAssertions();

      await constraintsHandler({});

      expect(getUserMediaSpy).not.toHaveBeenCalled();
    });

    it('should skip re-acquisition when constraints are already satisfied', async () => {
      expect.hasAssertions();

      await constraintsHandler({ autoGainControl: true, noiseSuppression: true });

      expect(getUserMediaSpy).not.toHaveBeenCalled();
    });

    it('should restore saved user constraints when empty constraints are received', async () => {
      expect.hasAssertions();

      await constraintsHandler({ autoGainControl: false, noiseSuppression: false });
      getUserMediaSpy.mockClear();

      (audioStream.getTracks as jest.Mock).mockReturnValue([newAudioTrack]);
      jest.spyOn(newAudioTrack, 'getSettings').mockReturnValue({
        ...audioSettings,
        autoGainControl: false,
        noiseSuppression: false,
      });

      await constraintsHandler({});

      expect(getUserMediaSpy).toHaveBeenCalledWith({
        audio: expect.objectContaining({
          autoGainControl: true,
          noiseSuppression: true,
        }),
      });
    });

    it('should not restore a second time after saved constraints are cleared', async () => {
      expect.hasAssertions();

      await constraintsHandler({ autoGainControl: false });
      getUserMediaSpy.mockClear();

      (audioStream.getTracks as jest.Mock).mockReturnValue([newAudioTrack]);
      jest.spyOn(newAudioTrack, 'getSettings').mockReturnValue({
        ...audioSettings,
        autoGainControl: false,
      });

      await constraintsHandler({});
      getUserMediaSpy.mockClear();

      await constraintsHandler({});

      expect(getUserMediaSpy).not.toHaveBeenCalled();
    });

    it('should replace the input track on the first effect', async () => {
      expect.hasAssertions();

      await constraintsHandler({ autoGainControl: false });

      expect(effect.replaceInputTrack).toHaveBeenCalledWith(newAudioTrack);
    });

    it('should remove track handlers before stopping the current track', async () => {
      expect.hasAssertions();

      const currentTrack = audioStream.getTracks()[0];
      const callOrder: string[] = [];

      jest.spyOn(currentTrack, 'removeEventListener').mockImplementation(() => {
        callOrder.push('removeEventListener');
      });
      jest.spyOn(currentTrack, 'stop').mockImplementation(() => {
        callOrder.push('stop');
      });

      await constraintsHandler({ autoGainControl: false });

      const firstRemove = callOrder.indexOf('removeEventListener');
      const firstStop = callOrder.indexOf('stop');
      expect(firstRemove).toBeGreaterThanOrEqual(0);
      expect(firstStop).toBeGreaterThan(firstRemove);
    });

    it('should stop the current track before calling getUserMedia', async () => {
      expect.hasAssertions();

      const currentTrack = audioStream.getTracks()[0];
      const callOrder: string[] = [];

      jest.spyOn(currentTrack, 'stop').mockImplementation(() => {
        callOrder.push('stop');
      });
      getUserMediaSpy.mockImplementation(async () => {
        callOrder.push('getUserMedia');
        return createMockedAudioStream();
      });

      await constraintsHandler({ autoGainControl: false });

      expect(callOrder).toStrictEqual(['stop', 'getUserMedia']);
    });

    it('should fall back to getUserMedia without effect constraints when first call fails', async () => {
      expect.hasAssertions();

      const fallbackStream = createMockedAudioStream();
      getUserMediaSpy
        .mockRejectedValueOnce(new Error('OverconstrainedError'))
        .mockResolvedValueOnce(fallbackStream);

      await constraintsHandler({ autoGainControl: false });

      expect(getUserMediaSpy).toHaveBeenCalledTimes(2);
      expect(getUserMediaSpy).toHaveBeenLastCalledWith({
        audio: {
          deviceId: { exact: 'test-device-id' },
          sampleRate: 48000,
          channelCount: 1,
          sampleSize: 16,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
        },
      });
    });

    it('should emit Ended when both getUserMedia calls fail', async () => {
      expect.hasAssertions();

      const endedSpy = jest.spyOn(audioLocalStream[StreamEventNames.Ended], 'emit');

      getUserMediaSpy
        .mockRejectedValueOnce(new Error('OverconstrainedError'))
        .mockRejectedValueOnce(new Error('NotFoundError'));

      await constraintsHandler({ autoGainControl: false });

      expect(getUserMediaSpy).toHaveBeenCalledTimes(2);
      expect(endedSpy).toHaveBeenCalledWith();
    });

    it('should skip re-acquisition when the track is already ended', async () => {
      expect.hasAssertions();

      const currentTrack = audioStream.getTracks()[0];
      (currentTrack as { readyState: string }).readyState = 'ended';

      await constraintsHandler({ autoGainControl: false });

      expect(getUserMediaSpy).not.toHaveBeenCalled();
    });

    it('should not register constraints-required handler for video tracks', async () => {
      expect.hasAssertions();

      const videoStream = createMockedStream();
      const videoLocalStream = new TestLocalStream(videoStream);

      const videoEventHandlers = new Map<string, (...args: unknown[]) => void>();
      const videoEffect = {
        id: 'video-effect',
        kind: 'video-kind',
        isEnabled: false,
        dispose: jest.fn().mockResolvedValue(undefined),
        load: jest.fn().mockResolvedValue(undefined),
        on: jest.fn().mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
          videoEventHandlers.set(event, handler);
        }),
        off: jest.fn(),
      } as unknown as TrackEffect;

      await videoLocalStream.addEffect(videoEffect);

      expect(videoEventHandlers.has('constraints-required')).toBe(false);
      expect(videoEventHandlers.has('track-updated')).toBe(true);
      expect(videoEventHandlers.has('disposed')).toBe(true);
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
