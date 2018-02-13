/* eslint-env browser, node */
var riot = require('riot');
var riotx = require('../../index');
var assert = require('power-assert');
var version = require('../../package.json').version;

describe('Server-side specs', function() {
  it('version', function() {
    assert(riotx.version === version);
  });

  it('reset riotx', () => {
    riotx.add(new riotx.Store({name: 'test', state: {test: true}, actions: {}, mutations: {}, getters: {}}));
    assert(riotx.get('test').name === 'test');
    assert(Object.keys(riotx.stores).length === 1);
    riotx.reset();
    assert(Object.keys(riotx.stores).length === 0);
  });

  it('mixin', function() {
    riot.tag('test-tag', '<p>{ message }</p>');
  });

  it('strict mode', () => {
    riotx.reset();
    riotx.strict(true);
    riotx.debug(true);
    riotx.add(new riotx.Store({name: 'test', state: {test: true}, actions: {}, mutations: {}, getters: {}}));
    try {
      const state = riotx.stores.test.state;
      assert.fail(`strict mode not working. ${state}`);
    } catch (e) {
      assert.ok('strict mode is working.');
    }
  });

});
