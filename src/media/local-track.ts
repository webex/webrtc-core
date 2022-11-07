/* eslint-disable no-underscore-dangle */
import { EventMap } from 'typed-emitter';
import { MediaStreamTrackKind } from '../peer-connection';
import { logger } from '../util/logger';
import { Events, Track } from './track';

export interface TrackState {
  id: string;
  label: string;
  type: MediaStreamTrackKind;
  muted: boolean;
}

export type TrackEndEvent = {
  trackState: TrackState;
};

export type TrackMuteEvent = {
  trackState: TrackState;
};

export type TrackPublishEvent = {
  isPublished: boolean;
  trackState: TrackState;
};

export interface LocalTrackEvents extends EventMap {
  [Events.PublishedStateUpdate]: (event: TrackPublishEvent) => void;
}

/**
 * Basic Track class. Wrapper for LocalTrack from 'webrtc-core'.
 */
export abstract class LocalTrack extends Track {
  private isPublished = false;

  /**
   * Get published state of this track.
   *
   * @returns The published state of this track.
   */
  get published(): boolean {
    return this.isPublished;
  }

  /**
   * Set the published state of this LocalTrack.
   *
   * @param isPublished - True if this track has been published, false otherwise.
   * @fires LocalTrackEvents.PublishedStateUpdate
   */
  setPublished(isPublished: boolean): void {
    if (this.isPublished !== isPublished) {
      this.isPublished = isPublished;
      this.emit(Events.PublishedStateUpdate, {
        trackState: this.trackState,
        isPublished,
      });
      logger.log(`Local track ${isPublished ? 'published' : 'unpublished'}:`, {
        trackState: this.trackState,
      });
    }
  }
}
