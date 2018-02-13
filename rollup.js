/* global */
/* eslint-env node, mocha */
const
  rollup = require('rollup'),
  buble = require('rollup-plugin-buble'),
  alias = require('rollup-plugin-alias'),
  riot = require('rollup-plugin-riot'), // eslint-disable-line
  nodeResolve = require('rollup-plugin-node-resolve'),
  commonjs = require('rollup-plugin-commonjs'),
  banner = require('./rollup.vars').banner,
  banner_bundle = require('./rollup.vars').banner_bundle, // eslint-disable-line
  intro = require('./rollup.vars').intro;

let namedExports = {
  'node_modules/mout/array.js': [ 'forEach' ],
  'node_modules/mout/object.js': [ 'keys' ],
};

// @see https://rollupjs.org/guide/en#javascript-api

// iife/amd (riot.js bundle)
async function buildIifeAmdBundle() {
  // create a bundle
  const bundle = await rollup.rollup({
    input: 'src/index.js',
    plugins: [
      alias({
        'riot': 'node_modules/riot/lib/riot.js', // eslint-disable-line
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
  });
  await bundle.write({
    format: 'iife',
    name: 'riotx',
    banner: banner_bundle,
    intro: intro,
    file: 'dist/riotx+riot.js',
    sourcemap: true
  });

  await bundle.write({
    format: 'amd',
    banner: banner_bundle,
    intro: intro,
    file: 'dist/amd.riotx+riot.js',
    sourcemap: true
  });

}

buildIifeAmdBundle();


// iife/amd (riot.js not bundle)
async function buildIifeAmd() {
  // create a bundle
  const bundle = await rollup.rollup({
    input: 'src/index.js',
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
  });
  await bundle.write({
    format: 'iife',
    name: 'riotx',
    globals: {
      riot: 'riot'
    },
    banner: banner,
    intro: intro,
    file: 'dist/riotx.js',
    sourcemap: true
  });
  await bundle.write({
    format: 'amd',
    banner: banner,
    intro: intro,
    file: 'dist/amd.riotx.js',
    sourcemap: true
  });
}

buildIifeAmd();

// es/cjs
async function buildEsCjs() {
  // create a bundle
  const bundle = await rollup.rollup({
    input: 'src/index.js',
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
  });
  await bundle.write({
    format: 'es',
    banner: banner,
    intro: intro,
    file: 'lib/index.js'
  });
  await bundle.write({
    format: 'cjs',
    banner: banner,
    intro: intro,
    file: 'index.js'
  });
}

buildEsCjs();
