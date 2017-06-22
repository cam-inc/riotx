const
  rollup = require('rollup'),
  buble = require('rollup-plugin-buble'),
  alias = require('rollup-plugin-alias'),
  riot = require('rollup-plugin-riot'),
  nodeResolve = require('rollup-plugin-node-resolve'),
  commonjs = require('rollup-plugin-commonjs'),
  banner = require('./rollup.vars').banner,
  banner_bundle = require('./rollup.vars').banner_bundle,
  intro = require('./rollup.vars').intro;

let namedExports = {
  'node_modules/mout/array.js': [ 'forEach' ],
  'node_modules/mout/object.js': [ 'keys' ],
};

// @see https://github.com/rollup/rollup/wiki/JavaScript-API

/// iife/amd (riot.js bundle)
rollup.rollup({
  entry: 'src/index.js',
  plugins: [
    alias({
      'riot': 'node_modules/riot/lib/riot.js',
      'riot-tmpl': 'node_modules/riot-tmpl/dist/es6.tmpl.js',
      'riot-observable': 'node_modules/riot-observable/dist/es6.observable.js',
    }),
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs({
      include: 'node_modules/**',
      namedExports: namedExports,
    }),
    buble()
  ]
}).then(bundle => {
  bundle.write({
    format: 'iife',
    moduleName: 'riotx',
    banner: banner_bundle,
    intro: intro,
    dest: 'dist/riotx+riot.js'
  });
  bundle.write({
    format: 'amd',
    banner: banner_bundle,
    intro: intro,
    dest: 'dist/amd.riotx+riot.js'
  });
}).catch(error => {
  console.error(error);
});


/// iife/amd (riot.js not bundle)
rollup.rollup({
  entry: 'src/index.js',
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
  ]
}).then(bundle => {
  bundle.write({
    format: 'iife',
    moduleName: 'riotx',
    globals: {
      riot: 'riot'
    },
    banner: banner,
    intro: intro,
    dest: 'dist/riotx.js'
  });
  bundle.write({
    format: 'amd',
    banner: banner,
    intro: intro,
    dest: 'dist/amd.riotx.js'
  });
}).catch(error => {
  console.error(error);
});


/// es/cjs
rollup.rollup({
  entry: 'src/index.js',
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
  ]
}).then(bundle => {
  bundle.write({
    format: 'es',
    banner: banner,
    intro: intro,
    dest: 'lib/index.js'
  });
  bundle.write({
    format: 'cjs',
    banner: banner,
    intro: intro,
    dest: 'index.js'
  });
}).catch(error => {
  console.error(error);
});
