import { EffectEvent } from '@webex/web-media-effects';
import { getUserMedia } from '.';
import { logger } from '../util/logger';
import { StreamEventNames } from './stream';
import { LocalStream, LocalStreamEventNames, TrackEffect } from './local-stream';

// These are the audio constraints that can be applied via applyConstraints.
export type AppliableAudioConstraints = Pick<
  MediaTrackConstraints,
  'autoGainControl' | 'echoCancellation' | 'noiseSuppression'
>;

/**
 * An audio LocalStream.
 */
export class LocalAudioStream extends LocalStream {
  /**
   * @inheritdoc
   */
  async addEffect(effect: TrackEffect): Promise<void> {
    await super.addEffect(effect);
    this.addConstraintHandlers(effect);
  }

  /**
   * Apply constraints to the stream.
   *
   * @param constraints - The constraints to apply.
   * @returns A promise which resolves when the constraints have been successfully applied.
   */
  async applyConstraints(constraints?: AppliableAudioConstraints): Promise<void> {
    logger.log(`Applying constraints to local track:`, constraints);
    return this.inputTrack.applyConstraints(constraints).then(() => {
      this[LocalStreamEventNames.ConstraintsChange].emit();
    });
  }

  /**
   * Wire constraint event handlers for an audio effect. When the effect emits
   * {@link EffectEvent.ConstraintsRequired}, the input track is re-acquired via
   * getUserMedia with the requested settings. When the effect emits
   * {@link EffectEvent.ConstraintsReleased}, the original settings are restored.
   *
   * Re-acquisition is needed because Chrome ignores applyConstraints for audio
   * processing properties (https://issues.chromium.org/issues/40555809).
   *
   * @param effect - The effect to add handlers for.
   */
  private addConstraintHandlers(effect: TrackEffect): void {
    let savedTrackSettings: MediaTrackSettings = {};

    /**
     * Re-acquire the audio input track with the given constraints via
     * getUserMedia, since Chrome ignores applyConstraints for audio
     * processing properties.
     *
     * @param constraintsToApply - The constraints to apply to the new track.
     */
    const reacquireInputTrack = async (
      constraintsToApply: MediaTrackConstraints
    ): Promise<void> => {
      if (!this.effects.includes(effect)) {
        logger.log(`Effect ${effect.id} was replaced or disposed, skipping constraint handling.`);
        return;
      }

      if (this.inputTrack.readyState === 'ended') {
        logger.log(`Track already ended, ignoring constraints change.`);
        return;
      }

      const currentTrack = this.inputTrack;
      const currentSettings = currentTrack.getSettings();
      const isEnabled = currentTrack.enabled;

      const isAlreadySatisfied = Object.entries(constraintsToApply).every(
        ([key, value]) => currentSettings[key as keyof MediaTrackSettings] === value
      );
      if (isAlreadySatisfied) {
        logger.log(`Constraints already satisfied, skipping re-acquisition.`);
        return;
      }

      try {
        const deviceId = currentSettings.deviceId ? { exact: currentSettings.deviceId } : undefined;

        let newStream = await getUserMedia({
          audio: { ...currentSettings, ...constraintsToApply, deviceId },
        }).catch((err) => {
          logger.warn(`Failed to re-acquire track with effect constraints, recovering:`, err);
          return null;
        });

        if (!newStream) {
          newStream = await getUserMedia({
            audio: { ...currentSettings, deviceId },
          });
          savedTrackSettings = {};
        }

        const [newTrack] = newStream.getAudioTracks();

        // Skip if the effect or stream became inactive while
        // getUserMedia was pending (e.g. effect replaced, user hung up).
        if (!this.effects.includes(effect) || currentTrack.readyState === 'ended') {
          newTrack.stop();
          savedTrackSettings = {};
          logger.log(`Effect was disposed during track re-acquisition, discarding new track.`);
          return;
        }

        // Stop the old track only after we confirmed the effect is still
        // active and the replacement track is ready.
        this.removeTrackHandlers(currentTrack);
        currentTrack.stop();

        newTrack.enabled = isEnabled;
        this.inputStream.removeTrack(currentTrack);
        this.inputStream.addTrack(newTrack);
        this.addTrackHandlers(newTrack);

        if (this.effects.length > 0) {
          await this.effects[0].replaceInputTrack(newTrack);
        }
        this[LocalStreamEventNames.ConstraintsChange].emit();
        logger.log(`Constraints applied via track re-acquisition.`);
      } catch (err: unknown) {
        savedTrackSettings = {};

        if (!this.effects.includes(effect)) {
          logger.log(`Effect was disposed during constraint handling, ignoring error.`);
          return;
        }

        if (this.inputTrack.readyState === 'live') {
          this.changeOutputTrack(this.inputTrack);
          logger.warn(`Effect wiring failed, continuing with raw mic track:`, err);
        } else {
          logger.error(`Failed to re-acquire mic track, stream ended:`, err);
          this[StreamEventNames.Ended].emit();
        }
      }
    };

    /**
     * Handle when an audio effect requests specific constraints on the input
     * track. Saves the current values for the requested properties so they can
     * be restored later, then re-acquires the track with the new constraints.
     *
     * @param constraints - The constraints requested by the effect.
     */
    const handleConstraintsRequired = async (constraints: MediaTrackConstraints): Promise<void> => {
      logger.log(`Effect ${effect.id} constraints required:`, constraints);

      const currentSettings = this.inputTrack.getSettings();
      Object.keys(constraints).forEach((key) => {
        if (!(key in savedTrackSettings)) {
          Object.assign(savedTrackSettings, {
            [key]: currentSettings[key as keyof MediaTrackSettings],
          });
        }
      });

      await reacquireInputTrack(constraints);
    };

    /**
     * Handle when an audio effect releases its constraint requirements.
     * Restores the previously saved track settings.
     */
    const handleConstraintsReleased = async (): Promise<void> => {
      logger.log(`Effect ${effect.id} constraints released.`);

      if (!Object.keys(savedTrackSettings).length) {
        logger.log(`No settings to restore, skipping re-acquisition.`);
        return;
      }

      const toRestore = { ...savedTrackSettings };
      savedTrackSettings = {};
      await reacquireInputTrack(toRestore);
    };

    /**
     * Remove constraint listeners when the effect is disposed.
     * The base class handles its own listener cleanup separately.
     */
    const removeConstraintHandlers = () => {
      effect.off('constraints-required' as EffectEvent, handleConstraintsRequired);
      effect.off('constraints-released' as EffectEvent, handleConstraintsReleased);
      effect.off('disposed' as EffectEvent, removeConstraintHandlers);
    };

    effect.on('constraints-required' as EffectEvent, handleConstraintsRequired);
    effect.on('constraints-released' as EffectEvent, handleConstraintsReleased);
    effect.on('disposed' as EffectEvent, removeConstraintHandlers);
  }
}
