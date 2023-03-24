/* eslint-disable no-underscore-dangle */
import { EventEmitter, EventMap } from '../event-emitter';
import { MediaStreamTrackKind } from '../peer-connection';
import { logger } from '../util/logger';

export enum LocalTrackEvents {
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
  /**
   * Fires when the applyConstraints() has been called for the track.
   */
  TrackConstraintsChange = 'track-constraints-change',
}

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

export interface TrackEvents extends EventMap {
  [LocalTrackEvents.Ended]: (event: TrackEndEvent) => void;
  [LocalTrackEvents.Muted]: (event: TrackMuteEvent) => void;
  [LocalTrackEvents.PublishedStateUpdate]: (event: TrackPublishEvent) => void;
  [LocalTrackEvents.UnderlyingTrackChange]: () => void;
  [LocalTrackEvents.TrackConstraintsChange]: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TrackEffect = any;
// TBD: Fix this once types are published separately
// export type TrackEffect = BaseMicrophoneEffect | BaseCameraEffect;

/**
 * Basic Track class. Wrapper for LocalTrack from 'webrtc-core'.
 */
export abstract class LocalTrack<T extends TrackEvents> extends EventEmitter<T> {
  static Events = LocalTrackEvents;

  /**
   * The MediaStream that represents the current 'output' of this track.
   * If no effects have been added, this will be the original MediaStream;
   * if effects have been added, this will represent the output of the 'last'
   * effect in the pipeline.
   */
  private _underlyingStream!: MediaStream;

  /**
   * The MediaStream that was passed to the constructor.
   */
  private originalStream: MediaStream;

  private isPublished = false;

  private effects: Map<string, TrackEffect> = new Map();

  label: string;

  /**
   * Constructor for the Track class. Creates an empty CoreLocalTrack or uses an existing one.
   *
   * @param stream - The MediaStream for this LocalTrack.
   */
  constructor(stream: MediaStream) {
    super();
    this.originalStream = stream;
    this.underlyingStream = stream;
    // Effects create a new label but we want to retain the original one.
    this.label = this.underlyingStream.getTracks()[0].label;

    /**
     * Emit ended event when the underlying track ends.
     */
    this.underlyingTrack.onended = () => {
      this.emit(LocalTrackEvents.Ended, { trackState: this.trackState });
    };
  }

  /**
   * Get the kind of this track.
   * NOTE(brian): the need for this will likely go away once we get the rest of the track hierarchy
   * done, as we can use something like instanceof instead.
   *
   * @returns - The kind of this track, as a MediaStreamTrackKind.
   */
  get kind(): MediaStreamTrackKind {
    return this.underlyingTrack.kind as MediaStreamTrackKind;
  }

  /**
   * Get id of this track.
   *
   * @returns The id of this track.
   */
  get id(): string {
    return this.underlyingTrack.id;
  }

  /**
   * Get muted state of this track.
   *
   * @returns The muted state of this track.
   */
  get muted(): boolean {
    return !this.underlyingTrack.enabled;
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
   * Get the underlying MediaStream.
   *
   * @returns The underlying MediaStream.
   */
  get underlyingStream(): MediaStream {
    return this._underlyingStream;
  }

  /**
   * Set the underlying MediaStream.
   */
  set underlyingStream(stream: MediaStream) {
    this._underlyingStream = stream;
  }

  /**
   * Get current state of this track.
   *
   * @returns Current state of this track.
   */
  get trackState(): TrackState {
    return { id: this.id, label: this.label, type: this.kind, muted: this.muted };
  }

  /**
   * Get the underlying MediaStreamTrack.
   *
   * @returns The underlying MediaStreamTrack.
   */
  get underlyingTrack(): MediaStreamTrack {
    return this._underlyingStream.getTracks()[0];
  }

  /**
   * Get the original MediaStreamTrack. We retain a reference to the stream obtained through
   * `getUserMedia()` to ensure it's updated alongside the `underlyingStream`. These two streams may
   * be different if effects have been added to the original stream.
   *
   * @returns The original MediaStreamTrack.
   */
  private get originalTrack(): MediaStreamTrack {
    return this.originalStream.getTracks()[0];
  }

  /**
   * Set the mute state of this track.
   *
   * @param muted - True to mute, false to unmute.
   * @fires LocalTrackEvents.Muted
   */
  setMuted(muted: boolean): void {
    // Only change state if it's different, where "enabled" means "unmuted."
    if (this.underlyingTrack.enabled === muted) {
      this.originalTrack.enabled = !muted;
      this.underlyingTrack.enabled = !muted;
      this.emit(LocalTrackEvents.Muted, { trackState: this.trackState });
      logger.log(`Local track ${muted ? 'muted' : 'unmuted'}:`, { trackState: this.trackState });
    }
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
      this.emit(LocalTrackEvents.PublishedStateUpdate, {
        trackState: this.trackState,
        isPublished,
      });
      logger.log(`Local track ${isPublished ? 'published' : 'unpublished'}:`, {
        trackState: this.trackState,
      });
    }
  }

  /**
   * Stop this track.
   *
   * @fires LocalTrackEvents.Ended
   */
  stop(): void {
    this.originalTrack.stop();
    this.underlyingTrack.stop();
    this.emit(LocalTrackEvents.Ended, { trackState: this.trackState });
    logger.log(`Local track stopped:`, { trackState: this.trackState });
  }

  /**
   * Adds an effect to a local track.
   *
   * @param name - The name of the effect.
   * @param effect - The effect to add.
   */
  async addEffect(name: string, effect: TrackEffect): Promise<void> {
    await effect.load(this.underlyingStream);
    this.underlyingStream = effect.getUnderlyingStream();
    this.effects.set(name, effect);
    this.emit(LocalTrackEvents.UnderlyingTrackChange);
  }

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
   * Cleanup the local microphone track.
   */
  disposeEffects(): void {
    if (this.effects.size > 0) {
      this.effects.forEach((effect: TrackEffect) => effect.dispose());
      this.effects.clear();

      this.underlyingStream = this.originalStream;
      this.emit(LocalTrackEvents.UnderlyingTrackChange);
    }
  }

  /**
   * Apply constraints to the track.
   *
   * @param constraints - The constraints to apply to the track.
   * @returns A promise which resolves when the constraints have been successfully applied.
   */
  async applyConstraints(constraints?: MediaTrackConstraints): Promise<void> {
    logger.log(`Applying constraints to local track:`, constraints);
    const ret = this.underlyingTrack.applyConstraints(constraints).then(() => {
      this.emit(LocalTrackEvents.TrackConstraintsChange);
    });
    return ret;
  }

  /**
   * Get the current constraints of the track.
   *
   * @returns The constraints of the track.
   */
  getConstraints(): MediaTrackConstraints {
    return this.underlyingTrack.getConstraints();
  }

  /**
   * Get the current settings of the track.
   *
   * @returns The settings of the track.
   */
  getSettings(): MediaTrackSettings {
    return this.underlyingTrack.getSettings();
  }

  /**
   * Check the resolution and then return how many layers will be active.
   *
   * @returns The active layers count.
   */
  getNumActiveSimulcastLayers(): number {
    let activeSimulcastLayersNumber = 0;
    if (this.trackState.type === 'audio') {
      return activeSimulcastLayersNumber;
    }
    const videoHeight = this.underlyingTrack.getSettings().height;
    if ((videoHeight as number) <= 180) {
      activeSimulcastLayersNumber = 1;
    } else if ((videoHeight as number) <= 360) {
      activeSimulcastLayersNumber = 2;
    } else {
      activeSimulcastLayersNumber = 3;
    }
    return activeSimulcastLayersNumber;
  }
}
