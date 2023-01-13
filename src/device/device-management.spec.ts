import * as media from '../media';
import { LocalCameraTrack } from '../media/local-camera-track';
import { LocalDisplayTrack } from '../media/local-display-track';
import { LocalMicrophoneTrack } from '../media/local-microphone-track';
import { createBrowserMock } from '../mocks/create-browser-mock';
import MediaStreamStub from '../mocks/media-stream-stub';
import { mocked } from '../mocks/mock';
import {
  createCameraTrack,
  createDisplayTrack,
  createMicrophoneTrack,
  ErrorTypes,
  WcmeError,
} from './device-management';

jest.mock('../mocks/media-stream-stub');

describe('Device Management', () => {
  // const mockedMedia = createBrowserMock(media);
  createBrowserMock(MediaStreamStub, 'MediaStream');

  const mockStream = mocked(new MediaStream());
  Object.defineProperty(mockStream, 'active', {
    value: true,
    configurable: true,
  });
  const track = mocked(new MediaStreamTrack());
  mockStream.getTracks.mockReturnValue([track]);

  jest.spyOn(track, 'stop').mockImplementation(() => {
    Object.defineProperty(mockStream, 'active', {
      value: false,
      configurable: true,
    });
  });

  jest.spyOn(media, 'getUserMedia').mockImplementation(async () => {
    return Object.defineProperty(mockStream, 'active', {
      value: true,
      configurable: true,
    });
  });

  describe('createMicrophoneTrack', () => {
    it('should call getUserMedia', async () => {
      expect.assertions(1);
      await createMicrophoneTrack({ deviceId: 'test-device-id' });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        audio: {
          deviceId: 'test-device-id',
        },
      });
    });

    it('should return a LocalMicrophoneTrack instance', async () => {
      expect.assertions(1);

      const localMicrophoneTrack = await createMicrophoneTrack({ deviceId: 'test-device-id' });
      expect(localMicrophoneTrack).toBeInstanceOf(LocalMicrophoneTrack);
    });
  });

  describe('createCameraTrack', () => {
    it('should call getUserMedia', async () => {
      expect.assertions(1);
      await createCameraTrack({ deviceId: 'test-device-id' });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id',
        },
      });
    });

    it('should call getUserMedia with constraints', async () => {
      expect.assertions(1);
      mockStream.getTracks()[0].stop();
      await createCameraTrack({
        deviceId: 'test-device-id',
        aspectRatio: 1.777,
        width: 1920,
        height: 1080,
        frameRate: 30,
        facingMode: { exact: 'user' },
      });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id',
          aspectRatio: 1.777,
          width: 1920,
          height: 1080,
          frameRate: 30,
          facingMode: { exact: 'user' },
        },
      });
    });

    it('should return a LocalCameraTrack instance', async () => {
      expect.assertions(1);
      mockStream.getTracks()[0].stop();
      const localCameraTrack = await createCameraTrack({ deviceId: 'test-device-id' });
      expect(localCameraTrack).toBeInstanceOf(LocalCameraTrack);
    });

    it('call getUserMedia if previous call has not been finished yet', async () => {
      expect.assertions(1);
      mockStream.getTracks()[0].stop();
      // asynchronously call createCameraTrack firstly.
      createCameraTrack({ deviceId: 'test-device-id' });
      // call createCameraTrack again .
      await expect(() => createCameraTrack({ deviceId: 'test-device-id' })).rejects.toStrictEqual(
        new WcmeError(
          ErrorTypes.CREATE_CAMERA_TRACK_FAILED,
          `camera track can NOT be created since previous call has not been finished yet`
        )
      );
    });

    it('call getUserMedia if previous captured video stream does not be stopped', async () => {
      expect.assertions(1);
      mockStream.getTracks()[0].stop();
      // synchronously call createCameraTrack firstly.
      await createCameraTrack({ deviceId: 'test-device-id' });
      // calling createCameraTrack again without invoking mockStream.getTracks()[0].stop()
      await expect(() => createCameraTrack({ deviceId: 'test-device-id' })).rejects.toStrictEqual(
        new WcmeError(
          ErrorTypes.CREATE_CAMERA_TRACK_FAILED,
          `camera track can NOT be created since previous captured video stream does not be stopped`
        )
      );
    });
  });

  describe('createDisplayTrack', () => {
    jest
      .spyOn(media, 'getDisplayMedia')
      .mockImplementation()
      .mockReturnValue(Promise.resolve(mockStream as unknown as MediaStream));

    it('should call getDisplayMedia', async () => {
      expect.assertions(1);

      await createDisplayTrack();
      expect(media.getDisplayMedia).toHaveBeenCalledWith({ video: true });
    });

    it('should return a LocalDisplayTrack instance', async () => {
      expect.assertions(1);

      const localDisplayTrack = await createDisplayTrack();
      expect(localDisplayTrack).toBeInstanceOf(LocalDisplayTrack);
    });
  });
});
