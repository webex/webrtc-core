import { createMockedStream } from '../util/test-utils';
import { LocalVideoTrack } from './local-video-track';
import MediaStreamStub from '../mocks/media-stream-stub';
import { createBrowserMock } from '../mocks/create-browser-mock';
/**
 * A dummy LocalVideoTrack implementation so we can instantiate it for testing.
 */
class TestLocalVideoTrack extends LocalVideoTrack {}

describe('LocalVideoTrack', () => {
  createBrowserMock(MediaStreamStub, 'MediaStream');
  const mockStream = createMockedStream();
  let localVideoTrack: TestLocalVideoTrack;
  beforeEach(() => {
    localVideoTrack = new TestLocalVideoTrack(mockStream.getTracks()[0]);
  });

  it('Should call applyConstraints on track when setEncoderConstaints is called', () => {
    expect.assertions(2);
    const encoderConstraints = { frameRate: 30, width: 1920, height: 1080 };

    jest.spyOn(localVideoTrack, 'getMediaStreamTrack');
    localVideoTrack.setEncoderConstraints(encoderConstraints);
    expect(localVideoTrack.getMediaStreamTrack).toHaveBeenCalledTimes(1);
    expect(mockStream.getTracks()[0].applyConstraints).toHaveBeenCalledWith(encoderConstraints);
  });
});
