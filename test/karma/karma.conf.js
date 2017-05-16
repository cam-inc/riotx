const
  buble = require('rollup-plugin-buble'),
  nodeResolve = require('rollup-plugin-node-resolve'),
  commonjs = require('rollup-plugin-commonjs'),
  banner = require('../../rollup.vars').banner,
  intro = require('../../rollup.vars').intro;

var debug = !!process.env.DEBUG ? true : false;


let namedExports = {
  'node_modules/mout/array.js': [ 'forEach' ],
  'node_modules/mout/object.js': [ 'keys' ],
};


module.exports = (config) => {
  config.set({
    autoWatch: true,
    // client: { captureConsole: false },
    browsers: [
      'Chrome',
      // 'Firefox',
      // 'Safari'
    ],
    browserConsoleLogOptions: {
      level: 'error',
      format: '%b %T: %m',
      terminal: false
    },
    colors: true,
    files: [
      '../../node_modules/riot/riot.js',
      '../../src/index.js',
      'spec.js',
      'spec.tag',
    ],
    frameworks: ['mocha', 'power-assert', 'riot'],
    logLevel: config.LOG_DEBUG,
    //logLevel: config.LOG_ERROR,
    plugins: [
      'karma-rollup-plugin',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-power-assert',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-coverage',
      'karma-riot'
    ],
    preprocessors: {
      '../../src/index.js': ['rollup', 'coverage'],
      'spec.js': ['rollup'],
      'spec.tag': ['riot'],
    },
    reporters: ['mocha', 'coverage'],
    rollupPreprocessor: {
      // context: 'this',
      format: 'iife',
      moduleName: 'riotx',
      globals: {
        riot: 'riot'
      },
      banner: banner,
      intro: intro,
      external: ['riot'],
      plugins: [
        nodeResolve({
          jsnext: true,
          main: true,
          browser: true
        }),
        commonjs({
          include: 'node_modules/**',
          namedExports: namedExports
        }),
        buble()
      ],
      sourceMap: false // 'inline'
    },
    singleRun: !debug,
  });
};
