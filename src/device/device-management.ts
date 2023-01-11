import * as media from '../media';
import { LocalAudioTrack, MicrophoneConstraints } from '../media/local-audio-track';
import { LocalCameraTrack } from '../media/local-camera-track';
import { LocalDisplayTrack } from '../media/local-display-track';
import { LocalMicrophoneTrack } from '../media/local-microphone-track';
import { CameraConstraints } from '../media/local-video-track';

export enum ErrorTypes {
  DEVICE_PERMISSION_DENIED = 'DEVICE_PERMISSION_DENIED',
  CREATE_CAMERA_TRACK_FAILED = 'CREATE_CAMERA_TRACK_FAILED',
  CREATE_MICROPHONE_TRACK_FAILED = 'CREATE_MICROPHONE_TRACK_FAILED',
}

/**
 * Represents a webrtc core error, which contains error type and error message.
 */
export class WebrtcError {
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

/**
 * Creates MicrophoneTrack and CameraTrack at the same time.
 *
 * @param audioConstraints - Audio constraints to create microphone track.
 * @param videoConstraints - Video constraints to create camera track.
 * @returns MicrophoneTrack and cameraTrack at same time.
 */
export async function createMicrophoneAndCameraTracks(
  audioConstraints?: MicrophoneConstraints,
  videoConstraints?: CameraConstraints
): Promise<[LocalMicrophoneTrack, LocalCameraTrack]> {
  let stream: MediaStream;
  try {
    stream = await media.getUserMedia({
      audio: audioConstraints,
      video: videoConstraints,
    });
  } catch (error) {
    throw new WebrtcError(
      ErrorTypes.CREATE_CAMERA_TRACK_FAILED,
      `Failed to create camera track ${error}`
    );
  }
  return [
    new LocalMicrophoneTrack(stream.getAudioTracks()[0]),
    new LocalCameraTrack(stream.getVideoTracks()[0]),
  ];
}

/**
 * Creates a camera video track.
 *
 * @param constraints - Video device constraints.
 * @returns A LocalTrack object or an error.
 */
export async function createCameraTrack(constraints?: CameraConstraints): Promise<LocalCameraTrack> {
  let stream: MediaStream;
  try {
    stream = await media.getUserMedia({ video: constraints });
  } catch (error) {
    throw new WebrtcError(
      ErrorTypes.CREATE_CAMERA_TRACK_FAILED,
      `Failed to create camera track ${error}`
    );
  }
  return new LocalCameraTrack(stream.getVideoTracks()[0]);
}

/**
 * Creates a microphone audio track.
 *
 * @param constraints - Audio device constraints.
 * @returns A LocalTrack object or an error.
 */
export async function createMicrophoneTrack(
  constraints?: MicrophoneConstraints
): Promise<LocalMicrophoneTrack> {
  let stream: MediaStream;
  try {
    stream = await media.getUserMedia({ audio: constraints });
  } catch (error) {
    throw new WebrtcError(
      ErrorTypes.CREATE_MICROPHONE_TRACK_FAILED,
      `Failed to create microphone track ${error}`
    );
  }
  // See if we can just pass the track and not streams
  return new LocalMicrophoneTrack(stream.getAudioTracks()[0]);
}

/**
 * Creates a display video track.
 *
 * @param constraints - Display constraints for screen sharing.
 * @param withAudio
 * @returns A Promise that resolves to a LocalDisplayTrack.
 */
export async function createDisplayTrack(
  constraints?: CameraConstraints,
  withAudio?: boolean
): Promise<{
  localDisplayTrack: LocalDisplayTrack;
  localAudioTrack?: LocalAudioTrack | undefined;
}> {
  const stream = await media.getDisplayMedia({ video: constraints, audio: withAudio });

  return {
    localDisplayTrack: new LocalDisplayTrack(stream.getVideoTracks()[0]),
    localAudioTrack: stream.getAudioTracks()[0]
      ? new LocalAudioTrack(stream.getAudioTracks()[0])
      : undefined,
  };
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
    throw new WebrtcError(
      ErrorTypes.DEVICE_PERMISSION_DENIED,
      'Failed to ensure device permissions'
    );
  }

  return devices.filter((v: MediaDeviceInfo) => (deviceKind ? v.kind === deviceKind : true));
}

/**
 * Helper function to get a list of microphone devices.
 *
 * @returns List of microphone devices in an array of MediaDeviceInfo objects.
 */
export async function getMicrophones(): Promise<MediaDeviceInfo[]> {
  return getDevices(media.DeviceKind.AudioInput);
}

/**
 * Helper function to get a list of speaker devices.
 *
 * @returns List of speaker devices in an array of MediaDeviceInfo objects.
 */
export async function getSpeakers(): Promise<MediaDeviceInfo[]> {
  return getDevices(media.DeviceKind.AudioOutput);
}

/**
 * Helper function to get a list of camera devices.
 *
 * @returns List of camera devices in an array of MediaDeviceInfo objects.
 */
export async function getCameras(): Promise<MediaDeviceInfo[]> {
  return getDevices(media.DeviceKind.VideoInput);
}

/**
 * Export the setOnDeviceChangeHandler method directly from the core lib.
 */
export const { setOnDeviceChangeHandler } = media;
