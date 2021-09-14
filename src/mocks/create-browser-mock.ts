import { MaybeMockedDeep, mocked } from './mock';

/**
 * Creates an instance of the mocked Browser item and attaches it to the window.
 *
 * @param stub - The stub Class or Object.
 * @param windowProperty - The property on window on which to attach the stub.
 * @returns Mocked instance of the Navigator stub.
 */
export const createBrowserMock = <T>(stub: T, windowProperty: string): MaybeMockedDeep<T> => {
  const mockedStub = mocked(stub, true);

  Object.defineProperty(window, windowProperty, { value: mockedStub });

  return mockedStub;
};
