/* eslint-disable no-underscore-dangle */
import { EventMap } from '../event-emitter';
import { logger } from '../util/logger';
import { Events, Track, TrackState, TrackMuteEvent, TrackEndEvent } from './track';

export type TrackPublishEvent = {
  isPublished: boolean;
  trackState: TrackState;
};

export interface LocalTrackEvents extends EventMap {
  [Events.PublishedStateUpdate]: (event: TrackPublishEvent) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TrackEffect = any;
// TBD: Fix this once types are published separately
// export type TrackEffect = BaseMicrophoneEffect | BaseCameraEffect;

/**
 * Local track manages effects which gets extended by video and audio.
 */
export abstract class LocalTrack extends Track {
  private isPublished = false;

  private effects: Map<string, TrackEffect> = new Map();

  /**
   * Get an effect by name.
   *
   * @param name - The effect name.
   * @returns A MicrophoneEffect.
   */
  getEffect(name: string): TrackEffect | undefined {
    const effect = this.effects.get(name);

    if (!effect) {
      logger.log(`No effect found with name '${name}'`);
    }

    return effect;
  }

  /**
   * Adds an effect to a local track.
   *
   * @param name - The name of the effect.
   * @param effect - The effect to add.
   */
  async addEffect(name: string, effect: TrackEffect): Promise<void> {
    await effect.load(new MediaStream([this.getMediaStreamTrack()]));
    this.setMediaStreamTrackWithEffects(
      this.kind === 'audio'
        ? effect.getUnderlyingStream().getAudioTracks()[0]
        : effect.getUnderlyingStream().getVideoTracks()[0]
    );
    this.effects.set(name, effect);
  }

  /**
   * Disposes the effect already applied .
   */
  disposeEffects(): void {
    if (this.effects.size > 0) {
      this.effects.forEach((effect: TrackEffect) => effect.dispose());
      this.effects.clear();

      // TODO: on dispose restore the track and trigger trackChange event
    }
  }

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
