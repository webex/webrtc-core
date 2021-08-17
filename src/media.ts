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
