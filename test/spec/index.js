var riot  = require('riot');
var riotx  = require('../../index');
var assert = require('power-assert');
var package = require('../../package.json');

describe('Server-side specs', function() {
  it('version', function () {
    assert(riotx.version === package.version);
  });

  it("reset riotx", () => {
    riotx.add(new riotx.Store({name: 'test', state: {test: true}, actions: {}, mutations: {}, getters: {}}));
    assert(riotx.get('test').name === 'test');
    assert(Object.keys(riotx.stores).length === 1);
    riotx.reset();
    assert(Object.keys(riotx.stores).length === 0);
  });


  it('mixin', function () {
    riot.tag('test-tag', '<p>{ message }</p>');
  });
});
