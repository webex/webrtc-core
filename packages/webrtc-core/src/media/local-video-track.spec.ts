import { createMockedStream } from '../util/test-utils';
import { LocalVideoTrack } from './local-video-track';

/**
 *
 */
class TestLocalVideoTrack extends LocalVideoTrack {}
describe('LocalVideoTrack', () => {
  const mockStream = createMockedStream();
  let localVideoTrack: LocalVideoTrack;
  beforeEach(() => {
    localVideoTrack = new TestLocalVideoTrack(mockStream.getVideoTracks()[0]);
  });

  it.only('should call getMediaStreamTrack to apply constraints', async () => {
    expect.assertions(1);

    jest.spyOn(localVideoTrack, 'setEncoderConstraints');
    localVideoTrack.setEncoderConstraints({ deviceId: 'test-device-id-camera' });
    expect(localVideoTrack.setEncoderConstraints).toHaveBeenCalledWith({
      deviceId: 'test-device-id-camera',
    });
  });
});
