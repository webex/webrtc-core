// Note: This (importing and then exporting media) is a workaround for doc extraction, which doesn't
// support 'export * as ___ from ___' yet.
import * as media from './media';

export * from './device/device-management';
export * from './media/local-camera-track';
export * from './media/local-display-track';
export * from './media/local-microphone-track';
export * from './media/local-system-audio-track';
export * from './media/local-track';
export * from './peer-connection';
export * from './peer-connection-utils';
export * from './util/logger';
export { media };
