import Logger from 'js-logger';

const DEFAULT_LOGGER_NAME = 'webrtc-core';
export const logger = Logger.get(DEFAULT_LOGGER_NAME);

Logger.useDefaults({
  defaultLevel: Logger.DEBUG,
  /* eslint-disable-next-line jsdoc/require-jsdoc */
  formatter: (messages, context) => {
    messages.unshift(`[${context.name}]`);
  },
});

// Export the Logger class so it can be used by other repositories.
export { Logger };
