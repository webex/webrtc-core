/**
 * Test stub for navigator.mediaDevices.getSupportedConstraints. Lives in its
 * own module so specs can use it without importing navigator-stub, which
 * replaces window.navigator as a side effect.
 *
 * @returns A stub where every constraint reports as supported.
 */
export const getSupportedConstraints = (): MediaTrackSupportedConstraints => ({
  aspectRatio: true,
  autoGainControl: true,
  channelCount: true,
  deviceId: true,
  echoCancellation: true,
  facingMode: true,
  frameRate: true,
  groupId: true,
  height: true,
  noiseSuppression: true,
  sampleRate: true,
  sampleSize: true,
  width: true,
});
