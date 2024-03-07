import { createMockedStream } from '../util/test-utils';
import { RemoteStream } from './remote-stream';

describe('RemoteStream', () => {
  const mockStream = createMockedStream();
  let remoteStream: RemoteStream;
  beforeEach(() => {
    remoteStream = new RemoteStream(mockStream);
  });

  describe('constructor', () => {
    it('should add the correct event handlers on the track', () => {
      expect.assertions(4);

      const addEventListenerSpy = jest.spyOn(mockStream.getTracks()[0], 'addEventListener');

      expect(addEventListenerSpy).toHaveBeenCalledTimes(3);
      expect(addEventListenerSpy).toHaveBeenCalledWith('ended', expect.anything());
      expect(addEventListenerSpy).toHaveBeenCalledWith('mute', expect.anything());
      expect(addEventListenerSpy).toHaveBeenCalledWith('unmute', expect.anything());
    });
  });

  describe('getSettings', () => {
    it('should get the settings of the output track', () => {
      expect.assertions(1);

      const settings = remoteStream.getSettings();
      expect(settings).toBe(mockStream.getTracks()[0].getSettings());
    });
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

  describe('stop', () => {
    it('should call the stop method of the output track', () => {
      expect.assertions(1);

      const spy = jest.spyOn(mockStream.getTracks()[0], 'stop');

      remoteStream.stop();
      expect(spy).toHaveBeenCalledWith();
    });
  });
});
