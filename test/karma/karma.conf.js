const buble = require('rollup-plugin-buble');

module.exports = (config) => {
  config.set({
    autoWatch: true,
    // client: { captureConsole: false },
    browsers: [
      'Chrome',
      'Firefox',
      'Safari'
    ],
    browserConsoleLogOptions: {
      level: 'error',
      format: '%b %T: %m',
      terminal: false
    },
    colors: true,
    files: [
      '../../node_modules/riot/riot.js',
      '../../dist/riotx.js',
      'spec.js'
    ],
    frameworks: ['mocha', 'power-assert'],
    logLevel: 'LOG_DEBUG',
    //logLevel: config.LOG_ERROR,
    plugins: [
      'karma-rollup-plugin',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-power-assert',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-coverage'
    ],
    preprocessors: {
      '../../dist/riotx.js': ['coverage'],
      'spec.js': ['rollup']
    },
    reporters: ['mocha', 'coverage'],
    rollupPreprocessor: {
      // context: 'this',
      external: ['riot'],
      format: 'iife',
      globals: {
        riot: 'riot'
      },
      plugins: [
        buble()
      ],
      sourceMap: false // 'inline'
    },
    singleRun: true
  });
};
