import { EffectEvent } from '@webex/web-media-effects';
import { getUserMedia } from '.';
import { logger } from '../util/logger';
import { StreamEventNames } from './stream';
import { LocalStream, LocalStreamEventNames, TrackEffect } from './local-stream';

// Audio constraints that can be applied via applyConstraints.
export type AppliableAudioConstraints = Pick<
  MediaTrackConstraints,
  | 'autoGainControl'
  | 'echoCancellation'
  | 'noiseSuppression'
  | 'sampleRate'
  | 'sampleSize'
  | 'channelCount'
>;

/**
 * Keep only the keys the browser recognizes as valid getUserMedia constraints.
 *
 * @param settings - Current track settings.
 * @returns Filtered settings safe for getUserMedia.
 */
const filterToSupportedConstraints = (settings: MediaTrackSettings): MediaTrackConstraints => {
  const supported = navigator.mediaDevices?.getSupportedConstraints?.() ?? {};
  return Object.fromEntries(
    Object.entries(settings).filter(
      ([key]) => supported[key as keyof MediaTrackSupportedConstraints]
    )
  );
};

/**
 * An audio LocalStream.
 */
export class LocalAudioStream extends LocalStream {
  /**
   * @inheritdoc
   */
  async addEffect(effect: TrackEffect): Promise<void> {
    if (this.effects.some((e) => e.id === effect.id)) {
      return;
    }
    await super.addEffect(effect);
    this.addConstraintHandlers(effect);
  }

  /**
   * Apply constraints to the existing input track.
   *
   * Note: on Chrome, `applyConstraints` silently ignores `autoGainControl`,
   * `echoCancellation`, and `noiseSuppression` — the promise resolves but the
   * value stays unchanged. To change those reliably, use an effect that emits
   * {@link EffectEvent.ConstraintsRequired}.
   * See https://issues.chromium.org/issues/40555809.
   *
   * @param constraints - The constraints to apply.
   * @returns Resolves when the browser finishes processing the request.
   */
  async applyConstraints(constraints?: AppliableAudioConstraints): Promise<void> {
    logger.log(`Applying constraints to local track:`, constraints);
    return this.inputTrack.applyConstraints(constraints).then(() => {
      this[LocalStreamEventNames.ConstraintsChange].emit();
    });
  }

  /**
   * Listen for constraint events from an audio effect and re-acquire the mic
   * track via getUserMedia when needed. Restores original settings when the
   * effect releases its constraints.
   *
   * This is a workaround for Chrome ignoring `applyConstraints` on audio
   * processing properties: https://issues.chromium.org/issues/40555809.
   *
   * @param effect - The effect to listen to.
   */
  private addConstraintHandlers(effect: TrackEffect): void {
    let savedTrackSettings: MediaTrackSettings = {};

    /**
     * Replace the current mic track with a new one obtained via getUserMedia,
     * applying the given constraints on top of the current settings.
     *
     * @param constraintsToApply - Constraints to merge into the current settings.
     * @returns Whether constraints were applied (or already satisfied).
     */
    const reacquireInputTrack = async (
      constraintsToApply: MediaTrackConstraints
    ): Promise<boolean> => {
      if (!this.effects.includes(effect)) {
        logger.log(`Effect ${effect.id} is no longer active, skipping constraint handling.`);
        return false;
      }

      if (this.inputTrack.readyState === 'ended') {
        logger.log(`Track already ended, ignoring constraints change.`);
        return false;
      }

      const currentTrack = this.inputTrack;
      const currentSettings = currentTrack.getSettings();

      const isAlreadySatisfied = Object.entries(constraintsToApply).every(
        ([key, value]) => currentSettings[key as keyof MediaTrackSettings] === value
      );
      if (isAlreadySatisfied) {
        logger.log(`Constraints already satisfied, skipping re-acquisition.`);
        return true;
      }

      const deviceId = currentSettings.deviceId ? { exact: currentSettings.deviceId } : undefined;
      const baselineConstraints = filterToSupportedConstraints(currentSettings);

      try {
        this.removeTrackHandlers(currentTrack);
        currentTrack.stop();

        const newStream = await getUserMedia({
          audio: { ...baselineConstraints, ...constraintsToApply, deviceId },
        });

        const [newTrack] = newStream.getAudioTracks();
        if (!newTrack) {
          throw new Error('getUserMedia returned a stream with no audio tracks.');
        }

        if (!this.effects.includes(effect)) {
          newTrack.stop();
          logger.log(`Effect was disposed during getUserMedia, emitting Ended.`);
          this[StreamEventNames.Ended].emit();
          return false;
        }

        newTrack.enabled = currentTrack.enabled;

        try {
          await effect.replaceInputTrack(newTrack);
        } catch (wireErr) {
          newTrack.stop();
          throw wireErr;
        }

        this.inputStream.removeTrack(currentTrack);
        this.inputStream.addTrack(newTrack);
        this.addTrackHandlers(newTrack);

        this[LocalStreamEventNames.ConstraintsChange].emit();
        logger.log(
          `Constraints applied via track re-acquisition. Settings:`,
          newTrack.getSettings()
        );
        return true;
      } catch (err: unknown) {
        if (!this.effects.includes(effect)) {
          return false;
        }

        logger.error(`Track re-acquisition failed, stream ended:`, err);
        this.loadingEffects.clear();
        const effectsToDispose = this.effects;
        this.effects = [];
        await Promise.all(
          effectsToDispose.map((e) =>
            e.dispose().catch((disposeErr) => {
              logger.error(`Failed to dispose effect after stream ended:`, disposeErr);
            })
          )
        );
        this[StreamEventNames.Ended].emit();
        return false;
      }
    };

    /**
     * Called when the effect needs specific audio constraints. Saves the
     * current values (so they can be restored later) and re-acquires the track.
     * Only saves each key once — later events won't overwrite the original baseline.
     *
     * @param constraints - The constraints the effect needs.
     */
    const handleConstraintsRequired = async (constraints: MediaTrackConstraints): Promise<void> => {
      logger.log(`Effect ${effect.id} constraints required:`, constraints);

      const currentSettings = this.inputTrack.getSettings();
      /**
       * Save a single setting if not already saved.
       *
       * @param key - The setting key to save.
       */
      const snapshot = <K extends keyof MediaTrackSettings>(key: K): void => {
        if (!(key in savedTrackSettings) && key in currentSettings) {
          savedTrackSettings[key] = currentSettings[key];
        }
      };
      (Object.keys(constraints) as Array<keyof MediaTrackSettings>).forEach(snapshot);

      await reacquireInputTrack(constraints);
    };

    /**
     * Called when the effect no longer needs its constraints.
     * Restores the settings that were saved by handleConstraintsRequired.
     */
    const handleConstraintsReleased = async (): Promise<void> => {
      logger.log(`Effect ${effect.id} constraints released.`);

      if (!Object.keys(savedTrackSettings).length) {
        logger.log(`No settings to restore, skipping re-acquisition.`);
        return;
      }

      const toRestore = { ...savedTrackSettings };
      const restored = await reacquireInputTrack(toRestore);
      if (restored) {
        savedTrackSettings = {};
      }
    };

    /**
     * Remove constraint listeners when the effect is disposed.
     * The base class handles its own listener cleanup separately.
     */
    const removeConstraintHandlers = () => {
      effect.off('constraints-required' as EffectEvent, handleConstraintsRequired as never);
      effect.off('constraints-released' as EffectEvent, handleConstraintsReleased as never);
      effect.off('disposed' as EffectEvent, removeConstraintHandlers as never);
    };
    effect.on('constraints-required' as EffectEvent, handleConstraintsRequired as never);
    effect.on('constraints-released' as EffectEvent, handleConstraintsReleased as never);
    effect.on('disposed' as EffectEvent, removeConstraintHandlers as never);
  }
}
