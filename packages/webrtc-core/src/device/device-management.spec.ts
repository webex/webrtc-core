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
  createMicrophoneAndCameraTracks,
} from './device-management';

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

      await createMicrophoneTrack({ deviceId: 'test-device-id' });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        audio: {
          deviceId: 'test-device-id',
        },
      });
    });

    it('should call getUserMedia with constraints', async () => {
      expect.assertions(1);

      await createMicrophoneTrack({
        deviceId: 'test-device-id',
        echoCancellation: true,
        sampleRate: 48000,
        sampleSize: 44000,
        channelCount: 2,
      });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        audio: {
          deviceId: 'test-device-id',
          echoCancellation: true,
          sampleRate: 48000,
          sampleSize: 44000,
          channelCount: 2,
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
    jest
      .spyOn(media, 'getUserMedia')
      .mockImplementation()
      .mockReturnValue(Promise.resolve(mockStream as unknown as MediaStream));

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

      await createCameraTrack({
        deviceId: 'test-device-id',
        aspectRatio: 1.777,
        width: 1920,
        height: 1080,
        frameRate: 30,
        // to-ask: how do I send FacingMode args correctly. Doesnt seem to work as dict.
        // FacingMode.user,
        // FacingMode: { user: 'user', environment: 'environment' },
      });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id',
          aspectRatio: 1.777,
          width: 1920,
          height: 1080,
          frameRate: 30,
          // facingMode: { exact: 'user' },
        },
      });
    });

    it('should return a LocalCameraTrack instance', async () => {
      expect.assertions(1);

      const localCameraTrack = await createCameraTrack({ deviceId: 'test-device-id' });
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

      await createDisplayTrack({ constraints: { deviceId: 'test-device-id' } });
      expect(media.getDisplayMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id',
        },
      });
    });

    it('should call getDisplayMedia with constraints', async () => {
      expect.assertions(1);

      await createDisplayTrack({
        constraints: {
          deviceId: 'test-device-id',
          aspectRatio: 1.777,
          width: 1920,
          height: 1080,
          frameRate: 30,
          suppressLocalAudioPlayback: true,
        },
      });
      expect(media.getDisplayMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id',
          aspectRatio: 1.777,
          width: 1920,
          height: 1080,
          frameRate: 30,
          suppressLocalAudioPlayback: true,
        },
      });
    });

    it('should return a LocalDisplayTrack instance', async () => {
      expect.assertions(1);

      const localDisplayTrack = await createDisplayTrack({
        constraints: { deviceId: 'test-device-id' },
      });
      expect(localDisplayTrack).toBeInstanceOf(LocalDisplayTrack);
    });
  });

  describe('createMicrophoneAndCameraTracks', () => {
    jest
      .spyOn(media, 'getUserMedia')
      .mockImplementation()
      .mockReturnValue(Promise.resolve(mockStream as unknown as MediaStream));

    it('should call getUserMedia', async () => {
      expect.assertions(1);

      await createMicrophoneAndCameraTracks(
        { deviceId: 'test-device-id' },
        { deviceId: 'test-device-id' }
      );
      expect(media.getUserMedia).toHaveBeenCalledWith([
        {
          audio: {
            deviceId: 'test-device-id',
          },
        },
        {
          video: {
            deviceId: 'test-device-idd',
          },
        },
      ]);
    });

    // it('should call getUserMedia with constraints', async () => {
    //   expect.assertions(1);

    //   await createMicrophoneTrack({
    //     deviceId: 'test-device-id',
    //     echoCancellation: true,
    //     sampleRate: 48000,
    //     sampleSize: 44000,
    //     channelCount: 2,
    //   });
    //   expect(media.getUserMedia).toHaveBeenCalledWith({
    //     audio: {
    //       deviceId: 'test-device-id',
    //       echoCancellation: true,
    //       sampleRate: 48000,
    //       sampleSize: 44000,
    //       channelCount: 2,
    //     },
    //   });
    // });

    // it('should return a LocalMicrophoneTrack instance', async () => {
    //   expect.assertions(1);

    //   const localMicrophoneTrack = await createMicrophoneTrack({ deviceId: 'test-device-id' });
    //   expect(localMicrophoneTrack).toBeInstanceOf(LocalMicrophoneTrack);
    // });
  });
});
