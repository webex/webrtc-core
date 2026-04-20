import * as media from '.';
import { getSupportedConstraints } from '../mocks/media-track-supported-constraints';
import { createMockedAudioStream, createMockedStream } from '../util/test-utils';
import { LocalAudioStream } from './local-audio-stream';
import { LocalStream, LocalStreamEventNames, TrackEffect } from './local-stream';
import { StreamEventNames } from './stream';

/** Bare LocalStream subclass — used to assert non-audio streams don't get constraint handlers. */
class TestLocalStream extends LocalStream {}

describe('LocalAudioStream', () => {
  describe('audio constraints handling', () => {
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
    let audioLocalStream: LocalAudioStream;
    let effect: TrackEffect;
    let constraintsRequiredHandler: (constraints: MediaTrackConstraints) => Promise<void>;
    let constraintsReleasedHandler: () => Promise<void>;
    let getUserMediaSpy: jest.SpyInstance;
    let newAudioTrack: MediaStreamTrack;

    // jsdom doesn't expose getSupportedConstraints; stub it so the filter behaves like a real browser.
    let originalMediaDevices: MediaDevices | undefined;

    beforeEach(async () => {
      originalMediaDevices = navigator.mediaDevices;
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {
          ...(originalMediaDevices ?? {}),
          getSupportedConstraints,
        },
      });

      audioStream = createMockedAudioStream();
      audioLocalStream = new LocalAudioStream(audioStream);

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
      constraintsRequiredHandler = eventHandlers.get('constraints-required') as (
        constraints: MediaTrackConstraints
      ) => Promise<void>;
      constraintsReleasedHandler = eventHandlers.get('constraints-released') as () => Promise<void>;
    });

    afterEach(() => {
      getUserMediaSpy.mockRestore();
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: originalMediaDevices,
      });
    });

    it('should call getUserMedia with current settings and effect constraints', async () => {
      expect.hasAssertions();

      await constraintsRequiredHandler({ autoGainControl: false, noiseSuppression: false });

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

    it('should drop unsupported settings names before passing them to getUserMedia', async () => {
      expect.hasAssertions();

      const inputTrack = audioStream.getTracks()[0];
      // Non-standard keys that show up in getSettings() but aren't valid constraints —
      // the filter should strip them before they reach getUserMedia.
      (inputTrack.getSettings as jest.Mock).mockReturnValue({
        ...audioSettings,
        restrictOwnAudio: true,
        suppressLocalAudioPlayback: false,
      } as MediaTrackSettings);

      await constraintsRequiredHandler({ autoGainControl: false });

      const passedConstraints = getUserMediaSpy.mock.calls[0][0].audio;
      expect(passedConstraints).not.toHaveProperty('restrictOwnAudio');
      expect(passedConstraints).not.toHaveProperty('suppressLocalAudioPlayback');
      expect(passedConstraints).toMatchObject({
        deviceId: { exact: 'test-device-id' },
        autoGainControl: false,
      });
    });

    it('should skip re-acquisition when nothing is saved and constraints are released', async () => {
      expect.hasAssertions();

      await constraintsReleasedHandler();

      expect(getUserMediaSpy).not.toHaveBeenCalled();
    });

    it('should skip re-acquisition when constraints are already satisfied', async () => {
      expect.hasAssertions();

      await constraintsRequiredHandler({ autoGainControl: true, noiseSuppression: true });

      expect(getUserMediaSpy).not.toHaveBeenCalled();
    });

    it('should restore saved user constraints when constraints are released', async () => {
      expect.hasAssertions();

      await constraintsRequiredHandler({ autoGainControl: false, noiseSuppression: false });
      getUserMediaSpy.mockClear();

      (audioStream.getTracks as jest.Mock).mockReturnValue([newAudioTrack]);
      jest.spyOn(newAudioTrack, 'getSettings').mockReturnValue({
        ...audioSettings,
        autoGainControl: false,
        noiseSuppression: false,
      });

      await constraintsReleasedHandler();

      expect(getUserMediaSpy).toHaveBeenCalledWith({
        audio: expect.objectContaining({
          autoGainControl: true,
          noiseSuppression: true,
        }),
      });
    });

    it('should not restore a second time after saved constraints are cleared', async () => {
      expect.hasAssertions();

      await constraintsRequiredHandler({ autoGainControl: false });
      getUserMediaSpy.mockClear();

      (audioStream.getTracks as jest.Mock).mockReturnValue([newAudioTrack]);
      jest.spyOn(newAudioTrack, 'getSettings').mockReturnValue({
        ...audioSettings,
        autoGainControl: false,
      });

      await constraintsReleasedHandler();
      getUserMediaSpy.mockClear();

      await constraintsReleasedHandler();

      expect(getUserMediaSpy).not.toHaveBeenCalled();
    });

    it('should preserve the saved baseline when a later constraints-required falls back', async () => {
      expect.hasAssertions();

      // First required: succeeds, saves AGC=true as the baseline.
      await constraintsRequiredHandler({ autoGainControl: false });

      // Track now reports the effect-modified AGC=false.
      (audioStream.getTracks as jest.Mock).mockReturnValue([newAudioTrack]);
      jest.spyOn(newAudioTrack, 'getSettings').mockReturnValue({
        ...audioSettings,
        autoGainControl: false,
      });

      // Second required: primary getUserMedia fails, fallback succeeds.
      const fallbackStream = createMockedAudioStream();
      const [fallbackTrack] = fallbackStream.getAudioTracks();
      jest.spyOn(fallbackTrack, 'getSettings').mockReturnValue({
        ...audioSettings,
        autoGainControl: false,
      });
      getUserMediaSpy
        .mockRejectedValueOnce(new Error('OverconstrainedError'))
        .mockResolvedValueOnce(fallbackStream);

      await constraintsRequiredHandler({ noiseSuppression: false });

      (audioStream.getTracks as jest.Mock).mockReturnValue([fallbackTrack]);
      getUserMediaSpy.mockClear();

      // Released: must restore the original AGC=true and NS=true baseline.
      await constraintsReleasedHandler();

      expect(getUserMediaSpy).toHaveBeenCalledTimes(1);
      expect(getUserMediaSpy).toHaveBeenLastCalledWith({
        audio: expect.objectContaining({
          autoGainControl: true,
          noiseSuppression: true,
        }),
      });
    });

    it('should replace the input track on the first effect', async () => {
      expect.hasAssertions();

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(effect.replaceInputTrack).toHaveBeenCalledWith(newAudioTrack);
    });

    it('should emit ConstraintsChange after a successful re-acquisition', async () => {
      expect.hasAssertions();

      const constraintsChangeSpy = jest.spyOn(
        audioLocalStream[LocalStreamEventNames.ConstraintsChange],
        'emit'
      );

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(constraintsChangeSpy).toHaveBeenCalledWith();
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

      await constraintsRequiredHandler({ autoGainControl: false });

      const firstRemove = callOrder.indexOf('removeEventListener');
      const firstStop = callOrder.indexOf('stop');
      expect(firstRemove).toBeGreaterThanOrEqual(0);
      expect(firstStop).toBeGreaterThan(firstRemove);
    });

    it('should stop the current track after getUserMedia succeeds', async () => {
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

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(callOrder).toStrictEqual(['getUserMedia', 'stop']);
    });

    it('should fall back to getUserMedia without effect constraints when first call fails', async () => {
      expect.hasAssertions();

      const fallbackStream = createMockedAudioStream();
      getUserMediaSpy
        .mockRejectedValueOnce(new Error('OverconstrainedError'))
        .mockResolvedValueOnce(fallbackStream);

      await constraintsRequiredHandler({ autoGainControl: false });

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

    it('should emit Ended when both getUserMedia calls fail and the input track is ended', async () => {
      expect.hasAssertions();

      const endedSpy = jest.spyOn(audioLocalStream[StreamEventNames.Ended], 'emit');

      const inputTrack = audioStream.getTracks()[0];
      getUserMediaSpy.mockImplementationOnce(async () => {
        // Device disappears mid-flight: track ends before gUM resolves.
        (inputTrack as { readyState: string }).readyState = 'ended';
        throw new Error('OverconstrainedError');
      });
      getUserMediaSpy.mockRejectedValueOnce(new Error('NotFoundError'));

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(getUserMediaSpy).toHaveBeenCalledTimes(2);
      expect(endedSpy).toHaveBeenCalledWith();
    });

    it('should fall back to raw mic and tear down the chain when both getUserMedia calls fail but the track is still live', async () => {
      expect.hasAssertions();

      const endedSpy = jest.spyOn(audioLocalStream[StreamEventNames.Ended], 'emit');
      const constraintsChangeSpy = jest.spyOn(
        audioLocalStream[LocalStreamEventNames.ConstraintsChange],
        'emit'
      );
      const changeOutputTrackSpy = jest.spyOn(
        audioLocalStream as unknown as { changeOutputTrack: (t: MediaStreamTrack) => void },
        'changeOutputTrack'
      );

      const inputTrack = audioStream.getTracks()[0];
      (inputTrack as { readyState: string }).readyState = 'live';

      // Simulate NoiseReductionEffect, which emits constraints-released from dispose().
      (effect.dispose as jest.Mock).mockImplementation(async () => {
        await constraintsReleasedHandler();
      });

      // Simulate a second effect still being loaded by addEffect() at the moment of fallback.
      const { loadingEffects } = audioLocalStream as unknown as {
        loadingEffects: Map<string, TrackEffect>;
      };
      const pendingEffect = { id: 'pending', kind: 'noise-reduction' } as unknown as TrackEffect;
      loadingEffects.set(pendingEffect.kind, pendingEffect);

      getUserMediaSpy
        .mockRejectedValueOnce(new Error('OverconstrainedError'))
        .mockRejectedValueOnce(new Error('NotFoundError'));

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(getUserMediaSpy).toHaveBeenCalledTimes(2);
      expect(changeOutputTrackSpy).toHaveBeenCalledWith(inputTrack);
      expect(effect.dispose).toHaveBeenCalledWith();
      expect((audioLocalStream as unknown as { effects: TrackEffect[] }).effects).not.toContain(
        effect
      );
      expect(loadingEffects.size).toBe(0);
      expect(constraintsChangeSpy).not.toHaveBeenCalled();
      expect(endedSpy).not.toHaveBeenCalled();
    });

    it('should skip re-acquisition when the track is already ended', async () => {
      expect.hasAssertions();

      const currentTrack = audioStream.getTracks()[0];
      (currentTrack as { readyState: string }).readyState = 'ended';

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(getUserMediaSpy).not.toHaveBeenCalled();
    });

    it('should discard new track when effect is disposed during getUserMedia', async () => {
      expect.hasAssertions();

      const endedSpy = jest.spyOn(audioLocalStream[StreamEventNames.Ended], 'emit');
      const constraintsChangeSpy = jest.spyOn(
        audioLocalStream[LocalStreamEventNames.ConstraintsChange],
        'emit'
      );
      const newTrackStopSpy = jest.spyOn(newAudioTrack, 'stop');

      // eslint-disable-next-line jsdoc/require-jsdoc, @typescript-eslint/no-empty-function
      let resolveGetUserMedia: (stream: MediaStream) => void = () => {};
      getUserMediaSpy.mockReturnValueOnce(
        new Promise<MediaStream>((resolve) => {
          resolveGetUserMedia = resolve;
        })
      );

      const handlerPromise = constraintsRequiredHandler({ autoGainControl: false });

      await audioLocalStream.disposeEffects();

      const newMockStream = createMockedAudioStream();
      (newMockStream.getAudioTracks as jest.Mock).mockReturnValue([newAudioTrack]);
      resolveGetUserMedia(newMockStream);

      await handlerPromise;

      expect(newTrackStopSpy).toHaveBeenCalledWith();
      expect(endedSpy).not.toHaveBeenCalled();
      expect(constraintsChangeSpy).not.toHaveBeenCalled();
      expect(effect.replaceInputTrack).not.toHaveBeenCalled();
    });

    it('should discard new track when stream is stopped during getUserMedia', async () => {
      expect.hasAssertions();

      const constraintsChangeSpy = jest.spyOn(
        audioLocalStream[LocalStreamEventNames.ConstraintsChange],
        'emit'
      );
      const newTrackStopSpy = jest.spyOn(newAudioTrack, 'stop');

      // eslint-disable-next-line jsdoc/require-jsdoc, @typescript-eslint/no-empty-function
      let resolveGetUserMedia: (stream: MediaStream) => void = () => {};
      getUserMediaSpy.mockReturnValueOnce(
        new Promise<MediaStream>((resolve) => {
          resolveGetUserMedia = resolve;
        })
      );

      const handlerPromise = constraintsRequiredHandler({ autoGainControl: false });

      const currentTrack = audioStream.getTracks()[0];
      (currentTrack as { readyState: string }).readyState = 'ended';

      const newMockStream = createMockedAudioStream();
      (newMockStream.getAudioTracks as jest.Mock).mockReturnValue([newAudioTrack]);
      resolveGetUserMedia(newMockStream);

      await handlerPromise;

      expect(newTrackStopSpy).toHaveBeenCalledWith();
      expect(constraintsChangeSpy).not.toHaveBeenCalled();
      expect(effect.replaceInputTrack).not.toHaveBeenCalled();
    });

    it('should not register duplicate constraint handlers when addEffect is called with the same effect', async () => {
      expect.hasAssertions();

      const onCalls = (effect.on as jest.Mock).mock.calls;
      const initialConstraintsRequiredCount = onCalls.filter(
        ([event]: [string]) => event === 'constraints-required'
      ).length;

      await audioLocalStream.addEffect(effect);

      const afterConstraintsRequiredCount = onCalls.filter(
        ([event]: [string]) => event === 'constraints-required'
      ).length;

      expect(afterConstraintsRequiredCount).toBe(initialConstraintsRequiredCount);
    });

    it('should not register audio constraint handlers for video tracks', async () => {
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
      expect(videoEventHandlers.has('constraints-released')).toBe(false);
      expect(videoEventHandlers.has('track-updated')).toBe(true);
      expect(videoEventHandlers.has('disposed')).toBe(true);
    });
  });
});
