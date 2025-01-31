import { WebrtcCoreError, WebrtcCoreErrorType } from '../errors';
import * as media from '../media';
import { LocalCameraStream } from '../media/local-camera-stream';
import { LocalDisplayStream } from '../media/local-display-stream';
import { LocalMicrophoneStream } from '../media/local-microphone-stream';
import { LocalSystemAudioStream } from '../media/local-system-audio-stream';
import { createBrowserMock } from '../mocks/create-browser-mock';
import MediaStreamStub from '../mocks/media-stream-stub';
import { createMockedStream, createMockedStreamWithAudio } from '../util/test-utils';
import {
  CaptureController,
  createCameraAndMicrophoneStreams,
  createCameraStream,
  createDisplayMedia,
  createDisplayStream,
  createDisplayStreamWithAudio,
  createMicrophoneStream,
  getDevices,
} from './device-management';

jest.mock('../mocks/media-stream-stub');

describe('Device Management', () => {
  // const mockedMedia = createBrowserMock(media);
  createBrowserMock(MediaStreamStub, 'MediaStream');

  const mockStream = createMockedStream();

  describe('createMicrophoneStream', () => {
    jest.spyOn(media, 'getUserMedia').mockReturnValue(Promise.resolve(mockStream));

    it('should call getUserMedia', async () => {
      expect.assertions(1);

      await createMicrophoneStream(LocalMicrophoneStream, { deviceId: 'test-device-id' });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        audio: {
          deviceId: 'test-device-id',
        },
      });
    });

    it('should call getUserMedia with constraints', async () => {
      expect.assertions(1);

      await createMicrophoneStream(LocalMicrophoneStream, {
        deviceId: 'test-device-id',
        autoGainControl: false,
        channelCount: 2,
        echoCancellation: false,
        noiseSuppression: false,
        sampleRate: 48000,
        sampleSize: 16,
      });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        audio: {
          deviceId: 'test-device-id',
          autoGainControl: false,
          channelCount: 2,
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 48000,
          sampleSize: 16,
        },
      });
    });

    it('should return a LocalMicrophoneStream instance', async () => {
      expect.assertions(1);

      const localMicrophoneStream = await createMicrophoneStream(LocalMicrophoneStream, {
        deviceId: 'test-device-id',
      });
      expect(localMicrophoneStream).toBeInstanceOf(LocalMicrophoneStream);
    });
  });

  describe('createCameraStream', () => {
    jest.spyOn(media, 'getUserMedia').mockReturnValue(Promise.resolve(mockStream));

    it('should call getUserMedia', async () => {
      expect.assertions(1);

      await createCameraStream(LocalCameraStream, { deviceId: 'test-device-id' });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id',
        },
      });
    });

    it('should call getUserMedia with constraints', async () => {
      expect.assertions(1);

      await createCameraStream(LocalCameraStream, {
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

    it('should return a LocalCameraStream instance', async () => {
      expect.assertions(1);

      const localCameraStream = await createCameraStream(LocalCameraStream, {
        deviceId: 'test-device-id',
      });
      expect(localCameraStream).toBeInstanceOf(LocalCameraStream);
    });
  });

  describe('createCameraAndMicrophoneStreams', () => {
    jest.spyOn(media, 'getUserMedia').mockReturnValue(Promise.resolve(mockStream));

    it('should call getUserMedia', async () => {
      expect.assertions(1);

      await createCameraAndMicrophoneStreams(LocalCameraStream, LocalMicrophoneStream, {
        video: { deviceId: 'test-device-id' },
        audio: { deviceId: 'test-device-id' },
      });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id',
        },
        audio: {
          deviceId: 'test-device-id',
        },
      });
    });

    it('should return a LocalCameraStream and a LocalMicrophoneStream instance', async () => {
      expect.assertions(2);

      const [localCameraStream, localMicrophoneStream] = await createCameraAndMicrophoneStreams(
        LocalCameraStream,
        LocalMicrophoneStream,
        {
          video: { deviceId: 'test-device-id' },
          audio: { deviceId: 'test-device-id' },
        }
      );
      expect(localCameraStream).toBeInstanceOf(LocalCameraStream);
      expect(localMicrophoneStream).toBeInstanceOf(LocalMicrophoneStream);
    });

    it('should return a LocalCameraStream and a LocalMicrophoneStream instance without constraints', async () => {
      expect.assertions(2);

      const [localCameraStream, localMicrophoneStream] = await createCameraAndMicrophoneStreams(
        LocalCameraStream,
        LocalMicrophoneStream
      );
      expect(localCameraStream).toBeInstanceOf(LocalCameraStream);
      expect(localMicrophoneStream).toBeInstanceOf(LocalMicrophoneStream);
    });
  });

  describe('createDisplayMedia', () => {
    jest.spyOn(media, 'getDisplayMedia').mockReturnValue(Promise.resolve(mockStream));

    it('should call getDisplayMedia with video only', async () => {
      expect.assertions(1);

      await createDisplayMedia({
        video: { displayStreamConstructor: LocalDisplayStream },
      });
      expect(media.getDisplayMedia).toHaveBeenCalledWith({ video: true, audio: false });
    });

    it('should call getDisplayMedia with both video and audio', async () => {
      expect.assertions(1);

      await createDisplayMedia({
        video: { displayStreamConstructor: LocalDisplayStream },
        audio: { systemAudioStreamConstructor: LocalSystemAudioStream },
      });
      expect(media.getDisplayMedia).toHaveBeenCalledWith({ video: true, audio: true });
    });

    it('should call getDisplayMedia with video and audio constraints', async () => {
      expect.assertions(1);

      await createDisplayMedia({
        video: { displayStreamConstructor: LocalDisplayStream, constraints: { frameRate: 5 } },
        audio: {
          systemAudioStreamConstructor: LocalSystemAudioStream,
          constraints: { autoGainControl: false },
        },
      });
      expect(media.getDisplayMedia).toHaveBeenCalledWith({
        video: { frameRate: 5 },
        audio: { autoGainControl: false },
      });
    });

    it('should preserve the content hint', async () => {
      expect.assertions(1);

      const [localDisplayStream] = await createDisplayMedia({
        video: { displayStreamConstructor: LocalDisplayStream, videoContentHint: 'motion' },
      });
      expect(localDisplayStream.contentHint).toBe('motion');
    });

    it('should call getDisplayMedia with the preferCurrentTab option', async () => {
      expect.assertions(1);

      await createDisplayMedia({
        video: { displayStreamConstructor: LocalDisplayStream, preferCurrentTab: true },
      });
      expect(media.getDisplayMedia).toHaveBeenCalledWith({
        video: true,
        audio: false,
        preferCurrentTab: true,
      });
    });

    it('should call getDisplayMedia with the selfBrowserSurface option', async () => {
      expect.assertions(1);

      await createDisplayMedia({
        video: { displayStreamConstructor: LocalDisplayStream, selfBrowserSurface: 'include' },
      });
      expect(media.getDisplayMedia).toHaveBeenCalledWith({
        video: true,
        audio: false,
        selfBrowserSurface: 'include',
      });
    });

    it('should call getDisplayMedia with the surfaceSwitching option', async () => {
      expect.assertions(1);

      await createDisplayMedia({
        video: { displayStreamConstructor: LocalDisplayStream, surfaceSwitching: 'include' },
      });
      expect(media.getDisplayMedia).toHaveBeenCalledWith({
        video: true,
        audio: false,
        surfaceSwitching: 'include',
      });
    });

    it('should call getDisplayMedia with the monitorTypeSurfaces option', async () => {
      expect.assertions(1);

      await createDisplayMedia({
        video: { displayStreamConstructor: LocalDisplayStream, monitorTypeSurfaces: 'exclude' },
      });
      expect(media.getDisplayMedia).toHaveBeenCalledWith({
        video: true,
        audio: false,
        monitorTypeSurfaces: 'exclude',
      });
    });

    it('should call getDisplayMedia with the systemAudio option', async () => {
      expect.assertions(1);

      await createDisplayMedia({
        video: { displayStreamConstructor: LocalDisplayStream },
        audio: { systemAudioStreamConstructor: LocalSystemAudioStream, systemAudio: 'exclude' },
      });
      expect(media.getDisplayMedia).toHaveBeenCalledWith({
        video: true,
        audio: true,
        systemAudio: 'exclude',
      });
    });

    it('should call getDisplayMedia with the controller option', async () => {
      expect.assertions(1);

      const fakeController: CaptureController = {} as CaptureController;

      await createDisplayMedia({
        video: { displayStreamConstructor: LocalDisplayStream },
        controller: fakeController,
      });
      expect(media.getDisplayMedia).toHaveBeenCalledWith({
        video: true,
        audio: false,
        controller: fakeController,
      });
    });
  });

  describe('createDisplayStream', () => {
    jest.spyOn(media, 'getDisplayMedia').mockReturnValue(Promise.resolve(mockStream));

    it('should call getDisplayMedia', async () => {
      expect.assertions(1);

      await createDisplayStream(LocalDisplayStream);
      expect(media.getDisplayMedia).toHaveBeenCalledWith({ video: true, audio: false });
    });

    it('should return a LocalDisplayStream instance', async () => {
      expect.assertions(1);

      const localDisplayStream = await createDisplayStream(LocalDisplayStream);
      expect(localDisplayStream).toBeInstanceOf(LocalDisplayStream);
    });

    it('should preserve the content hint', async () => {
      expect.assertions(1);

      const localDisplayStream = await createDisplayStream(LocalDisplayStream, 'motion');
      expect(localDisplayStream.contentHint).toBe('motion');
    });
  });

  describe('createDisplayStreamWithAudio', () => {
    jest.spyOn(media, 'getDisplayMedia').mockReturnValue(Promise.resolve(mockStream));

    // This mock implementation is needed because createDisplayStreamWithAudio will create a new
    // MediaStream from the video track of the mocked stream, so we need to make sure this new
    // stream can get the mocked stream's track as well.
    jest.spyOn(MediaStream.prototype, 'getTracks').mockImplementation(() => mockStream.getTracks());

    it('should call getDisplayMedia with audio', async () => {
      expect.assertions(1);

      await createDisplayStreamWithAudio(LocalDisplayStream, LocalSystemAudioStream);
      expect(media.getDisplayMedia).toHaveBeenCalledWith({ video: true, audio: true });
    });

    it('should return a LocalDisplayStream instance and null if no audio track exists', async () => {
      expect.assertions(2);

      const [localDisplayStream, localSystemAudioStream] = await createDisplayStreamWithAudio(
        LocalDisplayStream,
        LocalSystemAudioStream
      );
      expect(localDisplayStream).toBeInstanceOf(LocalDisplayStream);
      expect(localSystemAudioStream).toBeNull();
    });

    it('should return a LocalDisplayStream and a LocalSystemAudioStream instance if audio track exists', async () => {
      expect.assertions(2);

      const mockStreamWithAudio = createMockedStreamWithAudio();
      jest
        .spyOn(media, 'getDisplayMedia')
        .mockReturnValueOnce(Promise.resolve(mockStreamWithAudio));

      const [localDisplayStream, localSystemAudioStream] = await createDisplayStreamWithAudio(
        LocalDisplayStream,
        LocalSystemAudioStream
      );
      expect(localDisplayStream).toBeInstanceOf(LocalDisplayStream);
      expect(localSystemAudioStream).toBeInstanceOf(LocalSystemAudioStream);
    });

    it('should preserve the content hint', async () => {
      expect.assertions(1);

      const [localDisplayStream] = await createDisplayStreamWithAudio(
        LocalDisplayStream,
        LocalSystemAudioStream,
        'motion'
      );
      expect(localDisplayStream.contentHint).toBe('motion');
    });
  });

  describe('getDevices', () => {
    it('should call ensureDevicePermissions with both audio and video input kinds when no deviceKind is provided', async () => {
      expect.hasAssertions();
      const mockDevices = [
        { kind: 'audioinput', deviceId: 'audio1' },
        { kind: 'videoinput', deviceId: 'video1' },
      ] as MediaDeviceInfo[];

      jest.spyOn(media, 'ensureDevicePermissions').mockResolvedValue(mockDevices);
      jest.spyOn(media, 'enumerateDevices').mockResolvedValue(mockDevices);

      const devices = await getDevices();
      expect(media.ensureDevicePermissions).toHaveBeenCalledWith(
        [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
        media.enumerateDevices
      );
      expect(devices).toStrictEqual(mockDevices);
    });

    it('should call ensureDevicePermissions with the provided deviceKind', async () => {
      expect.hasAssertions();
      const mockDevices = [{ kind: 'audioinput', deviceId: 'audio1' }] as MediaDeviceInfo[];

      jest.spyOn(media, 'ensureDevicePermissions').mockResolvedValue(mockDevices);
      jest.spyOn(media, 'enumerateDevices').mockResolvedValue(mockDevices);

      const devices = await getDevices(media.DeviceKind.AudioInput);
      expect(media.ensureDevicePermissions).toHaveBeenCalledWith(
        [media.DeviceKind.AudioInput],
        media.enumerateDevices
      );
      expect(devices).toStrictEqual(mockDevices);
    });

    it('should filter devices based on the provided deviceKind', async () => {
      expect.hasAssertions();
      const mockDevices = [
        { kind: 'audioinput', deviceId: 'audio1' },
        { kind: 'videoinput', deviceId: 'video1' },
      ] as MediaDeviceInfo[];

      jest.spyOn(media, 'ensureDevicePermissions').mockResolvedValue(mockDevices);
      jest.spyOn(media, 'enumerateDevices').mockResolvedValue(mockDevices);

      const devices = await getDevices(media.DeviceKind.AudioInput);
      expect(devices).toStrictEqual([{ kind: 'audioinput', deviceId: 'audio1' }]);
    });

    it('should throw WebrtcCoreError when device permissions are denied', async () => {
      expect.hasAssertions();
      jest.spyOn(media, 'ensureDevicePermissions').mockImplementation(() => {
        throw new Error();
      });

      const expectedError = new WebrtcCoreError(
        WebrtcCoreErrorType.DEVICE_PERMISSION_DENIED,
        'Failed to ensure device permissions'
      );

      await expect(getDevices()).rejects.toStrictEqual(expectedError);
    });
  });
});
