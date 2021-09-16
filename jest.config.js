/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // Clear mocks in between tests by default
  clearMocks: true,
  coverageReporters: ['cobertura', 'clover', 'html', 'json', 'text'],
};
