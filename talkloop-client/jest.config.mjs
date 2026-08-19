export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
    '\\.module\\.css$': '<rootDir>/jest.css-transform.mjs',
    '\\.css$': '<rootDir>/jest.css-transform.mjs',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/src/__tests__/setup.ts'],
  clearMocks: true,
}
