import * as media from '.';
import { getSupportedConstraints } from '../mocks/media-track-supported-constraints';
import { createMockedAudioStream, createMockedStream } from '../util/test-utils';
import { LocalMicrophoneStream } from './local-microphone-stream';
import { LocalStream, LocalStreamEventNames, TrackEffect } from './local-stream';
import { LocalSystemAudioStream } from './local-system-audio-stream';
import { StreamEventNames } from './stream';

/**
 * A dummy LocalStream implementation for testing that video streams
 * do not register audio constraint handlers.
 */
class TestLocalStream extends LocalStream {}

describe('LocalMicrophoneStream', () => {
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
    let audioLocalStream: LocalMicrophoneStream;
    let effect: TrackEffect;
    let constraintsRequiredHandler: (constraints: MediaTrackConstraints) => Promise<void>;
    let constraintsReleasedHandler: () => Promise<void>;
    let getUserMediaSpy: jest.SpyInstance;
    let newAudioTrack: MediaStreamTrack;
    let newMockStream: MediaStream;

    // Stub navigator.mediaDevices.getSupportedConstraints (absent in jsdom)
    // so the filter in reacquireInputTrack mirrors a spec-compliant browser.
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
      audioLocalStream = new LocalMicrophoneStream(audioStream);

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

      newMockStream = createMockedAudioStream();
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

    it('should preserve the saved baseline across multiple constraints-required events', async () => {
      expect.hasAssertions();

      await constraintsRequiredHandler({ autoGainControl: false });

      (audioStream.getTracks as jest.Mock).mockReturnValue([newAudioTrack]);
      jest.spyOn(newAudioTrack, 'getSettings').mockReturnValue({
        ...audioSettings,
        autoGainControl: false,
      });

      const secondStream = createMockedAudioStream();
      const [secondTrack] = secondStream.getAudioTracks();
      jest.spyOn(secondTrack, 'getSettings').mockReturnValue({
        ...audioSettings,
        autoGainControl: false,
        noiseSuppression: false,
      });
      getUserMediaSpy.mockResolvedValueOnce(secondStream);

      await constraintsRequiredHandler({ noiseSuppression: false });

      (audioStream.getTracks as jest.Mock).mockReturnValue([secondTrack]);
      getUserMediaSpy.mockClear();

      await constraintsReleasedHandler();

      expect(getUserMediaSpy).toHaveBeenCalledTimes(1);
      expect(getUserMediaSpy).toHaveBeenLastCalledWith({
        audio: expect.objectContaining({
          autoGainControl: true,
          noiseSuppression: true,
        }),
      });
    });

    it('should call replaceInputTrack on the effect with the new track', async () => {
      expect.hasAssertions();

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(effect.replaceInputTrack).toHaveBeenCalledWith(newAudioTrack);
    });

    it('should pass a disabled replacement track to the effect when already user-muted', async () => {
      expect.hasAssertions();

      const currentTrack = audioStream.getTracks()[0];
      currentTrack.enabled = false;
      (effect.replaceInputTrack as jest.Mock).mockImplementationOnce(
        async (replacementTrack: MediaStreamTrack) => {
          expect(replacementTrack.enabled).toBe(false);
        }
      );

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(audioLocalStream.userMuted).toBe(true);
    });

    it('should preserve mute changes made while replacing the effect input track', async () => {
      expect.hasAssertions();

      const currentTrack = audioStream.getTracks()[0];
      currentTrack.enabled = true;

      let resolveReplacement!: () => void;
      let markReplacementStarted!: () => void;
      const replacementStarted = new Promise<void>((resolve) => {
        markReplacementStarted = resolve;
      });
      const replacementPending = new Promise<void>((resolve) => {
        resolveReplacement = resolve;
      });
      (effect.replaceInputTrack as jest.Mock).mockImplementationOnce(() => {
        markReplacementStarted();
        return replacementPending;
      });

      const handlerPromise = constraintsRequiredHandler({ autoGainControl: false });
      await replacementStarted;

      audioLocalStream.setUserMuted(true);
      resolveReplacement();
      await handlerPromise;

      expect(newAudioTrack.enabled).toBe(false);
      expect(audioLocalStream.userMuted).toBe(true);
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

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(callOrder).toStrictEqual(['stop', 'getUserMedia']);
    });

    it('should emit Ended when getUserMedia fails after stopping the current track', async () => {
      expect.hasAssertions();

      const endedSpy = jest.spyOn(audioLocalStream[StreamEventNames.Ended], 'emit');

      getUserMediaSpy.mockRejectedValue(new Error('NotFoundError'));

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(endedSpy).toHaveBeenCalledWith();
      expect(effect.dispose).toHaveBeenCalledWith();
    });

    it('should end the stream when getUserMedia returns no audio track', async () => {
      expect.hasAssertions();

      const streamWithoutAudioTrack = createMockedAudioStream();
      (streamWithoutAudioTrack.getAudioTracks as jest.Mock).mockReturnValue([]);
      const endedSpy = jest.spyOn(audioLocalStream[StreamEventNames.Ended], 'emit');
      const constraintsChangeSpy = jest.spyOn(
        audioLocalStream[LocalStreamEventNames.ConstraintsChange],
        'emit'
      );
      getUserMediaSpy.mockResolvedValueOnce(streamWithoutAudioTrack);

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(effect.replaceInputTrack).not.toHaveBeenCalled();
      expect(effect.dispose).toHaveBeenCalledWith();
      expect(endedSpy).toHaveBeenCalledWith();
      expect(constraintsChangeSpy).not.toHaveBeenCalled();
    });

    it('should clear the effects array and not emit ConstraintsChange when getUserMedia fails', async () => {
      expect.hasAssertions();

      const endedSpy = jest.spyOn(audioLocalStream[StreamEventNames.Ended], 'emit');
      const constraintsChangeSpy = jest.spyOn(
        audioLocalStream[LocalStreamEventNames.ConstraintsChange],
        'emit'
      );

      getUserMediaSpy.mockRejectedValueOnce(new Error('NotFoundError'));

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(effect.dispose).toHaveBeenCalledWith();
      expect((audioLocalStream as unknown as { effects: TrackEffect[] }).effects).not.toContain(
        effect
      );
      expect(constraintsChangeSpy).not.toHaveBeenCalled();
      expect(endedSpy).toHaveBeenCalledWith();
    });

    it('should stop the new track, clear effects, and emit Ended when effect wiring fails', async () => {
      expect.hasAssertions();

      const newTrackStopSpy = jest.spyOn(newAudioTrack, 'stop');
      const constraintsChangeSpy = jest.spyOn(
        audioLocalStream[LocalStreamEventNames.ConstraintsChange],
        'emit'
      );
      const endedSpy = jest.spyOn(audioLocalStream[StreamEventNames.Ended], 'emit');

      getUserMediaSpy.mockResolvedValueOnce(newMockStream);

      (effect.replaceInputTrack as jest.Mock).mockRejectedValueOnce(new Error('wiring failed'));

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(effect.replaceInputTrack).toHaveBeenCalledWith(newAudioTrack);
      expect(newTrackStopSpy).toHaveBeenCalledWith();
      expect(effect.dispose).toHaveBeenCalledWith();
      expect((audioLocalStream as unknown as { effects: TrackEffect[] }).effects).not.toContain(
        effect
      );
      expect(constraintsChangeSpy).not.toHaveBeenCalled();
      expect(endedSpy).toHaveBeenCalledWith();
    });

    it('should skip re-acquisition when the track is already ended', async () => {
      expect.hasAssertions();

      const currentTrack = audioStream.getTracks()[0];
      (currentTrack as { readyState: string }).readyState = 'ended';

      await constraintsRequiredHandler({ autoGainControl: false });

      expect(getUserMediaSpy).not.toHaveBeenCalled();
    });

    it('should not re-acquire the microphone from a constraint release during effect disposal', async () => {
      expect.hasAssertions();

      await constraintsRequiredHandler({ autoGainControl: false });
      getUserMediaSpy.mockClear();
      (effect.dispose as jest.Mock).mockImplementationOnce(async () => {
        await constraintsReleasedHandler();
      });

      await audioLocalStream.disposeEffects();

      expect(getUserMediaSpy).not.toHaveBeenCalled();
      expect(audioLocalStream.getEffects()).toStrictEqual([]);
    });

    it('should discard new track when effect is disposed during getUserMedia', async () => {
      expect.hasAssertions();

      const endedSpy = jest.spyOn(audioLocalStream[StreamEventNames.Ended], 'emit');
      const constraintsChangeSpy = jest.spyOn(
        audioLocalStream[LocalStreamEventNames.ConstraintsChange],
        'emit'
      );
      const newTrackStopSpy = jest.spyOn(newAudioTrack, 'stop');

      let resolveGetUserMedia!: (stream: MediaStream) => void;
      getUserMediaSpy.mockReturnValueOnce(
        new Promise<MediaStream>((resolve) => {
          resolveGetUserMedia = resolve;
        })
      );

      const handlerPromise = constraintsRequiredHandler({ autoGainControl: false });

      await audioLocalStream.disposeEffects();

      const resolvedStream = createMockedAudioStream();
      (resolvedStream.getAudioTracks as jest.Mock).mockReturnValue([newAudioTrack]);
      resolveGetUserMedia(resolvedStream);

      await handlerPromise;

      expect(newTrackStopSpy).toHaveBeenCalledWith();
      expect(endedSpy).toHaveBeenCalledWith();
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

    it('should not register microphone constraint handlers for system audio tracks', async () => {
      expect.hasAssertions();

      const systemAudioStream = createMockedAudioStream();
      const systemAudioTrack = systemAudioStream.getAudioTracks()[0];
      const systemAudioTrackStopSpy = jest.spyOn(systemAudioTrack, 'stop');
      const systemAudioLocalStream = new LocalSystemAudioStream(systemAudioStream);
      const systemAudioEventHandlers = new Map<string, (...args: unknown[]) => void>();
      const systemAudioEffect = {
        id: 'system-audio-effect',
        kind: 'noise-reduction',
        isEnabled: false,
        dispose: jest.fn().mockResolvedValue(undefined),
        load: jest.fn().mockResolvedValue(undefined),
        on: jest.fn().mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
          systemAudioEventHandlers.set(event, handler);
        }),
        off: jest.fn(),
      } as unknown as TrackEffect;

      await systemAudioLocalStream.addEffect(systemAudioEffect);

      expect(systemAudioEventHandlers.has('constraints-required')).toBe(false);
      expect(systemAudioEventHandlers.has('constraints-released')).toBe(false);
      expect(getUserMediaSpy).not.toHaveBeenCalled();
      expect(systemAudioTrackStopSpy).not.toHaveBeenCalled();
    });

    describe('addEffect options', () => {
      type Listener = (...args: unknown[]) => unknown;

      /**
       * Create a stub effect that keeps its registered listeners so tests can emit effect events.
       * Disposing the stub releases its constraints and then emits `disposed`.
       *
       * @param id - The effect ID.
       * @param kind - The effect kind.
       * @returns The stub effect and a function that emits an event to its listeners.
       */
      const createStubEffect = (id: string, kind: string) => {
        const listeners = new Map<string, Set<Listener>>();

        /**
         * Invoke every listener registered for an event and wait for them to settle.
         *
         * @param event - The event name.
         * @param args - The event payload.
         */
        const emit = async (event: string, ...args: unknown[]): Promise<void> => {
          await Promise.all(Array.from(listeners.get(event) ?? []).map((l) => l(...args)));
        };

        const stubEffect = {
          id,
          kind,
          isEnabled: false,
          dispose: jest.fn().mockImplementation(async () => {
            await emit('constraints-released');
            await emit('disposed');
          }),
          load: jest.fn().mockResolvedValue(undefined),
          replaceInputTrack: jest.fn().mockResolvedValue(undefined),
          on: jest.fn().mockImplementation((event: string, listener: Listener) => {
            const eventListeners = listeners.get(event) ?? new Set<Listener>();
            eventListeners.add(listener);
            listeners.set(event, eventListeners);
          }),
          off: jest.fn().mockImplementation((event: string, listener: Listener) => {
            listeners.get(event)?.delete(listener);
          }),
        } as unknown as TrackEffect;

        return { effect: stubEffect, emit };
      };

      /**
       * Count how many times a listener was registered on an effect for an event.
       *
       * @param targetEffect - The stub effect.
       * @param event - The event name.
       * @returns The number of `on` calls for the event.
       */
      const countOnCalls = (targetEffect: TrackEffect, event: string): number =>
        (targetEffect.on as jest.Mock).mock.calls.filter(([name]: [string]) => name === event)
          .length;

      it('should register constraint handlers for an effect added without options', async () => {
        expect.hasAssertions();

        const { effect: defaultEffect } = createStubEffect('default-effect', 'kind-a');

        await audioLocalStream.addEffect(defaultEffect);

        expect(countOnCalls(defaultEffect, 'constraints-required')).toBe(1);
        expect(countOnCalls(defaultEffect, 'constraints-released')).toBe(1);
        // The base class and the constraint cleanup each listen for `disposed`.
        expect(countOnCalls(defaultEffect, 'disposed')).toBe(2);
      });

      it.each([{}, { applyRequiredConstraints: undefined }, { applyRequiredConstraints: true }])(
        'should register constraint handlers when options are %p',
        async (options) => {
          expect.hasAssertions();

          const { effect: optedInEffect, emit } = createStubEffect('opted-in-effect', 'kind-a');

          await audioLocalStream.addEffect(optedInEffect, options);

          expect(countOnCalls(optedInEffect, 'constraints-required')).toBe(1);
          expect(countOnCalls(optedInEffect, 'constraints-released')).toBe(1);
          expect(countOnCalls(optedInEffect, 'disposed')).toBe(2);

          await emit('constraints-required', { autoGainControl: false });

          expect(getUserMediaSpy).toHaveBeenCalledTimes(1);
          expect(optedInEffect.replaceInputTrack).toHaveBeenCalledWith(newAudioTrack);
        }
      );

      it('should add and load the effect without constraint handlers when applyRequiredConstraints is false', async () => {
        expect.hasAssertions();

        const effectAddedSpy = jest.spyOn(
          audioLocalStream[LocalStreamEventNames.EffectAdded],
          'emit'
        );
        const { effect: optedOutEffect } = createStubEffect('opted-out-effect', 'kind-a');

        await audioLocalStream.addEffect(optedOutEffect, { applyRequiredConstraints: false });

        expect(optedOutEffect.load).toHaveBeenCalledWith(audioStream.getTracks()[0]);
        expect(audioLocalStream.getEffectById('opted-out-effect')).toBe(optedOutEffect);
        expect(effectAddedSpy).toHaveBeenCalledWith(optedOutEffect);
        expect(countOnCalls(optedOutEffect, 'constraints-required')).toBe(0);
        expect(countOnCalls(optedOutEffect, 'constraints-released')).toBe(0);
        expect(countOnCalls(optedOutEffect, 'track-updated')).toBe(1);
        expect(countOnCalls(optedOutEffect, 'disposed')).toBe(1);
      });

      it('should replace an existing effect of the same kind when applyRequiredConstraints is false', async () => {
        expect.hasAssertions();

        const { effect: optedOutEffect } = createStubEffect('opted-out-nr-effect', effect.kind);

        await audioLocalStream.addEffect(optedOutEffect, { applyRequiredConstraints: false });

        expect(effect.dispose).toHaveBeenCalledWith();
        expect(audioLocalStream.getEffectByKind(effect.kind)).toBe(optedOutEffect);
        expect(audioLocalStream.getEffectById(effect.id)).toBeUndefined();
        expect(countOnCalls(optedOutEffect, 'constraints-required')).toBe(0);
      });

      it('should not re-acquire the microphone for an opted-out effect on constraint events or disposal', async () => {
        expect.hasAssertions();

        const inputTrack = audioStream.getTracks()[0];
        const { effect: optedOutEffect, emit } = createStubEffect('opted-out-effect', 'kind-a');

        await audioLocalStream.addEffect(optedOutEffect, { applyRequiredConstraints: false });
        await emit('constraints-required', { autoGainControl: false, noiseSuppression: false });
        await emit('constraints-released');
        await audioLocalStream.disposeEffects();

        expect(optedOutEffect.dispose).toHaveBeenCalledWith();
        expect(audioLocalStream.getEffects()).toStrictEqual([]);
        expect(getUserMediaSpy).not.toHaveBeenCalled();
        expect(optedOutEffect.replaceInputTrack).not.toHaveBeenCalled();
        expect(inputTrack.stop).not.toHaveBeenCalled();
        expect(audioStream.removeTrack).not.toHaveBeenCalled();
        expect(audioStream.addTrack).not.toHaveBeenCalled();
      });

      it('should only register constraint handlers for effects added without the opt-out', async () => {
        expect.hasAssertions();

        const { effect: effectA, emit: emitA } = createStubEffect('effect-a', 'kind-a');
        const { effect: effectB, emit: emitB } = createStubEffect('effect-b', 'kind-b');

        await audioLocalStream.addEffect(effectA, { applyRequiredConstraints: false });
        await audioLocalStream.addEffect(effectB);

        expect(countOnCalls(effectA, 'constraints-required')).toBe(0);
        expect(countOnCalls(effectA, 'constraints-released')).toBe(0);
        expect(countOnCalls(effectB, 'constraints-required')).toBe(1);
        expect(countOnCalls(effectB, 'constraints-released')).toBe(1);

        await emitA('constraints-required', { autoGainControl: false });

        expect(getUserMediaSpy).not.toHaveBeenCalled();

        await emitB('constraints-required', { autoGainControl: false });

        expect(getUserMediaSpy).toHaveBeenCalledTimes(1);
        expect(getUserMediaSpy).toHaveBeenCalledWith({
          audio: expect.objectContaining({
            deviceId: { exact: 'test-device-id' },
            autoGainControl: false,
          }),
        });
        expect(effectA.replaceInputTrack).not.toHaveBeenCalled();
      });

      it('should keep constraint handlers when an effect is added again with applyRequiredConstraints false', async () => {
        expect.hasAssertions();

        const { effect: duplicateEffect, emit } = createStubEffect('duplicate-effect', 'kind-a');

        await audioLocalStream.addEffect(duplicateEffect);
        const onCallCountAfterFirstAdd = (duplicateEffect.on as jest.Mock).mock.calls.length;
        await audioLocalStream.addEffect(duplicateEffect, { applyRequiredConstraints: false });

        expect(duplicateEffect.load).toHaveBeenCalledTimes(1);
        expect(duplicateEffect.on).toHaveBeenCalledTimes(onCallCountAfterFirstAdd);
        expect(duplicateEffect.off).not.toHaveBeenCalled();
        expect(countOnCalls(duplicateEffect, 'constraints-required')).toBe(1);
        expect(countOnCalls(duplicateEffect, 'constraints-released')).toBe(1);

        await emit('constraints-required', { autoGainControl: false });

        expect(getUserMediaSpy).toHaveBeenCalledTimes(1);
      });

      it('should not register constraint handlers when an opted-out effect is added again without options', async () => {
        expect.hasAssertions();

        const { effect: duplicateEffect, emit } = createStubEffect('duplicate-effect', 'kind-a');

        await audioLocalStream.addEffect(duplicateEffect, { applyRequiredConstraints: false });
        const onCallCountAfterFirstAdd = (duplicateEffect.on as jest.Mock).mock.calls.length;
        await audioLocalStream.addEffect(duplicateEffect);

        expect(duplicateEffect.load).toHaveBeenCalledTimes(1);
        expect(duplicateEffect.on).toHaveBeenCalledTimes(onCallCountAfterFirstAdd);
        expect(countOnCalls(duplicateEffect, 'constraints-required')).toBe(0);
        expect(countOnCalls(duplicateEffect, 'constraints-released')).toBe(0);

        await emit('constraints-required', { autoGainControl: false });

        expect(getUserMediaSpy).not.toHaveBeenCalled();
      });
    });
  });
});
