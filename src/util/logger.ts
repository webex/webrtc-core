/**
 * This is just a placeholder utility to centralize how we log to the console. We will ultimately
 * replace this with a better logging method in the future.
 */

/**
 * @param args
 */
export const debug = (...args: any[]) => console.debug('[MEDIA CORE]', ...args);
/**
 * @param args
 */
export const error = (...args: any[]) => console.error('[MEDIA CORE]', ...args);
/**
 * @param args
 */
export const log = (...args: any[]) => console.log('[MEDIA CORE]', ...args);
/**
 * @param args
 */
export const warn = (...args: any[]) => console.warn('[MEDIA CORE]', ...args);
