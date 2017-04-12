var riot  = require('riot');
var riotx  = require('../../index');
var assert = require('power-assert');
var package = require('../../package.json')

describe('Server-side specs', function() {
  it('version', function () {
    assert(riotx.version === package.version);
  });

  it('change settings', function () {
    assert(!riotx.settings.debug);
    assert(riotx.settings.default === '@');

    // edit
    riotx.settings.debug = true;
    riotx.settings.default = 'changed!';

    assert(riotx.settings.debug);
    assert(riotx.settings.default === 'changed!');

  });

  it('mixin', function () {
    riot.tag('test-tag', '<p>{ message }</p>');
  });
});
