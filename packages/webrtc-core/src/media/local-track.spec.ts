import { createMockedStream } from '../util/test-utils';
import { LocalTrack } from './local-track';
import MediaStreamStub from '../mocks/media-stream-stub';
import { createBrowserMock } from '../mocks/create-browser-mock';

/**
 * A dummy LocalTrack implementation so we can instantiate it for testing.
 */
class TestLocalTrack extends LocalTrack {}

describe('LocalTrack', () => {
  createBrowserMock(MediaStreamStub, 'MediaStream');
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

  it('should add, set and dispose video effect correctly', async () => {
    expect.assertions(4);
    const videotrack = new MediaStreamTrack();
    const effect = {
      load: jest.fn(),

      /**
       *
       */
      getUnderlyingStream: () => {
        return {
          /**
           *
           */
          getAudioTracks: () => {
            return [];
          },
          /**
           *
           */
          getVideoTracks: () => {
            return [videotrack];
          },
        };
      },
    };

    localTrack.kind = 'video';
    jest.spyOn(localTrack, 'setMediaStreamTrackWithEffects');
    jest.spyOn(effect, 'getUnderlyingStream');
    await localTrack.addEffect('videoEffect', effect);

    expect(effect.load).toHaveBeenCalledTimes(1);
    expect(effect.getUnderlyingStream).toHaveBeenCalledTimes(1);
    expect(localTrack.setMediaStreamTrackWithEffects).toHaveBeenCalledWith(videotrack);
    expect(localTrack.getEffect('videoEffect')).toBe(effect);
  });

  it('should add, set and dispose audio effect correctly', async () => {
    expect.assertions(6);
    const audioTrack = new MediaStreamTrack();
    const effect = {
      load: jest.fn(),
      dispose: jest.fn(),
      /**
       *
       */
      getUnderlyingStream: () => {
        return {
          /**
           *
           */
          getAudioTracks: () => {
            return [audioTrack];
          },
          /**
           *
           */
          getVideoTracks: () => {
            return [];
          },
        };
      },
    };

    localTrack.kind = 'audio';
    jest.spyOn(localTrack, 'setMediaStreamTrackWithEffects');
    jest.spyOn(effect, 'getUnderlyingStream');
    await localTrack.addEffect('audioEffect', effect);

    expect(effect.load).toHaveBeenCalledTimes(1);
    expect(effect.getUnderlyingStream).toHaveBeenCalledTimes(1);
    expect(localTrack.setMediaStreamTrackWithEffects).toHaveBeenCalledWith(audioTrack);
    expect(localTrack.getEffect('audioEffect')).toBe(effect);

    await localTrack.disposeEffects();

    expect(effect.dispose).toHaveBeenCalledTimes(1);
    expect(localTrack.getEffect('audioEffect')).toBeUndefined();
  });

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
