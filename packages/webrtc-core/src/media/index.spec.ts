import * as media from '.';
import { createBrowserMock } from '../mocks/create-browser-mock';
import { createPermissionStatus } from '../mocks/create-permission-status';
import MediaStream from '../mocks/media-stream-stub';
import { Navigator } from '../mocks/navigator-stub';

jest.mock('../mocks/navigator-stub');

/**
 * Create example MediaDeviceInfo objects to be used in mocks.
 *
 * @param kind - MediaDeviceKind.
 * @param hasLabel - True if value will have a label, false if it will be an empty string.
 * @returns An example MediaDeviceInfo.
 */
const createDeviceInfo = (kind: MediaDeviceKind, hasLabel: boolean): MediaDeviceInfo => ({
  kind,
  deviceId: 'example-device-id',
  groupId: 'example-group-id',
  label: hasLabel ? 'example-label' : '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function, jsdoc/require-jsdoc
  toJSON: () => {},
});

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

describe('getDisplayMedia', () => {
  it('should return a MediaStream from getDisplayMedia', async () => {
    expect.assertions(1);

    const mockedNavigatorStub = createBrowserMock(Navigator, 'navigator');

    mockedNavigatorStub.mediaDevices.getDisplayMedia.mockReturnValue(
      Promise.resolve(new MediaStream())
    );

    const getDisplayMediaArgs = { video: true };
    await media.getDisplayMedia(getDisplayMediaArgs);

    expect(mockedNavigatorStub.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
      getDisplayMediaArgs
    );
  });
});

describe('enumerateDevices', () => {
  it('should return a DeviceInfoStream from enumerateDevices', async () => {
    expect.assertions(1);

    const mockedNavigatorStub = createBrowserMock(Navigator, 'navigator');

    mockedNavigatorStub.mediaDevices.enumerateDevices.mockReturnValue(
      Promise.resolve([
        createDeviceInfo(media.DeviceKind.AudioInput, true),
        createDeviceInfo(media.DeviceKind.VideoInput, true),
      ])
    );

    await media.enumerateDevices();

    expect(mockedNavigatorStub.mediaDevices.enumerateDevices).toHaveBeenCalledWith();
  });
});

describe('setOnDeviceChangeHandler', () => {
  it('should call setOnDeviceChangeHandler correctly', async () => {
    expect.assertions(1);
    const mockedNavigatorStub = createBrowserMock(Navigator, 'navigator');
    const mockHandler = jest.fn();
    media.setOnDeviceChangeHandler(mockHandler);
    expect(mockedNavigatorStub.mediaDevices.ondevicechange).toBe(mockHandler);
  });
});

describe('checkDevicePermissions', () => {
  it('should checkDevicePermissions for status: granted', async () => {
    expect.assertions(1);

    const mockedNavigatorStub = createBrowserMock(Navigator, 'navigator');
    // mock 'granted' query response
    mockedNavigatorStub.permissions.query
      .mockReturnValueOnce(Promise.resolve(createPermissionStatus('granted')))
      .mockReturnValueOnce(Promise.resolve(createPermissionStatus('granted')));

    const permissionGranted = await media.checkDevicePermissions([
      media.DeviceKind.AudioInput,
      media.DeviceKind.VideoInput,
    ]);
    expect(permissionGranted).toBe(true);
  });
});

describe('ensureDevicePermissions', () => {
  it('should call the callback.', async () => {
    expect.assertions(2);

    const mockedNavigatorStub = createBrowserMock(Navigator, 'navigator');

    // mock 'granted' query response
    mockedNavigatorStub.permissions.query
      .mockReturnValueOnce(Promise.resolve(createPermissionStatus('granted')))
      .mockReturnValueOnce(Promise.resolve(createPermissionStatus('granted')));

    const testCallbackResponse = 'Test Callback Response';
    const mockCallback = jest.fn(async () => testCallbackResponse);

    const callbackResponse = await media.ensureDevicePermissions(
      [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
      mockCallback
    );

    expect(callbackResponse).toBe(testCallbackResponse);
    expect(mockCallback).toHaveBeenCalledWith();
  });

  it('should call enumerateDevices if the permissions query fails.', async () => {
    expect.assertions(1);

    const mockedNavigatorStub = createBrowserMock(Navigator, 'navigator');

    mockedNavigatorStub.permissions.query.mockRejectedValueOnce(new Error('error') as never);

    mockedNavigatorStub.mediaDevices.enumerateDevices.mockReturnValueOnce(
      Promise.resolve([
        createDeviceInfo(media.DeviceKind.AudioInput, true),
        createDeviceInfo(media.DeviceKind.VideoInput, true),
      ])
    );

    await media.ensureDevicePermissions(
      [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
      () => Promise.resolve(true)
    );

    expect(mockedNavigatorStub.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(1);
  });
});

describe('ensureDevicePermissions2', () => {
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
      () => Promise.resolve(true)
    );

    expect(mockedNavigatorStub.mediaDevices.getUserMedia.mock.calls).toHaveLength(1);
    expect(mockedNavigatorStub.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: true,
      video: true,
    });
  });
});
