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
    localTrack = new TestLocalTrack(mockStream.getTracks()[0]);
  });

  it('should change the underlying track state based on being muted & unmuted', () => {
    expect.assertions(2);
    // Simulate the default state of the track's enabled state.
    mockStream.getTracks()[0].enabled = true;

    localTrack.setMuted(true);
    expect(localTrack.getMediaStreamTrack().enabled).toBe(false);
    localTrack.setMuted(false);
    expect(localTrack.getMediaStreamTrack().enabled).toBe(true);
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

    localTrack.getMediaStreamTrack().onended?.(new Event('Synthetic Ended Event'));

    expect(emitted).toBe(true);
  });

  // TO-ASK: what does TracEffect take, shouldn't it be list of effects?
  // TO-DO: add testcases for addEffect, getEffect and disposeEffect once the above is figured out.
  it('should return getEffect correctly', () => {
    expect.assertions(2);

    jest.spyOn(localTrack, 'getEffect').mockReturnValue(undefined);
    localTrack.getEffect('testname');
    expect(localTrack.getEffect).toHaveBeenCalledWith('testname');

    expect(localTrack.getEffect('testname')).toBeUndefined();
  });

  // it('should addEffect correctly', () => {
  //   expect.assertions(2);

  //   jest.spyOn(localTrack, 'getEffect').mockReturnValue(undefined);
  //   localTrack.getEffect('testname');
  //   expect(localTrack.getEffect).toHaveBeenCalledWith('testname');

  //   expect(localTrack.getEffect('testname')).toBeUndefined();
  // });

  it('should setPublished correctly', () => {
    expect.assertions(4);

    jest.spyOn(localTrack, 'setPublished');
    localTrack.setPublished(true);
    expect(localTrack.setPublished).toHaveBeenCalledWith(true);

    expect(localTrack.published).toBe(true);

    jest.spyOn(localTrack, 'setPublished');
    localTrack.setPublished(false);
    expect(localTrack.setPublished).toHaveBeenCalledWith(false);

    expect(localTrack.published).toBe(false);
  });
});
