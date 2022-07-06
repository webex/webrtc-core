/* eslint-disable no-console,@typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types */
/**
 * This is just a placeholder utility to centralize how we log to the console. We will ultimately
 * replace this with a better logging method in the future.
 */

/**
 * Method to log debug statements in console.
 *
 * @param args - Parameters for debug logging.
 * @returns Object.
 */
export const debug = (...args: any[]) => console.debug('[MEDIA CORE]', ...args);
/**
 * Method to log error statements in console.
 *
 * @param args - Parameters for error logging.
 * @returns Object.
 */
export const error = (...args: any[]) => console.error('[MEDIA CORE]', ...args);
/**
 * Method to log statements in console.
 *
 * @param args - Parameters for log statements.
 * @returns Object.
 */
export const log = (...args: any[]) => console.log('[MEDIA CORE]', ...args);
/**
 * Method to log warn statements in console.
 *
 * @param args - Parameters for warn logging.
 * @returns Object.
 */
export const warn = (...args: any[]) => console.warn('[MEDIA CORE]', ...args);
