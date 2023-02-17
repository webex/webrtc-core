import * as media from '../media';
import { MicrophoneConstraints } from '../media/local-audio-track';
import { LocalCameraTrack } from '../media/local-camera-track';
import { LocalDisplayTrack } from '../media/local-display-track';
import { LocalMicrophoneTrack } from '../media/local-microphone-track';
import { CameraConstraints, DisplayConstraints } from '../media/local-video-track';

import { ErrorTypes, WebrtcError } from '../error/WebrtcError';
import { LocalComputerAudioTrack } from '../media/local-computer-audio-track';

/**
 * Creates a camera video track. Please note that the constraint params in second getUserMedia call would NOT take effect when:
 *
 * 1. Previous captured video track from the same device is not stopped .
 * 2. Previous createCameraTrack() call for the same device is in progress.
 
 * Creates LocalMicrophoneTrack and LocalCameraTrack at the same time.
 *
 * @param audioConstraints - Audio constraints to create microphone track.
 * @param videoConstraints - Video constraints to create camera track.
 * @returns LocalMicrophoneTrack and LocalCameraTrack at same time.
 */
export async function createMicrophoneAndCameraTracks(
  audioConstraints?: MicrophoneConstraints | boolean,
  videoConstraints?: CameraConstraints | boolean
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
export async function createCameraTrack(
  constraints?: CameraConstraints
): Promise<LocalCameraTrack> {
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

// to-ask: getAudioTracks doesnt exist on the o/p of getUserMedia()
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
  return new LocalMicrophoneTrack(stream.getAudioTracks()[0]);
}
export interface createDisplayTrackConstraint {
  constraints?: DisplayConstraints;
  withAudio?: boolean;
}

/**
 * Creates a display video track.
 *
 * @param constraints - Display constraints for screen sharing.
 * @param constraints.constraints
 * @param constraints.withAudio
 * @returns A Promise that resolves to a LocalDisplayTrack.
 */
export async function createDisplayTrack({
  constraints,
  withAudio,
}: createDisplayTrackConstraint): Promise<{
  localDisplayTrack: LocalDisplayTrack;
  localComputerAudioTrack?: LocalComputerAudioTrack;
}> {
  const stream = await media.getDisplayMedia({ video: constraints, audio: withAudio });

  return {
    localDisplayTrack: new LocalDisplayTrack(stream.getVideoTracks()[0]),
    localComputerAudioTrack: stream.getAudioTracks()[0]
      ? new LocalComputerAudioTrack(stream.getAudioTracks()[0])
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
  const devices: MediaDeviceInfo[] = await media.ensureDevicePermissions(
    [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput],
    media.enumerateDevices
  );

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
