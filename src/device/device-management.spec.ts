import { LocalMicrophoneStream } from '../media/local-microphone-stream';
import * as media from '../media';
import { createBrowserMock } from '../mocks/create-browser-mock';
import MediaStreamStub from '../mocks/media-stream-stub';
import { mocked } from '../mocks/mock';
import {
  createCameraStream,
  createDisplayStream,
  createMicrophoneStream,
} from './device-management';
import { LocalDisplayStream } from '../media/local-display-stream';
import { LocalCameraStream } from '../media/local-camera-stream';

jest.mock('../mocks/media-stream-stub');

describe('Device Management', () => {
  // const mockedMedia = createBrowserMock(media);
  createBrowserMock(MediaStreamStub, 'MediaStream');

  const mockStream = mocked(new MediaStream());
  const track = new MediaStreamTrack();
  mockStream.getTracks.mockReturnValue([track]);

  describe('createMicrophoneStream', () => {
    jest
      .spyOn(media, 'getUserMedia')
      .mockImplementation()
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
      .mockImplementation()
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
      .mockImplementation()
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
});
