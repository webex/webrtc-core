import * as media from '.';
import { createMockedAudioStream, createMockedStream } from '../util/test-utils';
import { LocalAudioStream } from './local-audio-stream';
import { LocalStream, LocalStreamEventNames, TrackEffect } from './local-stream';
import { StreamEventNames } from './stream';

/**
 * A dummy LocalStream implementation for testing that video streams
 * do not register audio constraint handlers.
 */
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

    beforeEach(async () => {
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

    it('should replace the input track on the first effect', async () => {
      expect.hasAssertions();

      await constraintsRequiredHandler({ autoGainControl: false });

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

    it('should emit Ended when both getUserMedia calls fail', async () => {
      expect.hasAssertions();

      const endedSpy = jest.spyOn(audioLocalStream[StreamEventNames.Ended], 'emit');

      getUserMediaSpy
        .mockRejectedValueOnce(new Error('OverconstrainedError'))
        .mockRejectedValueOnce(new Error('NotFoundError'));

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(getUserMediaSpy).toHaveBeenCalledTimes(2);
      expect(endedSpy).toHaveBeenCalledWith();
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
