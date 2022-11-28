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

  isPlaying: boolean;

  ID: string;

  status: TrackStatus;

  label: string;

  #mediaStreamTrack: MediaStreamTrack;

  #mediaStreamTrackWithEffect: MediaStreamTrack;

  /**
   * Constructor for the Track class. Creates an empty CoreLocalTrack or uses an existing one.
   *
   * @param stream - The MediaStream for this LocalTrack.
   * @param track
   */
  constructor(track: MediaStreamTrack) {
    super();
    /**
     * Emit ended event when the underlying track ends.
     */
    this.ID = track.id;
    this.status = track.readyState as TrackStatus;
    this.label = track.label;
    this.#mediaStreamTrack = track;
    this.#mediaStreamTrackWithEffect = track;
    this.isPlaying = false;
    /**
     *
     */
    this.#mediaStreamTrack.onended = () => {
      this.emit(Events.Ended, { trackState: this.trackState });
    };

    /**
     *
     */
    this.#mediaStreamTrack.onmute = () => {
      // using arrow function which should bind to this from outer scope track
      const action = this.#mediaStreamTrack.enabled ? 'muted' : 'unmuted';
      // TODO:  Move this logic else where

      this.emit('track:mute', {
        action,
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
  getMediaStreamTrackWithEffects(): MediaStreamTrack {
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

  /**
   *
   * @param element - Either pass the ID for the dom element where we need to attach the video tag
   * pass the video element dom element where we need to attach the stream.
   */

  /**
   * @param element
   */
  play(element?: string | Element): void {
    if (element instanceof Element) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      element.srcObject = new MediaStream([this.#mediaStreamTrack]);
      this.isPlaying = true;
    } else {
      const audioElement = document.createElement('audio');
      audioElement.srcObject = new MediaStream([this.#mediaStreamTrack]);
      audioElement.play();
    }
  }
}
