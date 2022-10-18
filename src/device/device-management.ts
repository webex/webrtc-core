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

export type AudioDeviceConstraints = {
  deviceId?: string;
};

// Predefined encoder config mentioned similar to https://api-ref.agora.io/en/voice-sdk/web/4.x/globals.html#videoencoderconfigurationpreset
export enum StaticVideoEncoderConfig {
  Profile1080P = '1080P',
}

export type ConstrainLong = {
  min?: number;
  max?: number;
  ideal?: number;
  exact?: number;
};

// Predefined encoder config mentioned similar to https://api-ref.agora.io/en/voice-sdk/web/4.x/globals.html#videoencoderconfigurationpreset
export type videoEncoderConfig = {
  bitRateMin?: number;
  bitrateMax?: number;
  frameRate?: number | ConstrainLong;
  height?: number | ConstrainLong;
  width?: number | ConstrainLong;
  aspectRatio?: number;
};

export type VideoConstraints = {
  cameraDeviceId?: string;
  faceingMode?: ConstrainULong;
  optimizationMode?: ConstrainULong;
  encoderConfig?: StaticVideoEncoderConfig | videoEncoderConfig; 
};

// something like this https://api-ref.agora.io/en/video-sdk/web/4.x/globals.html#audioencoderconfigurationpreset
export enum StaticAudioEncoderConfig {
  sampleRateLow = '16kHz',
}

export type audioEncoderConfig = {
  bitrate?: number;
  sampleRate?: number;
  sampleSize?: number;
  stereo?: boolean;
};

export type MicrophoneConstraints = {
  echoCancelation?: boolean;
  autoGainControl?: boolean;
  noiseSupression?: boolean;
  microphoneDeviceid?: string;
  encoderConfig?: StaticAudioEncoderConfig | audioEncoderConfig;
};

export type CustomVideoTrackInitConfig = {
  mediaStreamTrack: MediaStreamTrack;
  encoderConfig?: StaticVideoEncoderConfig | videoEncoderConfig;
};

export type CustomAudioTrackInitConfig = {
  mediaStreamTrack: MediaStreamTrack;
  encoderConfig?: StaticAudioEncoderConfig | audioEncoderConfig;
};

/**
 * @param audioConfig
 * @param videoConfig
 */
export async function createMicrophoneAndCameraTracks(
  audioConfig?: MicrophoneConstraints,
  videoConfig?: VideoConstraints
): Promise<[IMicrophoneAudioTrack, ICameraVideoTrack]> {}

/**
 * Creates a camera video track.
 *
 * @param constraints - Video device constraints.
 * @returns A LocalTrack object or an error.
 */
export async function createCameraTrack(constraints?: VideoConstraints): Promise<LocalCameraTrack> {
  let stream: MediaStream;
  try {
    // TODO: change it
    stream = await media.getUserMedia({ video: {} });
  } catch (error) {
    throw new WebrtcError(
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
    throw new WebrtcError(
      ErrorTypes.CREATE_MICROPHONE_TRACK_FAILED,
      `Failed to create microphone track ${error}`
    );
  }
  // See if we can just pass the track and not streams
  return new LocalMicrophoneTrack(stream);
}

/**
 * Creates a display video track.
 *
 * @param constraints
 * @returns A Promise that resolves to a LocalDisplayTrack.
 */
export async function createDisplayTrack(
  constraints?: VideoDeviceConstraints
): Promise<LocalDisplayTrack> {
  const stream = await media.getDisplayMedia({ video: true });
  return new LocalDisplayTrack(stream);
}

/**
 * Creates custom video track .
 *
 * @param constraints
 * @returns A Promise that resolves to a LocalVideoTrack.
 */
export async function createCustomVideoTrack(
  constraints?: CustomVideoTrackInitConfig
): Promise<LocalVideoTrack> {
  const stream = await media.getUserMedia({ video: constraints });
  return new LocalVideoTrack(stream);
}

/**
 * Creates custom audio track .
 *
 * @param constraints
 * @returns A Promise that resolves to a LocalAudioTrack.
 */
export async function createCustomAudioTrack(
  constraints?: CustomVideoTrackInitConfig
): Promise<LocalAudioTrack> {
  const stream = await media.getUserMedia({ audio: constraints });
  return new LocalAudioTrack(stream);
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
