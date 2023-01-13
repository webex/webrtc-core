import * as media from '../media';
import { LocalCameraTrack } from '../media/local-camera-track';
import { LocalDisplayTrack } from '../media/local-display-track';
import { LocalMicrophoneTrack } from '../media/local-microphone-track';

export enum ErrorTypes {
  DEVICE_PERMISSION_DENIED = 'DEVICE_PERMISSION_DENIED',
  CREATE_CAMERA_TRACK_FAILED = 'CREATE_CAMERA_TRACK_FAILED',
  CREATE_MICROPHONE_TRACK_FAILED = 'CREATE_MICROPHONE_TRACK_FAILED',
}

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

export type AudioDeviceConstraints = {
  deviceId?: string;
};

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
 * 1. Previous captured video track is not stopped.
 * 2. Previous createCameraTrack() call is in progress.
 *
 * @param constraints - Video device constraints.
 * @returns A LocalTrack object or an error.
 */
export async function createCameraTrack(
  constraints?: VideoDeviceConstraints
): Promise<LocalCameraTrack> {
  let stream: MediaStream;
  try {
    stream = await media.getUserMedia({ video: { ...constraints } });
  } catch (error) {
    throw new WcmeError(
      ErrorTypes.CREATE_CAMERA_TRACK_FAILED,
      `Failed to create camera track ${error}`
    );
  }
  return new LocalCameraTrack(stream);
}

/**
 * Creates a microphone audio track.
 *
 * @param constraints - Audio device constraints.
 * @returns A LocalTrack object or an error.
 */
export async function createMicrophoneTrack(
  constraints?: AudioDeviceConstraints
): Promise<LocalMicrophoneTrack> {
  let stream: MediaStream;
  try {
    stream = await media.getUserMedia({ audio: { ...constraints } });
  } catch (error) {
    throw new WcmeError(
      ErrorTypes.CREATE_MICROPHONE_TRACK_FAILED,
      `Failed to create microphone track ${error}`
    );
  }
  return new LocalMicrophoneTrack(stream);
}

/**
 * Creates a display video track.
 *
 * @returns A Promise that resolves to a LocalDisplayTrack.
 */
export async function createDisplayTrack(): Promise<LocalDisplayTrack> {
  const stream = await media.getDisplayMedia({ video: true });
  return new LocalDisplayTrack(stream);
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
