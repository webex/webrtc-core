import { createMockedStream } from '../util/test-utils';
import { RemoteStream } from './remote-stream';

describe('RemoteStream', () => {
  const mockStream = createMockedStream();
  let remoteStream: RemoteStream;
  beforeEach(() => {
    remoteStream = new RemoteStream(mockStream);
  });

  describe('replaceTrack', () => {
    it('should call the removeTrack and addTrack methods of the output track', () => {
      expect.assertions(2);

      const removeTrackSpy = jest.spyOn(mockStream, 'removeTrack');
      const addTrackSpy = jest.spyOn(mockStream, 'addTrack');

      const newTrack = new MediaStreamTrack();
      remoteStream.replaceTrack(newTrack);

      expect(removeTrackSpy).toHaveBeenCalledWith(mockStream.getTracks()[0]);
      expect(addTrackSpy).toHaveBeenCalledWith(newTrack);
    });
  });
});
