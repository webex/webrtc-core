import { logger } from '../util/logger';

export enum DeviceKind {
  AudioInput = 'audioinput',
  AudioOutput = 'audiooutput',
  VideoInput = 'videoinput',
}

// CaptureController is experimental so TypeScript doesn't have a type for it yet.
// So we define the interface ourselves here.
// See https://developer.mozilla.org/en-US/docs/Web/API/CaptureController.
export interface CaptureController {
  setFocusBehavior(
    behavior: 'focus-capturing-application' | 'focus-captured-surface' | 'no-focus-change'
  ): Promise<void>;
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
 * absent from the constraints argument, one will still be provided. Includes experimental options
 * found in https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia#options.
 *
 * @param constraints - A MediaStreamConstraints object specifying the types of media to request,
 *     along with any requirements for each type, as well as experimental options.
 * @returns A Promise whose fulfillment handler receives a MediaStream object when the requested
 *     media has successfully been obtained.
 */
export function getDisplayMedia(
  constraints: MediaStreamConstraints & {
    controller?: CaptureController;
    selfBrowserSurface?: 'include' | 'exclude';
    surfaceSwitching?: 'include' | 'exclude';
    systemAudio?: 'include' | 'exclude';
    monitorTypeSurfaces?: 'include' | 'exclude';
  }
): Promise<MediaStream> {
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
 * Finds requested microphones and cameras whose IDs and labels are hidden.
 *
 * Firefox may require temporary capture to show this information even when permission is granted.
 *
 * @param deviceKinds - Array of DeviceKind items.
 * @returns Device types that need temporary capture.
 */
async function getDeviceKindsRequiringCapture(deviceKinds: DeviceKind[]): Promise<DeviceKind[]> {
  // getUserMedia cannot request speaker devices.
  const inputDeviceKinds = deviceKinds.filter(
    (deviceKind) => deviceKind !== DeviceKind.AudioOutput
  );

  if (inputDeviceKinds.length === 0) {
    return [];
  }

  try {
    const devices = await enumerateDevices();

    // Capture only when an enumerated device has hidden details. Requesting capture for an
    // unavailable device type would fail the entire device lookup.
    return inputDeviceKinds.filter((deviceKind) =>
      devices.some((device) => device.kind === deviceKind && (!device.deviceId || !device.label))
    );
  } catch {
    // If enumeration fails, assume every requested input type needs temporary capture.
    return inputDeviceKinds;
  }
}

/**
 * Checks whether any requested input device has a hidden ID or label.
 *
 * @param deviceKinds - Array of DeviceKind items.
 * @returns False if temporary capture is needed. Otherwise, true.
 */
export async function checkDevicePermissions(deviceKinds: DeviceKind[]): Promise<boolean> {
  return (await getDeviceKindsRequiringCapture(deviceKinds)).length === 0;
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
    const deviceKindsRequiringCapture = await getDeviceKindsRequiringCapture(deviceKinds);

    if (deviceKindsRequiringCapture.length > 0) {
      const stream = await getUserMedia({
        audio: deviceKindsRequiringCapture.includes(DeviceKind.AudioInput),
        video: deviceKindsRequiringCapture.includes(DeviceKind.VideoInput),
      });

      try {
        // Firefox exposes device identifiers only while this document is allowed to access them.
        return await callback();
      } finally {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    }

    return callback();
  } catch (e) {
    logger.error(e);
    throw new Error('Failed to ensure device permissions.');
  }
}
