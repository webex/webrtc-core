import { createPermissionStatus } from './create-permission-status';
import MediaStream from './media-stream-stub';

/**
 * A getUserMedia stub, returns a MediaStream with tracks according to the constraints passed in.
 *
 * @param constraints - MediaStreamConstraints.
 * @returns A Promise that resolves to a MediaStream.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getUserMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
  return new MediaStream();
};

/**
 * A getDisplayMedia stub, returns a MediaStream with tracks according to the constraints passed in.
 *
 * @param constraints - MediaStreamConstraints.
 * @returns A Promise that resolves to a MediaStream.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getDisplayMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
  return new MediaStream();
};

/**
 * An enumerateDevices stub.
 *
 * @returns A Promise that resolves to an array of DeviceInfo objects.
 */
const enumerateDevices = async (): Promise<MediaDeviceInfo[]> => {
  return [];
};

/**
 * @param event
 */
const ondevicechange = (event: Event) => {
  return event;
};

/**
 * A permissions.query stub.
 *
 * @param descriptor - A PermissionDescriptor object.
 * @returns True if permissions are allowed, false if otherwise.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const permissionsQuery = async (descriptor: PermissionDescriptor): Promise<PermissionStatus> => {
  return createPermissionStatus('prompt');
};

const mediaDevices = {
  enumerateDevices,
  getDisplayMedia,
  getUserMedia,
  ondevicechange,
};

const permissions = {
  query: permissionsQuery,
};

// root 'navigator' object
const Navigator = { mediaDevices, permissions };

/**
 * We do this to fill in the type that would normally be in the dom.
 */
Object.defineProperty(window, 'navigator', {
  writable: true,
  value: Navigator,
});

export { Navigator };
