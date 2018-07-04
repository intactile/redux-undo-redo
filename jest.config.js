module.exports = {
  verbose: true,
  roots: ["<rootDir>/src/"],
  transform: {
    "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
  }
};
