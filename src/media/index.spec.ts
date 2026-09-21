import * as media from '.';
import { createBrowserMock } from '../mocks/create-browser-mock';
import { createPermissionStatus } from '../mocks/create-permission-status';
import MediaStream from '../mocks/media-stream-stub';
import { Navigator } from '../mocks/navigator-stub';
import { logger } from '../util/logger';

jest.mock('../mocks/navigator-stub');

/**
 * Create example MediaDeviceInfo objects to be used in mocks.
 *
 * @param kind - MediaDeviceKind.
 * @param deviceInfo - Device information overrides.
 * @returns An example MediaDeviceInfo.
 */
const createDeviceInfo = (
  kind: MediaDeviceKind,
  deviceInfo: Partial<Pick<MediaDeviceInfo, 'deviceId' | 'groupId' | 'label'>> = {}
): MediaDeviceInfo => {
  const {
    deviceId = 'example-device-id',
    groupId = 'example-group-id',
    label = 'example-label',
  } = deviceInfo;

  return {
    kind,
    deviceId,
    groupId,
    label,
    // eslint-disable-next-line @typescript-eslint/no-empty-function, jsdoc/require-jsdoc
    toJSON: () => {},
  };
};

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

describe('checkDevicePermissions', () => {
  const mockedNavigatorStub = createBrowserMock(Navigator, 'navigator');

  beforeEach(() => {
    mockedNavigatorStub.mediaDevices.enumerateDevices.mockReset();
    mockedNavigatorStub.permissions.query.mockReset();
  });

  it('should return true when device IDs and labels are available', async () => {
    expect.assertions(1);
    mockedNavigatorStub.mediaDevices.enumerateDevices.mockResolvedValue([
      createDeviceInfo(media.DeviceKind.AudioInput),
      createDeviceInfo(media.DeviceKind.VideoInput),
    ]);

    await expect(
      media.checkDevicePermissions([media.DeviceKind.AudioInput, media.DeviceKind.VideoInput])
    ).resolves.toBe(true);
  });

  it('should return false when device information is hidden despite granted permission', async () => {
    expect.assertions(2);
    mockedNavigatorStub.permissions.query.mockResolvedValue(createPermissionStatus('granted'));
    mockedNavigatorStub.mediaDevices.enumerateDevices.mockResolvedValue([
      createDeviceInfo(media.DeviceKind.AudioInput, {
        deviceId: '',
        groupId: '',
        label: '',
      }),
    ]);

    await expect(media.checkDevicePermissions([media.DeviceKind.AudioInput])).resolves.toBe(false);
    expect(mockedNavigatorStub.permissions.query).not.toHaveBeenCalled();
  });

  it('should return false when a device ID is hidden', async () => {
    expect.assertions(1);
    mockedNavigatorStub.mediaDevices.enumerateDevices.mockResolvedValue([
      createDeviceInfo(media.DeviceKind.AudioInput, { deviceId: '' }),
    ]);

    await expect(media.checkDevicePermissions([media.DeviceKind.AudioInput])).resolves.toBe(false);
  });

  it('should return false when a device label is hidden', async () => {
    expect.assertions(1);
    mockedNavigatorStub.mediaDevices.enumerateDevices.mockResolvedValue([
      createDeviceInfo(media.DeviceKind.AudioInput, { label: '' }),
    ]);

    await expect(media.checkDevicePermissions([media.DeviceKind.AudioInput])).resolves.toBe(false);
  });
});

describe('ensureDevicePermissions', () => {
  const mockedNavigatorStub = createBrowserMock(Navigator, 'navigator');

  beforeEach(() => {
    mockedNavigatorStub.mediaDevices.enumerateDevices.mockReset();
    mockedNavigatorStub.mediaDevices.getUserMedia.mockReset();
    mockedNavigatorStub.permissions.query.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should use exposed devices without starting a temporary capture', async () => {
    expect.assertions(3);
    const exposedDevices = [
      createDeviceInfo(media.DeviceKind.AudioInput),
      createDeviceInfo(media.DeviceKind.VideoInput),
    ];
    mockedNavigatorStub.mediaDevices.enumerateDevices.mockResolvedValue(exposedDevices);

    await expect(
      media.ensureDevicePermissions(
        [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
        media.enumerateDevices
      )
    ).resolves.toStrictEqual(exposedDevices);
    expect(mockedNavigatorStub.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(2);
    expect(mockedNavigatorStub.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it('should capture when permission is granted but device information is hidden', async () => {
    expect.assertions(4);
    const track = new MediaStreamTrack();
    const stop = jest.spyOn(track, 'stop');
    const stream = new MediaStream([track]);
    const exposedDevices = [
      createDeviceInfo(media.DeviceKind.AudioInput),
      createDeviceInfo(media.DeviceKind.VideoInput),
    ];

    mockedNavigatorStub.permissions.query.mockResolvedValue(createPermissionStatus('granted'));
    mockedNavigatorStub.mediaDevices.enumerateDevices
      .mockResolvedValueOnce([
        createDeviceInfo(media.DeviceKind.AudioInput, { deviceId: '', label: '' }),
        createDeviceInfo(media.DeviceKind.VideoInput, { deviceId: '', label: '' }),
      ])
      .mockResolvedValueOnce(exposedDevices);
    mockedNavigatorStub.mediaDevices.getUserMedia.mockResolvedValue(stream);

    await expect(
      media.ensureDevicePermissions(
        [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
        media.enumerateDevices
      )
    ).resolves.toStrictEqual(exposedDevices);

    expect(mockedNavigatorStub.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: true,
      video: true,
    });
    expect(mockedNavigatorStub.permissions.query).not.toHaveBeenCalled();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('should capture only the device kind whose information is hidden', async () => {
    expect.assertions(1);
    mockedNavigatorStub.mediaDevices.enumerateDevices.mockResolvedValue([
      createDeviceInfo(media.DeviceKind.AudioInput),
      createDeviceInfo(media.DeviceKind.VideoInput, { deviceId: '', label: '' }),
    ]);
    mockedNavigatorStub.mediaDevices.getUserMedia.mockResolvedValue(new MediaStream());

    await media.ensureDevicePermissions(
      [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
      () => Promise.resolve(true)
    );

    expect(mockedNavigatorStub.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: true,
    });
  });

  it('should not request capture for device types that are not available', async () => {
    expect.assertions(3);
    const availableDevices = [createDeviceInfo(media.DeviceKind.AudioInput)];
    mockedNavigatorStub.mediaDevices.enumerateDevices.mockResolvedValue(availableDevices);

    await expect(
      media.ensureDevicePermissions(
        [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
        media.enumerateDevices
      )
    ).resolves.toStrictEqual(availableDevices);
    expect(mockedNavigatorStub.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(2);
    expect(mockedNavigatorStub.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it('should request capture when device enumeration fails', async () => {
    expect.assertions(1);
    mockedNavigatorStub.mediaDevices.enumerateDevices.mockRejectedValue(new Error('error'));
    mockedNavigatorStub.mediaDevices.getUserMedia.mockResolvedValue(new MediaStream());

    await media.ensureDevicePermissions(
      [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
      () => Promise.resolve(true)
    );

    expect(mockedNavigatorStub.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: true,
      video: true,
    });
  });

  it('should stop temporary tracks when the callback fails', async () => {
    expect.assertions(3);
    const track = new MediaStreamTrack();
    const stop = jest.spyOn(track, 'stop');
    const stream = new MediaStream([track]);
    const callbackError = new Error('callback error');
    const loggerError = jest.spyOn(logger, 'error').mockImplementation(() => undefined);

    mockedNavigatorStub.mediaDevices.enumerateDevices.mockResolvedValue([
      createDeviceInfo(media.DeviceKind.AudioInput, { deviceId: '', label: '' }),
    ]);
    mockedNavigatorStub.mediaDevices.getUserMedia.mockResolvedValue(stream);

    await expect(
      media.ensureDevicePermissions([media.DeviceKind.AudioInput], () =>
        Promise.reject(callbackError)
      )
    ).rejects.toThrow('Failed to ensure device permissions.');
    expect(stop).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenCalledWith(callbackError);
  });

  it('should skip capture when requesting only speakers', async () => {
    expect.assertions(3);
    const mockCallback = jest.fn(async () => true);

    await expect(
      media.ensureDevicePermissions([media.DeviceKind.AudioOutput], mockCallback)
    ).resolves.toBe(true);
    expect(mockedNavigatorStub.mediaDevices.enumerateDevices).not.toHaveBeenCalled();
    expect(mockedNavigatorStub.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });
});
