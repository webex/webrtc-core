/* eslint-disable no-underscore-dangle */
import { EventMap } from 'typed-emitter';
import { EventEmitter } from '../event-emitter';
import { logger } from '../util/logger';

export enum Events {
  Ended = 'ended',
  Muted = 'muted',
  /**
   * Fires when the published state of a LocalTrack changes.  A value of 'true' indicates the
   * track has been published, and 'false' indicates that it is no longer published.  Tracks are
   * unpublished by default, and must be published explicitly (no event will be fired to indicate
   * the initial state of 'unpublished').
   */
  PublishedStateUpdate = 'published-state-update',
  /**
   * Fires when there has been a change in the underlying track.
   */
  UnderlyingTrackChange = 'underlying-track-change',
}

export interface TrackState {
  id: string;
  label: string;
  muted: boolean;
}

export type TrackEndEvent = {
  trackState: TrackState;
};

export type TrackMuteEvent = {
  trackState: TrackState;
};
// eslint-disable-next-line no-shadow
export enum TrackStatus {
  ENDED = 'ended',
  LIVE = 'live',
}

// eslint-disable-next-line no-shadow
export enum TrackKind {
  AUDIO = 'audio',
  VIDEO = 'video',
}

export type TrackPublishEvent = {
  isPublished: boolean;
  trackState: TrackState;
};

export interface TrackEvents extends EventMap {
  [Events.Ended]: (event: TrackEndEvent) => void;
  [Events.Muted]: (event: TrackMuteEvent) => void;
  [Events.PublishedStateUpdate]: (event: TrackPublishEvent) => void;
  [Events.UnderlyingTrackChange]: () => void;
}

export type TrackEffect = any;
// TBD: Fix this once types are published seperatly
// export type TrackEffect = BaseMicrophoneEffect | BaseCameraEffect;

/**
 * Basic Track class. Wrapper for LocalTrack from 'webrtc-core'.
 */
export abstract class Track extends EventEmitter<TrackEvents> {
  static Events = Events;

  ID: string;

  kind: string;

  status: TrackStatus;

  label: string;

  #mediaStreamTrack: MediaStreamTrack;

  #mediaStreamTrackWithEffect?: MediaStreamTrack;

  /**
   * Constructor for the Track class. Creates an empty CoreLocalTrack or uses an existing one.
   *
   * @param stream - The MediaStream for this LocalTrack.
   * @param track
   */
  constructor(track: MediaStreamTrack) {
    super();
    this.ID = track.id;
    this.status = track.readyState as TrackStatus;
    this.label = track.label;
    this.kind = track.kind;
    this.#mediaStreamTrack = track;

    /**
     * Emit ended event when the underlying track ends.
     */
    this.#mediaStreamTrack.onended = () => {
      this.emit(Events.Ended, { trackState: this.trackState });
    };

    /**
     * Emit mute event when the underlying track gets muted.
     */
    this.#mediaStreamTrack.onmute = () => {
      this.emit(Events.Muted, {
        trackState: {
          id: 'string',
          label: 'string',
          muted: this.#mediaStreamTrack.enabled,
        },
      });
    };
  }

  /**
   * Get id of this track.
   *
   * @returns The id of this track.
   */
  get id(): string {
    return this.#mediaStreamTrack.id;
  }

  /**
   * Get muted state of this track.
   *
   * @returns The muted state of this track.
   */
  get muted(): boolean {
    return !this.#mediaStreamTrack.enabled;
  }

  /**
   * Get current state of this track.
   *
   * @returns Current state of this track.
   */
  get trackState(): TrackState {
    return { id: this.id, label: this.label, muted: this.muted };
  }

  /**
   * Set the mute state of this track.
   *
   * @param muted - True to mute, false to unmute.
   * @fires Events.Muted
   */
  setMuted(muted: boolean): void {
    // Only change state if it's different, where "enabled" means "unmuted."
    if (this.#mediaStreamTrack.enabled === muted) {
      this.#mediaStreamTrack.enabled = !muted;
      this.emit(Events.Muted, { trackState: this.trackState });
      logger.log(`Local track ${muted ? 'muted' : 'unmuted'}:`, { trackState: this.trackState });
    }
  }

  /**
   *
   * This method returns the actual MediaStreamTrack.
   *
   * @returns #mediaStreamTrack of type MediaStreamTrack.
   */
  getMediaStreamTrack(): MediaStreamTrack {
    return this.#mediaStreamTrack;
  }

  /**
   *
   * This method returns track after applying effects.
   *
   * @returns #mediaStreamTrack of type MediaStreamTrack.
   */
  getMediaStreamTrackWithEffects(): MediaStreamTrack | undefined {
    return this.#mediaStreamTrackWithEffect;
  }

  /**
   *
   * This method sets the track after applying effect.
   *
   * @param track
   * @returns #mediaStreamTrack of type MediaStreamTrack.
   */
  setMediaStreamTrackWithEffects(track: MediaStreamTrack): void {
    this.#mediaStreamTrackWithEffect = track;
    this.emit(Events.UnderlyingTrackChange);
  }

  /**
   * Stop this track.
   *
   * @fires Events.Ended
   */
  stop(): void {
    this.#mediaStreamTrack.stop();
    this.emit(Events.Ended, { trackState: this.trackState });
    logger.log(`Local track stopped:`, { trackState: this.trackState });
  }
}
