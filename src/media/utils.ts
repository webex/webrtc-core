import { MicrophoneConstraints } from './local-audio-track';
import { VideoConstraints } from './local-video-track';

// For reference https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
/**
 * Generates the audio constraints pass to getUserMedia.
 *
 * @param audioConstraints - Audio constraints.
 * @returns Native audio constraints.
 */
export const generateAudioConstraints = (
  audioConstraints?: MicrophoneConstraints
): MediaTrackConstraints => {
  let audio: MediaTrackConstraints = {};
  if (audioConstraints?.microphoneDeviceId) {
    audio.deviceId = audioConstraints.microphoneDeviceId;
  }
  if (audioConstraints?.echoCancellation) {
    audio.echoCancellation = audioConstraints.echoCancellation;
  }

  if (audioConstraints?.noiseSuppression) {
    audio.noiseSuppression = audioConstraints.noiseSuppression;
  }

  if (audioConstraints?.autoGainControl) {
    audio.autoGainControl = audioConstraints.autoGainControl;
  }

  if (audioConstraints?.encoderConfig) {
    audio = { ...audio, ...audioConstraints.encoderConfig };
  }
  return audio;
};

/**
 * Generates the audio constraints pass to getUserMedia.
 *
 * @param videoConstraints - Video constraints.
 * @returns Native video constraints.
 */
export const generateVideoConstraints = (
  videoConstraints?: VideoConstraints
): MediaTrackConstraints => {
  let video: MediaTrackConstraints = {};
  if (videoConstraints?.cameraDeviceId) {
    video.deviceId = videoConstraints.cameraDeviceId;
  }
  if (videoConstraints?.facingMode) {
    video.facingMode = videoConstraints.facingMode;
  }
  if (videoConstraints?.encoderConfig) {
    video = { ...video, ...videoConstraints.encoderConfig };
  }
  return video;
};
