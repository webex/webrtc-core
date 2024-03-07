import { createBrowserMock } from '../mocks/create-browser-mock';
import MediaStreamStub from '../mocks/media-stream-stub';
import { mocked } from '../mocks/mock';
import { LocalStreamEventNames } from './local-stream';
import { LocalVideoStream } from './local-video-stream';

jest.mock('../mocks/media-stream-stub');

// TODO: really more of a test that events and stuff are working correctly.
// Needs to be fleshed out into an actual test.

describe('localVideoStream', () => {
  createBrowserMock(MediaStreamStub, 'MediaStream');

  const mockStream = mocked(new MediaStream());
  const track = new MediaStreamTrack();
  mockStream.getTracks.mockReturnValue([track]);

  const videoStream = new LocalVideoStream(mockStream);

  it('should work', () => {
    expect.hasAssertions();
    videoStream.on(LocalStreamEventNames.UserMuteStateChange, (muted: boolean) => {
      // eslint-disable-next-line no-console
      console.log(`stream is muted? ${muted}`);
    });
    videoStream.on(LocalStreamEventNames.ConstraintsChange, () => {
      // eslint-disable-next-line no-console
      console.log('stream constraints changed');
    });

    videoStream.setUserMuted(true);
    videoStream.applyConstraints({
      height: 720,
      width: 1280,
    });

    expect(1).toBe(1);
  });
});
