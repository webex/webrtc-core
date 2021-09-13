/* eslint-disable */

// This file is mostly a copy of the testing.d.ts file in ts-jest (the 'mocked' functions are
// tweaked to add an actual implementation).  We were unable to get the 'mocked' function to work
// when using it from jest, but it does work when we copy it into our repo, so we'll go with that
// for now.

type MockableFunction = (...args: any[]) => any;
type MethodKeysOf<T> = {
  [K in keyof T]: T[K] extends MockableFunction ? K : never;
}[keyof T];
type PropertyKeysOf<T> = {
  [K in keyof T]: T[K] extends MockableFunction ? never : K;
}[keyof T];
type ArgumentsOf<T> = T extends (...args: infer A) => any ? A : never;
type ConstructorArgumentsOf<T> = T extends new (...args: infer A) => any ? A : never;

interface MockWithArgs<T extends MockableFunction>
  extends jest.MockInstance<ReturnType<T>, ArgumentsOf<T>> {
  new (...args: ConstructorArgumentsOf<T>): T;
  (...args: ArgumentsOf<T>): ReturnType<T>;
}

type MaybeMockedConstructor<T> = T extends new (...args: any[]) => infer R
  ? jest.MockInstance<R, ConstructorArgumentsOf<T>>
  : T;

type MockedFunction<T extends MockableFunction> = MockWithArgs<T> &
  {
    [K in keyof T]: T[K];
  };

type MockedFunctionDeep<T extends MockableFunction> = MockWithArgs<T> & MockedObjectDeep<T>;

type MockedObject<T> = MaybeMockedConstructor<T> &
  {
    [K in MethodKeysOf<T>]: T[K] extends MockableFunction ? MockedFunction<T[K]> : T[K];
  } &
  {
    [K in PropertyKeysOf<T>]: T[K];
  };

type MockedObjectDeep<T> = MaybeMockedConstructor<T> &
  {
    [K in MethodKeysOf<T>]: T[K] extends MockableFunction ? MockedFunctionDeep<T[K]> : T[K];
  } &
  {
    [K in PropertyKeysOf<T>]: MaybeMockedDeep<T[K]>;
  };

export type MaybeMockedDeep<T> = T extends MockableFunction
  ? MockedFunctionDeep<T>
  : T extends object
  ? MockedObjectDeep<T>
  : T;

type MaybeMocked<T> = T extends MockableFunction
  ? MockedFunction<T>
  : T extends object
  ? MockedObject<T>
  : T;

function mocked<T>(item: T, deep?: false): MaybeMocked<T>;
function mocked<T>(item: T, deep: true): MaybeMockedDeep<T>;
function mocked<T>(item: T, deep?: boolean): MaybeMockedDeep<T> | MaybeMocked<T> {
  if (deep) {
    return item as MaybeMockedDeep<T>;
  } else {
    return item as MaybeMocked<T>;
  }
}

export { mocked };
