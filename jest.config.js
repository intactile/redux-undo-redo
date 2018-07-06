module.exports = {
  verbose: true,
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest'
  }
};
