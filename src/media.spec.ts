import * as media from './media';
import { createBrowserMock } from './mocks/create-browser-mock';
import { MediaStream } from './mocks/media-stream-stub';
import { Navigator } from './mocks/navigator-stub';

jest.mock('./mocks/navigator-stub');

describe('getUserMedia', () => {
  it('should return a MediaStream from getUserMedia', async () => {
    expect.assertions(1);

    const mockedNavigatorStub = createBrowserMock(Navigator, 'navigator');

    mockedNavigatorStub.mediaDevices.getUserMedia.mockReturnValue(
      Promise.resolve(new MediaStream())
    );

    const getUserMediaArgs = { audio: true, video: true };
    await media.getUserMedia(getUserMediaArgs);

    expect(mockedNavigatorStub.mediaDevices.getUserMedia).toHaveBeenCalledWith(getUserMediaArgs);
  });
});

describe('ensureDevicePermissions', () => {
  it('should call the callback.', async () => {
    expect.assertions(2);

    const testCallbackResponse = 'Test Callback Response';
    const mockCallback = jest.fn(() => testCallbackResponse);

    const callbackResponse = await media.ensureDevicePermissions(
      [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
      mockCallback
    );

    expect(callbackResponse).toBe(testCallbackResponse);
    expect(mockCallback).toHaveBeenCalledWith();
  });

  it('should call getUserMedia if permissions are not allowed', async () => {
    expect.assertions(2);

    const mockedNavigatorStub = createBrowserMock(Navigator, 'navigator');

    mockedNavigatorStub.permissions.query.mockRejectedValue(new Error('error') as never);
    mockedNavigatorStub.mediaDevices.enumerateDevices.mockRejectedValue(
      new Error('error') as never
    );

    mockedNavigatorStub.mediaDevices.getUserMedia.mockReturnValue(
      Promise.resolve(new MediaStream())
    );

    await media.ensureDevicePermissions(
      [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
      () => true
    );

    expect(mockedNavigatorStub.mediaDevices.getUserMedia.mock.calls).toHaveLength(1);
    expect(mockedNavigatorStub.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: true,
      video: true,
    });
  });
});
