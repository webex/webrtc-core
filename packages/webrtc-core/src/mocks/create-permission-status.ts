/* eslint-disable
  jsdoc/require-jsdoc,
  @typescript-eslint/no-empty-function,
  @typescript-eslint/no-unused-vars
*/

/**
 * Generate a Permission Status mock to be returned from the permissions `query()` function.
 *
 * @param name
 * @param state - PermissionState.
 * @returns PermissionStatus.
 */
export const createPermissionStatus = (state: PermissionState): PermissionStatus => ({
  name: 'string',
  state,
  onchange: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: (event: Event): boolean => true,
});
