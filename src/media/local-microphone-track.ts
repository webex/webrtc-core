import { LocalTrack, TrackEvents } from './local-track';

export enum MicEvents {
  SomeMicEvent = 'SomeMicEvent',
}

export interface MicrophoneEvents extends TrackEvents {
  [MicEvents.SomeMicEvent]: (event: string) => void;
}

/**
 * Represents a local track for a microphone source.
 */
export class LocalMicrophoneTrack<T extends MicrophoneEvents> extends LocalTrack<T> {}
