import { createMockedStream } from '../util/test-utils';
import { LocalTrack } from './local-track';

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
