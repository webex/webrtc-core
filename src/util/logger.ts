import Logger from 'js-logger';

const DEFAULT_LOGGER_NAME = 'webrtc-core';
export const logger = Logger.get(DEFAULT_LOGGER_NAME);

// Set log level to debug by default.
logger.setLevel(Logger.DEBUG);

// Export the Logger class so it can be used by other repositories.
export { Logger };
