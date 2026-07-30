/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // Clear mocks in between tests by default
  clearMocks: true,
  coverageReporters: ['cobertura', 'clover', 'html', 'lcov'],
};
