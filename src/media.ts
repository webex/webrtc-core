import { error } from './util/logger';

export enum DeviceKind {
  AudioInput = 'audioinput',
  AudioOutput = 'audiooutput',
  VideoInput = 'videoinput',
}

/**
 * Prompts the user for permission to use a media input which produces a MediaStream with tracks
 * containing the requested types of media.
 *
 * @param constraints - A MediaStreamConstraints object specifying the types of media to request,
 *     along with any requirements for each type.
 * @returns A Promise whose fulfillment handler receives a MediaStream object when the requested
 *     media has successfully been obtained.
 */
export async function getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia(constraints);
}

/**
 * Prompts the user for permission to use a user's display media and audio. If a video track is
 * absent from the constraints argument, one will still be provided.
 *
 * @param constraints - A MediaStreamConstraints object specifying the types of media to request,
 *     along with any requirements for each type.
 * @returns A Promise whose fulfillment handler receives a MediaStream object when the requested
 *     media has successfully been obtained.
 */
export function getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
  return navigator.mediaDevices.getDisplayMedia(constraints);
}

/**
 * Requests a list of the available media input and output devices, such as microphones, cameras,
 * headsets, and so forth.
 *
 * @returns A Promise that receives an array of MediaDeviceInfo objects when the promise is
 *     fulfilled.
 */
export async function enumerateDevices(): Promise<MediaDeviceInfo[]> {
  return navigator.mediaDevices.enumerateDevices();
}

/**
 * Adds the callback handler to be notified of a media device change (for example, a headset is
 * unplugged from the user's computer).
 *
 * @param handler - The callback function to execute.
 */
export function setOnDeviceChangeHandler(handler: () => void): void {
  navigator.mediaDevices.ondevicechange = handler;
}

/**
 * Checks permissions using the navigator's permissions api.
 *
 * @param deviceKinds - Array of DeviceKind items.
 * @throws An error if camera or microphone aren't available options for query() (Firefox), or if
 *    navigator.permissions is undefined (Safari and others).
 * @returns Array of Permission Status objects.
 */
async function checkNavigatorPermissions(
  deviceKinds: DeviceKind[]
): Promise<Array<PermissionStatus>> {
  const permissionRequests = [];

  if (deviceKinds.includes(DeviceKind.VideoInput)) {
    permissionRequests.push(navigator.permissions.query({ name: 'camera' as PermissionName }));
  }

  if (deviceKinds.includes(DeviceKind.AudioInput)) {
    permissionRequests.push(navigator.permissions.query({ name: 'microphone' as PermissionName }));
  }

  return Promise.all(permissionRequests);
}

/**
 * Check to see if the user has granted the application permission to use their devices.
 *
 * @param deviceKinds - Array of DeviceKind items.
 * @returns True if device permissions exist, false if otherwise.
 */
async function checkDevicePermissions(deviceKinds: DeviceKind[]): Promise<boolean> {
  try {
    const permissions = await checkNavigatorPermissions(deviceKinds);
    if (permissions.every((permission: PermissionStatus) => permission.state === 'granted')) {
      return true;
    }
    // eslint-disable-next-line no-empty
  } catch (e: unknown) {}

  try {
    const devices: MediaDeviceInfo[] = await enumerateDevices();
    // If permissions are granted, the MediaDeviceInfo objects will have labels.
    return devices
      .filter((device: MediaDeviceInfo) => deviceKinds.includes(device.kind as DeviceKind))
      .every((device: MediaDeviceInfo) => device.label);
    // eslint-disable-next-line no-empty
  } catch (e: unknown) {}

  return false;
}

/**
 * Ensures that the user has granted permissions to the microphone and camera.
 *
 * @param deviceKinds - Array of DeviceKind items.
 * @param callback - Function that will be executed while device permissions are granted. After this
 *    returns, permissions (for example device labels in Firefox) may not be available anymore.
 * @returns The callback's response.
 */
export async function ensureDevicePermissions<T>(
  deviceKinds: DeviceKind[],
  callback: () => Promise<T>
): Promise<T> {
  try {
    const hasDevicePermissions = await checkDevicePermissions(deviceKinds);

    if (!hasDevicePermissions) {
      const stream = await getUserMedia({
        audio: deviceKinds.includes(DeviceKind.AudioInput),
        video: deviceKinds.includes(DeviceKind.VideoInput),
      });

      // Callback is here to call a function while an active capture exists, so that the browser
      // (Firefox) will allow the user to access device information.
      const callbackRes = await callback();

      // Stop tracks in the stream so the browser (Safari) will know that there is not an active
      // stream running.
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      return callbackRes;
    }

    return callback();
  } catch (e) {
    error(e);
    throw new Error('Failed to ensure device permissions.');
  }
}
