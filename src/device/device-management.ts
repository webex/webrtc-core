import { LocalMicrophoneStream } from '../media/local-microphone-stream';
import { VideoContentHint } from '../media/local-display-track';
import * as media from '../media';
import { LocalTrack } from '../media/local-track';

export enum ErrorTypes {
  DEVICE_PERMISSION_DENIED = 'DEVICE_PERMISSION_DENIED',
  CREATE_CAMERA_TRACK_FAILED = 'CREATE_CAMERA_TRACK_FAILED',
  CREATE_MICROPHONE_TRACK_FAILED = 'CREATE_MICROPHONE_TRACK_FAILED',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

/**
 * Represents a WCME error, which contains error type and error message.
 */
export class WcmeError {
  type: string;

  message: string;

  /**
   * Creates new error.
   *
   * @param type - Error type.
   * @param message - Error message.
   */
  constructor(type: ErrorTypes, message = '') {
    this.type = type;
    this.message = message;
  }
}

export type AudioDeviceConstraints = Pick<
  MediaTrackConstraints,
  | 'autoGainControl'
  | 'channelCount'
  | 'deviceId'
  | 'echoCancellation'
  | 'noiseSuppression'
  | 'sampleRate'
  | 'sampleSize'
  | 'suppressLocalAudioPlayback'
>;

export type VideoDeviceConstraints = {
  deviceId?: ConstrainDOMString;
  width?: ConstrainULong;
  height?: ConstrainULong;
  aspectRatio?: ConstrainDouble;
  frameRate?: ConstrainDouble;
  facingMode?: ConstrainDOMString;
};

/**
 * Creates a camera video track. Please note that the constraint params in second getUserMedia call would NOT take effect when:
 *
 * 1. Previous captured video track from the same device is not stopped .
 * 2. Previous createCameraTrack() call for the same device is in progress.
 *
 * @param constructor - Constructor for the local camera track.
 * @param constraints - Video device constraints.
 * @returns A LocalTrack object or an error.
 */
export async function createCameraTrack<T extends LocalTrack>(
  constructor: Constructor<T>,
  constraints?: VideoDeviceConstraints
): Promise<T> {
  let stream: MediaStream;
  try {
    stream = await media.getUserMedia({ video: { ...constraints } });
  } catch (error) {
    throw new WcmeError(
      ErrorTypes.CREATE_CAMERA_TRACK_FAILED,
      `Failed to create camera track ${error}`
    );
  }
  return new constructor(stream);
}

/**
 * Creates a LocalMicrophoneStream with the given constraints.
 *
 * @param constraints - Audio device constraints.
 * @returns A LocalTrack object or an error.
 */
export async function createMicrophoneStream(
  constraints?: AudioDeviceConstraints
): Promise<LocalMicrophoneStream> {
  let stream: MediaStream;
  try {
    stream = await media.getUserMedia({ audio: { ...constraints } });
  } catch (error) {
    throw new WcmeError(
      ErrorTypes.CREATE_MICROPHONE_TRACK_FAILED,
      `Failed to create microphone track ${error}`
    );
  }
  return new LocalMicrophoneStream(stream);
}

/**
 * Creates a display video track.
 *
 * @param constructor - Constructor for the local display track.
 * @param videoContentHint - An optional parameters to give a hint for the content of the track.
 * @returns A Promise that resolves to a LocalDisplayTrack.
 */
export async function createDisplayTrack<T extends LocalTrack>(
  constructor: Constructor<T>,
  videoContentHint?: VideoContentHint
): Promise<T> {
  const stream = await media.getDisplayMedia({ video: true });
  return new constructor(stream, videoContentHint);
}

/**
 * Enumerates the media input and output devices available.
 *
 * @param deviceKind - Optional filter to return a specific device kind.
 * @returns List of media devices in an array of MediaDeviceInfo objects.
 */
export async function getDevices(deviceKind?: media.DeviceKind): Promise<MediaDeviceInfo[]> {
  let devices: MediaDeviceInfo[];
  try {
    devices = await media.ensureDevicePermissions(
      [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
      media.enumerateDevices
    );
  } catch (error) {
    throw new WcmeError(ErrorTypes.DEVICE_PERMISSION_DENIED, 'Failed to ensure device permissions');
  }

  return devices.filter((v: MediaDeviceInfo) => (deviceKind ? v.kind === deviceKind : true));
}

/**
 * Helper function to get a list of microphone devices.
 *
 * @returns List of microphone devices in an array of MediaDeviceInfo objects.
 */
export async function getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
  return getDevices(media.DeviceKind.AudioInput);
}

/**
 * Helper function to get a list of speaker devices.
 *
 * @returns List of speaker devices in an array of MediaDeviceInfo objects.
 */
export async function getAudioOutputDevices(): Promise<MediaDeviceInfo[]> {
  return getDevices(media.DeviceKind.AudioOutput);
}

/**
 * Helper function to get a list of camera devices.
 *
 * @returns List of camera devices in an array of MediaDeviceInfo objects.
 */
export async function getVideoInputDevices(): Promise<MediaDeviceInfo[]> {
  return getDevices(media.DeviceKind.VideoInput);
}

/**
 * Export the setOnDeviceChangeHandler method directly from the core lib.
 */
export const { setOnDeviceChangeHandler } = media;
