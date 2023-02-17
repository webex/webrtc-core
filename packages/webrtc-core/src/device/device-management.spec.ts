import { FacingMode } from '../media/local-video-track';
import * as media from '../media';
import { LocalCameraTrack } from '../media/local-camera-track';
import { LocalDisplayTrack } from '../media/local-display-track';
import { LocalComputerAudioTrack } from '../media/local-computer-audio-track';
import { LocalMicrophoneTrack } from '../media/local-microphone-track';
import { createBrowserMock } from '../mocks/create-browser-mock';
import MediaStreamStub from '../mocks/media-stream-stub';
import { mocked } from '../mocks/mock';
import {
  createCameraTrack,
  createDisplayTrack,
  createMicrophoneTrack,
  createMicrophoneAndCameraTracks,
  getDevices,
  getMicrophones,
  getSpeakers,
  getCameras,
} from './device-management';

jest.mock('../mocks/media-stream-stub');

describe('Device Management', () => {
  // const mockedMedia = createBrowserMock(media);
  createBrowserMock(MediaStreamStub, 'MediaStream');

  const mockStream = mocked(new MediaStream());
  const mockMediaInfo = mocked(new MediaDeviceInfo());

  describe('createMicrophoneAndCameraTracks', () => {
    jest
      .spyOn(media, 'getUserMedia')
      .mockImplementation()
      .mockReturnValue(Promise.resolve(mockStream as unknown as MediaStream));

    const track = new MediaStreamTrack();
    const mockTrack = new MediaStreamTrack();
    mockStream.getAudioTracks.mockReturnValue([track]);
    mockStream.getVideoTracks.mockReturnValue([mockTrack]);

    it('should call getUserMedia', async () => {
      expect.assertions(1);

      await createMicrophoneAndCameraTracks(
        { deviceId: 'test-device-id-audio' },
        { deviceId: 'test-device-id-video' }
      );
      expect(media.getUserMedia).toHaveBeenCalledWith({
        audio: {
          deviceId: 'test-device-id-audio',
        },
        video: {
          deviceId: 'test-device-id-video',
        },
      });
    });

    it('should call getUserMedia with constraints', async () => {
      expect.assertions(1);

      await createMicrophoneAndCameraTracks(
        {
          deviceId: 'test-device-id-audio',
          echoCancellation: true,
          sampleRate: 48000,
          sampleSize: 44000,
          channelCount: 2,
        },
        {
          deviceId: 'test-device-id-video',
          aspectRatio: 1.777,
          width: 1920,
          height: 1080,
          frameRate: 30,
          facingMode: FacingMode.user,
        }
      );
      expect(media.getUserMedia).toHaveBeenCalledWith({
        audio: {
          deviceId: 'test-device-id-audio',
          echoCancellation: true,
          sampleRate: 48000,
          sampleSize: 44000,
          channelCount: 2,
        },
        video: {
          deviceId: 'test-device-id-video',
          aspectRatio: 1.777,
          width: 1920,
          height: 1080,
          frameRate: 30,
          facingMode: 'user',
        },
      });
    });
    it('should return a LocalMicrophoneAndCameraTracks instance', async () => {
      expect.assertions(2);

      const [localMicrophoneTrack, localCameraTrack] = await createMicrophoneAndCameraTracks(
        { deviceId: 'test-device-id-audio' },
        { deviceId: 'test-device-id-video' }
      );
      expect(localMicrophoneTrack).toBeInstanceOf(LocalMicrophoneTrack);
      expect(localCameraTrack).toBeInstanceOf(LocalCameraTrack);
    });
  });
  describe('createMicrophoneTrack', () => {
    jest
      .spyOn(media, 'getUserMedia')
      .mockImplementation()
      .mockReturnValue(Promise.resolve(mockStream as unknown as MediaStream));

    const track = new MediaStreamTrack();
    mockStream.getTracks.mockReturnValue([track]);

    it('should call getUserMedia', async () => {
      expect.assertions(1);
      mockStream.getAudioTracks.mockReturnValue([track]);
      await createMicrophoneTrack({ deviceId: 'test-device-id-audio' });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        audio: {
          deviceId: 'test-device-id-audio',
        },
      });
    });

    it('should call getUserMedia with constraints', async () => {
      expect.assertions(1);

      await createMicrophoneTrack({
        deviceId: 'test-device-id-audio',
        echoCancellation: true,
        sampleRate: 48000,
        sampleSize: 44000,
        channelCount: 2,
      });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        audio: {
          deviceId: 'test-device-id-audio',
          echoCancellation: true,
          sampleRate: 48000,
          sampleSize: 44000,
          channelCount: 2,
        },
      });
    });

    it('should return a LocalMicrophoneTrack instance', async () => {
      expect.assertions(1);

      const localMicrophoneTrack = await createMicrophoneTrack({
        deviceId: 'test-device-id-audio',
      });
      expect(localMicrophoneTrack).toBeInstanceOf(LocalMicrophoneTrack);
    });
  });

  describe('createCameraTrack', () => {
    jest
      .spyOn(media, 'getUserMedia')
      .mockImplementation()
      .mockReturnValue(Promise.resolve(mockStream as unknown as MediaStream));

    const track = new MediaStreamTrack();
    mockStream.getTracks.mockReturnValue([track]);

    it('should call getUserMedia', async () => {
      expect.assertions(1);

      mockStream.getVideoTracks.mockReturnValue([track]);
      await createCameraTrack({ deviceId: 'test-device-id-video' });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id-video',
        },
      });
    });

    it('should call getUserMedia with constraints', async () => {
      expect.assertions(1);

      await createCameraTrack({
        deviceId: 'test-device-id-video',
        aspectRatio: 1.777,
        width: 1920,
        height: 1080,
        frameRate: 30,
        facingMode: FacingMode.user,
      });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id-video',
          aspectRatio: 1.777,
          width: 1920,
          height: 1080,
          frameRate: 30,
          facingMode: 'user',
        },
      });
    });

    it('should return a LocalCameraTrack instance', async () => {
      expect.assertions(1);

      const localCameraTrack = await createCameraTrack({ deviceId: 'test-device-id-video' });
      expect(localCameraTrack).toBeInstanceOf(LocalCameraTrack);
    });
  });

  describe('createDisplayTrack', () => {
    jest
      .spyOn(media, 'getDisplayMedia')
      .mockImplementation()
      .mockReturnValue(Promise.resolve(mockStream as unknown as MediaStream));

    const track = new MediaStreamTrack();
    const mockTrack = new MediaStreamTrack();
    mockStream.getAudioTracks.mockReturnValue([track]);
    mockStream.getVideoTracks.mockReturnValue([mockTrack]);
    it('should call getDisplayMedia', async () => {
      expect.assertions(1);

      await createDisplayTrack({
        constraints: { deviceId: 'test-device-id-display' },
        withAudio: false,
      });
      expect(media.getDisplayMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id-display',
        },
        audio: false,
      });
    });

    it('should call getDisplayMedia with constraints', async () => {
      expect.assertions(1);

      await createDisplayTrack({
        constraints: {
          deviceId: 'test-device-id-display',
          aspectRatio: 1.777,
          width: 1920,
          height: 1080,
          frameRate: 30,
          suppressLocalAudioPlayback: true,
        },
        withAudio: false,
      });
      expect(media.getDisplayMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id-display',
          aspectRatio: 1.777,
          width: 1920,
          height: 1080,
          frameRate: 30,
          suppressLocalAudioPlayback: true,
        },
        audio: false,
      });
    });

    it('should return a LocalDisplayTrack instance', async () => {
      expect.assertions(2);

      const { localDisplayTrack, localComputerAudioTrack } = await createDisplayTrack({
        constraints: { deviceId: 'test-device-id-display' },
        withAudio: true,
      });
      expect(localDisplayTrack).toBeInstanceOf(LocalDisplayTrack);
      expect(localComputerAudioTrack).toBeInstanceOf(LocalComputerAudioTrack);
    });
  });
  describe('getDevices', () => {
    const mockDevicesInfo = [mockMediaInfo];
    mockDevicesInfo.filter((v: MediaDeviceInfo) =>
      media.DeviceKind.AudioInput ? v.kind === media.DeviceKind.AudioInput : true
    );
    jest
      .spyOn(media, 'ensureDevicePermissions')
      .mockImplementation()
      .mockReturnValue(Promise.resolve(mockDevicesInfo));

    it('should call ensureDevicePermissions with AudioInput', async () => {
      expect.assertions(1);

      await getDevices(media.DeviceKind.AudioInput);
      expect(media.ensureDevicePermissions).toHaveBeenCalledWith(
        [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
        media.enumerateDevices
      );
    });

    it('should call ensureDevicePermissions with VideoInput', async () => {
      expect.assertions(1);

      await getDevices(media.DeviceKind.VideoInput);
      expect(media.ensureDevicePermissions).toHaveBeenCalledWith(
        [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
        media.enumerateDevices
      );
    });
    // it('should return a MediaDeviceInfo instance', async () => {
    //   expect.assertions(1);

    //   const [devices] = await getDevices(media.DeviceKind.AudioInput);
    //   expect(devices).toBeInstanceOf(MediaDeviceInfo);
    // });
  });

  // describe('getMicrophones', () => {
  //   const mockDevicesInfo = [mockMediaInfo];
  //   mockDevicesInfo.filter((v: MediaDeviceInfo) =>
  //     media.DeviceKind.AudioInput ? v.kind === media.DeviceKind.AudioInput : true
  //   );
  //   jest
  //     .spyOn(media, 'getDevices')
  //     .mockImplementation()
  //     .mockReturnValue(Promise.resolve(mockDevicesInfo));

  //   it('should call getDevices with AudioInput', async () => {
  //     expect.assertions(1);

  //     await getMicrophones();
  //     expect(getDevices).toHaveBeenCalledWith(media.DeviceKind.AudioInput);
  //   });
  // });

  describe('ThrowError', () => {
    it('should throw an err when getUserMedia fails for createMicrophoneTrack', async () => {
      expect.assertions(1);
      jest
        .spyOn(media, 'getUserMedia')
        .mockImplementation()
        .mockReturnValue(Promise.reject(new Error('Failed to create track')));
      await expect(createMicrophoneTrack()).rejects.toThrow('Failed to create track');
    });

    it('should throw an err when getUserMedia fails for createCameraTrack', async () => {
      expect.assertions(1);
      jest
        .spyOn(media, 'getUserMedia')
        .mockImplementation()
        .mockReturnValue(Promise.reject(new Error('Failed to create track')));
      await expect(createCameraTrack()).rejects.toThrow('Failed to create track');
    });
    it('should throw an err when getUserMedia fails for createMicrophoneAndCameraTracks', async () => {
      expect.assertions(1);
      jest
        .spyOn(media, 'getUserMedia')
        .mockImplementation()
        .mockReturnValue(Promise.reject(new Error('Failed to create track')));
      await expect(createMicrophoneAndCameraTracks()).rejects.toThrow('Failed to create track');
    });
    it('should throw an err when getDisplayMedia fails for createDisplayTrack', async () => {
      expect.assertions(1);
      jest
        .spyOn(media, 'getDisplayMedia')
        .mockImplementation()
        .mockReturnValue(Promise.reject(new Error('Failed to create track')));
      await expect(
        createDisplayTrack({
          withAudio: false,
        })
      ).rejects.toThrow('Failed to create track');
    });
  });
});
