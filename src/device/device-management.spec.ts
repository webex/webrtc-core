import * as media from '../media';
import { LocalCameraTrack } from '../media/local-camera-track';
import { LocalDisplayTrack } from '../media/local-display-track';
import { LocalMicrophoneTrack } from '../media/local-microphone-track';
import { createBrowserMock } from '../mocks/create-browser-mock';
import MediaStreamStub from '../mocks/media-stream-stub';
import { mocked } from '../mocks/mock';
import { createCameraTrack, createDisplayTrack, createMicrophoneTrack } from './device-management';
import { FacingMode } from '../media/local-video-track';

jest.mock('../mocks/media-stream-stub');

describe('Device Management', () => {
  // const mockedMedia = createBrowserMock(media);
  createBrowserMock(MediaStreamStub, 'MediaStream');

  const mockStream = mocked(new MediaStream());
  const track = new MediaStreamTrack();
  mockStream.getTracks.mockReturnValue([track]);

  describe('createMicrophoneTrack', () => {
    jest
      .spyOn(media, 'getUserMedia')
      .mockImplementation()
      .mockReturnValue(Promise.resolve(mockStream as unknown as MediaStream));

    it('should call getUserMedia', async () => {
      expect.assertions(1);
      await createMicrophoneTrack({ microphoneDeviceId: 'test-device-id' });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        audio: {
          deviceId: 'test-device-id',
        },
      });
    });

    it('should return a LocalMicrophoneTrack instance', async () => {
      expect.assertions(1);

      const localMicrophoneTrack = await createMicrophoneTrack({
        microphoneDeviceId: 'test-device-id',
      });
      expect(localMicrophoneTrack).toBeInstanceOf(LocalMicrophoneTrack);
    });
  });

  describe('createCameraTrack', () => {
    jest
      .spyOn(media, 'getUserMedia')
      .mockImplementation()
      .mockReturnValue(Promise.resolve(mockStream as unknown as MediaStream));

    it('should call getUserMedia', async () => {
      expect.assertions(1);

      await createCameraTrack({ cameraDeviceId: 'test-device-id' });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id',
        },
      });
    });

    it('should call getUserMedia with constraints', async () => {
      expect.assertions(1);

      await createCameraTrack({
        cameraDeviceId: 'test-device-id',
        encoderConfig: {
          aspectRatio: 1.777,
          width: 1920,
          height: 1080,
          frameRate: 30,
        },
        facingMode: FacingMode.user,
      });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id',
          aspectRatio: 1.777,
          width: 1920,
          height: 1080,
          frameRate: 30,
          facingMode: FacingMode.user,
        },
      });
    });

    it('should return a LocalCameraTrack instance', async () => {
      expect.assertions(1);

      const localCameraTrack = await createCameraTrack({ cameraDeviceId: 'test-device-id' });
      expect(localCameraTrack).toBeInstanceOf(LocalCameraTrack);
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
      expect(media.getDisplayMedia).toHaveBeenCalledWith({ video: {} });
    });

    it('should return a LocalDisplayTrack instance', async () => {
      expect.assertions(1);

      const localDisplayTrack = await createDisplayTrack();
      expect(localDisplayTrack).toBeInstanceOf(LocalDisplayTrack);
    });
  });
});
