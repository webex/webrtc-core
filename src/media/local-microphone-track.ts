import { LocalVideoTrack } from './local-video-track';

/**
 * Represents a local track for a microphone source.
 */
export class LocalMicrophoneTrack extends LocalVideoTrack {}

/**
 * A class to map audio quality with audio constraints.
 */
export const staticAudioEncoderConfig = {
  speech_standard: { sampleRate: 32000, bitrate: 24000 },

  music_standard: { sampleRate: 48000, bitrate: 40000 },

  high_quality: { sampleRate: 48000, bitrate: 128000 },
};
