import { createMockedStream } from '../util/test-utils';
import { LocalAudioTrack } from './local-audio-track';
import MediaStreamStub from '../mocks/media-stream-stub';
import { createBrowserMock } from '../mocks/create-browser-mock';
/**
 * A dummy LocalAudioTrack implementation so we can instantiate it for testing.
 */
class TestLocalAudioTrack extends LocalAudioTrack {}

describe('LocalAudioTrack', () => {
  createBrowserMock(MediaStreamStub, 'MediaStream');
  const mockStream = createMockedStream();
  let localAudioTrack: TestLocalAudioTrack;
  beforeEach(() => {
    localAudioTrack = new TestLocalAudioTrack(mockStream.getTracks()[0]);
  });

  it('Should call applyConstraints on track when setEncoderConstaints is called', () => {
    expect.assertions(2);
    const encoderConstraints = { echoCancellation: true, channelCount: 1, sampleSize: 16 };

    jest.spyOn(localAudioTrack, 'getMediaStreamTrack');
    localAudioTrack.setEncoderConstraints(encoderConstraints);
    expect(localAudioTrack.getMediaStreamTrack).toHaveBeenCalledTimes(1);
    expect(mockStream.getTracks()[0].applyConstraints).toHaveBeenCalledWith(encoderConstraints);
  });
});
