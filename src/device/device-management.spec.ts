import * as media from '../media';
import { LocalCameraStream } from '../media/local-camera-stream';
import { LocalDisplayStream } from '../media/local-display-stream';
import { LocalMicrophoneStream } from '../media/local-microphone-stream';
import { LocalSystemAudioStream } from '../media/local-system-audio-stream';
import { createBrowserMock } from '../mocks/create-browser-mock';
import MediaStreamStub from '../mocks/media-stream-stub';
import { createMockedStream, createMockedStreamWithAudio } from '../util/test-utils';
import {
  createCameraStream,
  createDisplayStream,
  createDisplayStreamWithAudio,
  createMicrophoneStream,
} from './device-management';

jest.mock('../mocks/media-stream-stub');

describe('Device Management', () => {
  // const mockedMedia = createBrowserMock(media);
  createBrowserMock(MediaStreamStub, 'MediaStream');

  const mockStream = createMockedStream();

  describe('createMicrophoneStream', () => {
    jest
      .spyOn(media, 'getUserMedia')
      .mockReturnValue(Promise.resolve(mockStream as unknown as MediaStream));

    it('should call getUserMedia', async () => {
      expect.assertions(1);

      await createMicrophoneStream({ deviceId: 'test-device-id' });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        audio: {
          deviceId: 'test-device-id',
        },
      });
    });

    it('should return a LocalMicrophoneStream instance', async () => {
      expect.assertions(1);

      const localMicrophoneStream = await createMicrophoneStream({
        deviceId: 'test-device-id',
      });
      expect(localMicrophoneStream).toBeInstanceOf(LocalMicrophoneStream);
    });
  });

  describe('createCameraStream', () => {
    jest
      .spyOn(media, 'getUserMedia')
      .mockReturnValue(Promise.resolve(mockStream as unknown as MediaStream));

    it('should call getUserMedia', async () => {
      expect.assertions(1);

      await createCameraStream({ deviceId: 'test-device-id' });
      expect(media.getUserMedia).toHaveBeenCalledWith({
        video: {
          deviceId: 'test-device-id',
        },
      });
    });

    it('should call getUserMedia with constraints', async () => {
      expect.assertions(1);

      await createCameraStream({
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

      const localCameraStream = await createCameraStream({
        deviceId: 'test-device-id',
      });
      expect(localCameraStream).toBeInstanceOf(LocalCameraStream);
    });
  });

  describe('createDisplayStream', () => {
    jest
      .spyOn(media, 'getDisplayMedia')
      .mockReturnValue(Promise.resolve(mockStream as unknown as MediaStream));

    it('should call getDisplayMedia', async () => {
      expect.assertions(1);

      await createDisplayStream();
      expect(media.getDisplayMedia).toHaveBeenCalledWith({ video: true });
    });

    it('should return a LocalDisplayStream instance', async () => {
      expect.assertions(2);

      const localDisplayStream = await createDisplayStream();
      expect(localDisplayStream).toBeInstanceOf(LocalDisplayStream);
      expect(localDisplayStream.contentHint).toBeUndefined();
    });

    it('should preserve the content hint', async () => {
      expect.assertions(1);

      const localDisplayStream = await createDisplayStream('motion');
      expect(localDisplayStream.contentHint).toBe('motion');
    });
  });

  describe('createDisplayStreamWithAudio', () => {
    jest
      .spyOn(media, 'getDisplayMedia')
      .mockReturnValue(Promise.resolve(mockStream as unknown as MediaStream));

    // This mock implementation is needed because createDisplayStreamWithAudio will create a new
    // MediaStream from the video track of the mocked stream, so we need to make sure this new
    // stream can get the mocked stream's track as well.
    jest.spyOn(MediaStream.prototype, 'getTracks').mockImplementation(() => mockStream.getTracks());

    it('should call getDisplayMedia with audio', async () => {
      expect.assertions(1);

      await createDisplayStreamWithAudio();
      expect(media.getDisplayMedia).toHaveBeenCalledWith({ video: true, audio: true });
    });

    it('should return a LocalDisplayStream instance and null if no audio track exists', async () => {
      expect.assertions(2);

      const [localDisplayStream, localSystemAudioStream] = await createDisplayStreamWithAudio();
      expect(localDisplayStream).toBeInstanceOf(LocalDisplayStream);
      expect(localSystemAudioStream).toBeNull();
    });

    it('should return a LocalDisplayStream and a LocalSystemAudioStream instance if audio track exists', async () => {
      expect.assertions(2);

      const mockStreamWithAudio = createMockedStreamWithAudio();
      jest
        .spyOn(media, 'getDisplayMedia')
        .mockReturnValueOnce(Promise.resolve(mockStreamWithAudio as unknown as MediaStream));

      const [localDisplayStream, localSystemAudioStream] = await createDisplayStreamWithAudio();
      expect(localDisplayStream).toBeInstanceOf(LocalDisplayStream);
      expect(localSystemAudioStream).toBeInstanceOf(LocalSystemAudioStream);
    });

    it('should preserve the content hint', async () => {
      expect.assertions(1);

      const [localDisplayStream] = await createDisplayStreamWithAudio('motion');
      expect(localDisplayStream.contentHint).toBe('motion');
    });
  });
});
