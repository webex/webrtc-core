import { WebrtcCoreError, WebrtcCoreErrorType } from '../errors';
import * as media from '../media';
import { CaptureController } from '../media';
import { LocalCameraStream } from '../media/local-camera-stream';
import { LocalDisplayStream } from '../media/local-display-stream';
import { LocalMicrophoneStream } from '../media/local-microphone-stream';
import { LocalSystemAudioStream } from '../media/local-system-audio-stream';
import { VideoContentHint } from '../media/local-video-stream';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

export type AudioDeviceConstraints = Pick<
  MediaTrackConstraints,
  | 'autoGainControl'
  | 'channelCount'
  | 'deviceId'
  | 'echoCancellation'
  | 'noiseSuppression'
  | 'sampleRate'
  | 'sampleSize'
>;

export type VideoDeviceConstraints = Pick<
  MediaTrackConstraints,
  'aspectRatio' | 'deviceId' | 'facingMode' | 'frameRate' | 'height' | 'width'
>;

/**
 * Creates a camera stream. Please note that the constraint params in second getUserMedia call would NOT take effect when:
 *
 * 1. Previous captured video stream from the same device is not stopped.
 * 2. Previous createCameraStream() call for the same device is in progress.
 *
 * @param cameraStreamConstructor - Constructor for the local camera stream.
 * @param constraints - Video device constraints.
 * @returns A LocalCameraStream object or an error.
 */
export async function createCameraStream<T extends LocalCameraStream>(
  cameraStreamConstructor: Constructor<T>,
  constraints?: VideoDeviceConstraints
): Promise<T> {
  let stream: MediaStream;
  try {
    stream = await media.getUserMedia({ video: { ...constraints } });
  } catch (error) {
    throw new WebrtcCoreError(
      WebrtcCoreErrorType.CREATE_STREAM_FAILED,
      `Failed to create camera stream: ${error}`
    );
  }
  // eslint-disable-next-line new-cap
  return new cameraStreamConstructor(stream);
}

/**
 * Creates a LocalMicrophoneStream with the given constraints.
 *
 * @param microphoneStreamConstructor - Constructor for the local microphone stream.
 * @param constraints - Audio device constraints.
 * @returns A LocalMicrophoneStream object or an error.
 */
export async function createMicrophoneStream<T extends LocalMicrophoneStream>(
  microphoneStreamConstructor: Constructor<T>,
  constraints?: AudioDeviceConstraints
): Promise<T> {
  let stream: MediaStream;
  try {
    stream = await media.getUserMedia({ audio: { ...constraints } });
  } catch (error) {
    throw new WebrtcCoreError(
      WebrtcCoreErrorType.CREATE_STREAM_FAILED,
      `Failed to create microphone stream: ${error}`
    );
  }
  // eslint-disable-next-line new-cap
  return new microphoneStreamConstructor(stream);
}

/**
 * Creates a LocalCameraStream and a LocalMicrophoneStream with the given constraints.
 *
 * @param cameraStreamConstructor - Constructor for the local camera stream.
 * @param microphoneStreamConstructor - Constructor for the local microphone stream.
 * @param constraints - Object containing video and audio device constraints.
 * @param constraints.video - Video device constraints.
 * @param constraints.audio - Audio device constraints.
 * @returns A Promise that resolves to a LocalCameraStream and a LocalMicrophoneStream or an error.
 */
export async function createCameraAndMicrophoneStreams<
  T extends LocalCameraStream,
  U extends LocalMicrophoneStream
>(
  cameraStreamConstructor: Constructor<T>,
  microphoneStreamConstructor: Constructor<U>,
  constraints?: { video?: VideoDeviceConstraints; audio?: AudioDeviceConstraints }
): Promise<[T, U]> {
  let stream;
  try {
    stream = await media.getUserMedia({
      video: { ...constraints?.video },
      audio: { ...constraints?.audio },
    });
  } catch (error) {
    throw new WebrtcCoreError(
      WebrtcCoreErrorType.CREATE_STREAM_FAILED,
      `Failed to create camera and microphone streams: ${error}`
    );
  }
  // eslint-disable-next-line new-cap
  const localCameraStream = new cameraStreamConstructor(new MediaStream(stream.getVideoTracks()));
  // eslint-disable-next-line new-cap
  const localMicrophoneStream = new microphoneStreamConstructor(
    new MediaStream(stream.getAudioTracks())
  );
  return [localCameraStream, localMicrophoneStream];
}

/**
 * Creates a LocalDisplayStream and a LocalSystemAudioStream with the given parameters.
 *
 * This is a more advanced version of createDisplayStreamWithAudio that allows the user to specify
 * additional display media options and constraints.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia#options.
 *
 * @param options - An object containing the options for creating the display and system audio streams.
 * @param options.video - An object containing the video stream options.
 * @param options.video.displayStreamConstructor - Constructor for the local display stream.
 * @param options.video.constraints - Video device constraints.
 * @param options.video.videoContentHint - A hint for the content of the stream.
 * @param options.video.preferCurrentTab - Whether to offer the current tab as the most prominent capture source.
 * @param options.video.selfBrowserSurface - Whether to allow the user to select the current tab for capture.
 * @param options.video.surfaceSwitching - Whether to allow the user to dynamically switch the shared tab during screen-sharing.
 * @param options.video.monitorTypeSurfaces - Whether to offer the user the option to choose display surfaces whose type is monitor.
 * @param options.audio - An object containing the audio stream options. If present, a system audio stream will be created.
 * @param options.audio.systemAudioStreamConstructor - Constructor for the local system audio stream.
 * @param options.audio.constraints - Audio device constraints.
 * @param options.audio.systemAudio - Whether to include the system audio among the possible audio sources offered to the user.
 * @param options.controller - CaptureController to further manipulate the capture session.
 * @returns A Promise that resolves to a LocalDisplayStream and a LocalSystemAudioStream or an
 * error. If no system audio is available, the LocalSystemAudioStream will be resolved as null
 * instead.
 */
export async function createDisplayMedia<
  T extends LocalDisplayStream,
  U extends LocalSystemAudioStream
>(options: {
  video: {
    displayStreamConstructor: Constructor<T>;
    constraints?: VideoDeviceConstraints;
    videoContentHint?: VideoContentHint;
    preferCurrentTab?: boolean;
    selfBrowserSurface?: 'include' | 'exclude';
    surfaceSwitching?: 'include' | 'exclude';
    monitorTypeSurfaces?: 'include' | 'exclude';
  };
  audio?: {
    systemAudioStreamConstructor: Constructor<U>;
    constraints?: AudioDeviceConstraints;
    systemAudio?: 'include' | 'exclude';
  };
  controller?: CaptureController;
}): Promise<[T, U | null]> {
  let stream;
  const videoConstraints = options.video.constraints || true;
  const audioConstraints = options.audio?.constraints || !!options.audio;
  try {
    stream = await media.getDisplayMedia({
      video: videoConstraints,
      audio: audioConstraints,
      controller: options.controller,
      preferCurrentTab: options.video.preferCurrentTab,
      selfBrowserSurface: options.video.selfBrowserSurface,
      surfaceSwitching: options.video.surfaceSwitching,
      systemAudio: options.audio?.systemAudio,
      monitorTypeSurfaces: options.video.monitorTypeSurfaces,
    });
  } catch (error) {
    throw new WebrtcCoreError(
      WebrtcCoreErrorType.CREATE_STREAM_FAILED,
      `Failed to create display and/or system audio streams: ${error}`
    );
  }
  // eslint-disable-next-line new-cap
  const localDisplayStream = new options.video.displayStreamConstructor(
    new MediaStream(stream.getVideoTracks())
  );
  if (options.video.videoContentHint) {
    localDisplayStream.contentHint = options.video.videoContentHint;
  }
  let localSystemAudioStream = null;
  if (options.audio && stream.getAudioTracks().length > 0) {
    // eslint-disable-next-line new-cap
    localSystemAudioStream = new options.audio.systemAudioStreamConstructor(
      new MediaStream(stream.getAudioTracks())
    );
  }
  return [localDisplayStream, localSystemAudioStream];
}

/**
 * Creates a LocalDisplayStream with the given parameters.
 *
 * @param displayStreamConstructor - Constructor for the local display stream.
 * @param videoContentHint - An optional parameter to give a hint for the content of the stream.
 * @returns A Promise that resolves to a LocalDisplayStream or an error.
 */
export async function createDisplayStream<T extends LocalDisplayStream>(
  displayStreamConstructor: Constructor<T>,
  videoContentHint?: VideoContentHint
): Promise<T> {
  const [localDisplayStream] = await createDisplayMedia({
    video: { displayStreamConstructor, videoContentHint },
  });
  return localDisplayStream;
}

/**
 * Creates a LocalDisplayStream and a LocalSystemAudioStream with the given parameters.
 *
 * @param displayStreamConstructor - Constructor for the local display stream.
 * @param systemAudioStreamConstructor - Constructor for the local system audio stream.
 * @param videoContentHint - An optional parameter to give a hint for the content of the stream.
 * @returns A Promise that resolves to a LocalDisplayStream and a LocalSystemAudioStream or an
 * error. If no system audio is available, the LocalSystemAudioStream will be resolved as null
 * instead.
 */
export async function createDisplayStreamWithAudio<
  T extends LocalDisplayStream,
  U extends LocalSystemAudioStream
>(
  displayStreamConstructor: Constructor<T>,
  systemAudioStreamConstructor: Constructor<U>,
  videoContentHint?: VideoContentHint
): Promise<[T, U | null]> {
  return createDisplayMedia({
    video: { displayStreamConstructor, videoContentHint },
    audio: { systemAudioStreamConstructor },
  });
}

/**
 * Enumerates the media input and output devices available.
 *
 * @param deviceKind - Optional filter to return a specific device kind.
 * @returns List of media devices in an array of MediaDeviceInfo objects.
 */
export async function getDevices(deviceKind?: media.DeviceKind): Promise<MediaDeviceInfo[]> {
  let devices: MediaDeviceInfo[];
  const deviceKinds = deviceKind
    ? [deviceKind]
    : [media.DeviceKind.AudioInput, media.DeviceKind.VideoInput];

  try {
    devices = await media.ensureDevicePermissions(deviceKinds, media.enumerateDevices);
  } catch (error) {
    throw new WebrtcCoreError(
      WebrtcCoreErrorType.DEVICE_PERMISSION_DENIED,
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
