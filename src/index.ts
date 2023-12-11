// Note: This (importing and then exporting media) is a workaround for doc extraction, which doesn't
// support 'export * as ___ from ___' yet.
import * as media from './media';

export * from './device/device-management';
export * from './errors';
export * from './media/local-audio-stream';
export * from './media/local-camera-stream';
export * from './media/local-display-stream';
export * from './media/local-microphone-stream';
export * from './media/local-stream';
export * from './media/local-system-audio-stream';
export * from './media/local-video-stream';
export * from './media/remote-stream';
export * from './media/stream';
export * from './peer-connection';
export * from './peer-connection-utils';
export * from './util/logger';
export { media };
