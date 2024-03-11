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

    it('should replace the event handlers on the output track', () => {
      expect.assertions(8);

      const removeEventListenerSpy = jest.spyOn(mockStream.getTracks()[0], 'removeEventListener');
      const newTrack = new MediaStreamTrack();
      const addEventListenerSpy = jest.spyOn(newTrack, 'addEventListener');

      remoteStream.replaceTrack(newTrack);

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(3);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('ended', expect.anything());
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mute', expect.anything());
      expect(removeEventListenerSpy).toHaveBeenCalledWith('unmute', expect.anything());

      expect(addEventListenerSpy).toHaveBeenCalledTimes(3);
      expect(addEventListenerSpy).toHaveBeenCalledWith('ended', expect.anything());
      expect(addEventListenerSpy).toHaveBeenCalledWith('mute', expect.anything());
      expect(addEventListenerSpy).toHaveBeenCalledWith('unmute', expect.anything());
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
