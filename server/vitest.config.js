const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    setupFiles: ['./tests/setup.js'],
    environment: 'node',
    globals: true,
    fileParallelism: false,
    testTimeout: 60000,
    hookTimeout: 60000,
  },
});
