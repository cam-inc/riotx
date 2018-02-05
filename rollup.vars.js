const package = require('./package.json');

const
  banner = '/* riotx version ' + package.version + ' */',
  banner_bundle = '/* riotx version ' + package.version + ', riot version ' + package.devDependencies.riot + ' */',
  intro = 'var VERSION = "' + package.version + '";';

module.exports = {
  banner: banner,
  banner_bundle: banner_bundle,
  intro: intro,
};
