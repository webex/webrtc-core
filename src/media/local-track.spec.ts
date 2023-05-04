import { createMockedStream } from '../util/test-utils';
import { LocalTrack } from './local-track';

/**
 * Create a mocked track effect.
 *
 * @returns A mocked TrackEvent.
 */
const createMockedTrackEffect = () => {
  const effectStream = createMockedStream();
  const effect = {
    dispose: jest.fn().mockResolvedValue(undefined),
    getUnderlyingStream: jest.fn().mockReturnValue(effectStream),
    load: jest.fn().mockResolvedValue(undefined),
  };

  return { effectStream, effect };
};

/**
 * A dummy LocalTrack implementation so we can instantiate it for testing.
 */
class TestLocalTrack extends LocalTrack {}

describe('LocalTrack', () => {
  const mockStream = createMockedStream();
  let localTrack: LocalTrack;
  beforeEach(() => {
    localTrack = new TestLocalTrack(mockStream);
  });

  it('should change the underlying track state based on being muted & unmuted', () => {
    expect.assertions(2);
    // Simulate the default state of the track's enabled state.
    mockStream.getTracks()[0].enabled = true;

    localTrack.setMuted(true);
    expect(localTrack.underlyingTrack.enabled).toBe(false);
    localTrack.setMuted(false);
    expect(localTrack.underlyingTrack.enabled).toBe(true);
  });

  it('should emit an event when stopped', () => {
    expect.assertions(1);

    let emitted = false;

    localTrack.on(LocalTrack.Events.Ended, () => {
      emitted = true;
    });

    localTrack.stop();

    expect(emitted).toBe(true);
  });

  it('should emit an event when the underlying track is stopped', () => {
    expect.assertions(1);

    let emitted = false;

    localTrack.on(LocalTrack.Events.Ended, () => {
      emitted = true;
    });

    localTrack.underlyingTrack.onended?.(new Event('Synthetic Ended Event'));

    expect(emitted).toBe(true);
  });

  it('should apply and get underlying track constraints', () => {
    expect.assertions(1);

    localTrack.applyConstraints({ autoGainControl: true });

    const constraints = localTrack.getConstraints();

    expect(constraints).toStrictEqual({ autoGainControl: true });
  });
});

describe('LocalTrack getNumActiveSimulcastLayers', () => {
  it('activeSimulcastLayers returns 3 if video height greater than 360', () => {
    expect.hasAssertions();
    const mockStream = createMockedStream(720);
    const localTrack = new TestLocalTrack(mockStream);
    expect(localTrack.getNumActiveSimulcastLayers()).toBe(3);
  });
  it('activeSimulcastLayers returns 2 if video height greater than 180 but less(equals) than 360', () => {
    expect.hasAssertions();
    const mockStream = createMockedStream(360);
    const localTrack = new TestLocalTrack(mockStream);
    expect(localTrack.getNumActiveSimulcastLayers()).toBe(2);
  });
  it('activeSimulcastLayers returns 1 if video height less(equals) than 180', () => {
    expect.hasAssertions();
    const mockStream = createMockedStream(180);
    const localTrack = new TestLocalTrack(mockStream);
    expect(localTrack.getNumActiveSimulcastLayers()).toBe(1);
  });
});

describe('LocalTrack addEffect', () => {
  // eslint-disable-next-line jsdoc/require-jsdoc
  const setup = () => {
    const localStream = createMockedStream();
    const localTrack = new TestLocalTrack(localStream);
    const { effectStream, effect } = createMockedTrackEffect();
    const emitCounts = { [LocalTrack.Events.UnderlyingTrackChange]: 0 };

    localTrack.on(LocalTrack.Events.UnderlyingTrackChange, () => {
      emitCounts[LocalTrack.Events.UnderlyingTrackChange] += 1;
    });

    return { localStream, localTrack, effectStream, effect, emitCounts };
  };

  it('loads and uses the effect when there is no loading effect', async () => {
    expect.hasAssertions();

    const { localTrack, effectStream, effect, emitCounts } = setup();

    const addEffectPromise = localTrack.addEffect('test-effect', effect);

    await expect(addEffectPromise).resolves.toBeUndefined();
    expect(localTrack.underlyingStream).toBe(effectStream);
    expect(emitCounts[LocalTrack.Events.UnderlyingTrackChange]).toBe(1);
  });

  it('does not use the effect when the loading effect is cleared during load', async () => {
    expect.hasAssertions();

    const { localStream, localTrack, effect, emitCounts } = setup();

    // Add effect and immediately dispose all effects to clear loading effects
    const addEffectPromise = localTrack.addEffect('test-effect', effect);
    await localTrack.disposeEffects();

    await expect(addEffectPromise).rejects.toThrow('not required after loading');
    expect(localTrack.underlyingStream).toBe(localStream);
    expect(emitCounts[LocalTrack.Events.UnderlyingTrackChange]).toBe(0);
  });

  it('loads and uses the latest effect when the loading effect changes during load', async () => {
    expect.hasAssertions();

    const { effect: firstEffect } = createMockedTrackEffect();
    const { localTrack, effectStream, effect: secondEffect, emitCounts } = setup();

    const firstAddEffectPromise = localTrack.addEffect('test-effect', firstEffect);
    const secondAddEffectPromise = localTrack.addEffect('test-effect', secondEffect);

    await expect(firstAddEffectPromise).rejects.toThrow('not required after loading');
    await expect(secondAddEffectPromise).resolves.toBeUndefined();
    expect(localTrack.underlyingStream).toBe(effectStream);
    expect(emitCounts[LocalTrack.Events.UnderlyingTrackChange]).toBe(1);
  });
});
