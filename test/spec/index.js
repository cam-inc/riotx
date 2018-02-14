/* eslint-env browser, node */

var riot;
var riotx;
var assert;

if (typeof window === 'undefined') {
  riot = require('riot');
  riotx = require('../../index');
  assert = require('power-assert');
  var version = require('../../package.json').version;
} else {
  riot = window.riot;
  riotx = window.riotx;
  assert = window.assert;
}

if (typeof window === 'undefined') {
  describe('server-side specs', () => {
    it('version', () => {
      assert(riotx.version === version); // eslint-disable-line block-scoped-var
    });
  });
}

describe('client-side specs', () => {
  it('init', () => {
    assert(!!riot);
    assert(!!riotx);
    assert(riotx.version !== '');
  });

  it('reset riotx', () => {
    riotx.add(new riotx.Store({
      name: 'test',
      state: {
        test: true
      },
      actions: {},
      mutations: {},
      getters: {}
    }));
    assert(riotx.get('test').name === 'test');
    assert(Object.keys(riotx.stores).length === 1);
    riotx.reset();
    assert(Object.keys(riotx.stores).length === 0);
  });

  it('mixin', () => {
    riot.tag('test-tag', '<p>{ message }</p>');
  });

  it('add riotx.Store', done => {
    riotx.reset();
    riotx.setChangeBindName('change');

    var store = new riotx.Store({
      state: {
        test: false,
      },
      actions: {
        test: context => {
          return Promise
            .resolve()
            .then(() => {
              context.commit('test');
            });
        }
      },
      mutations: {
        test: context => {
          context.state.test = true;
          return ['test'];
        }
      },
      getters: {
        test: context => {
          return context.state.test;
        }
      }
    });

    riotx.add(store);

    riotx.strict(false);
    assert(riotx.get().name === '@');
    assert(!riotx.get().state.test);
    riotx.strict(true);


    riotx.get().change('test', (state, store) => {
      let res = store.getter('test');
      assert(res);
      done();
    });

    riotx.get().action('test'); // fire!
  });

  it('add multi riotx.Store', () => {
    riotx.reset();

    riotx.add(new riotx.Store({
      name: 'a',
      state: {},
      actions: {},
      mutations: {},
      getters: {}
    }));
    try {
      riotx.add(new riotx.Store({
        name: 'a',
        state: {},
        actions: {},
        mutations: {},
        getters: {}
      }));
      assert(false);
    } catch (e) {
      assert(true);
    }
    riotx.add(new riotx.Store({
      name: 'b',
      state: {},
      actions: {},
      mutations: {},
      getters: {}
    }));
    assert(riotx.get('a').name === 'a');
    assert(riotx.get('b').name === 'b');
    assert(riotx.size() === 2);
  });

  it('strict mode', () => {
    riotx.reset();
    riotx.strict(true);
    riotx.add(new riotx.Store({
      name: 'test',
      state: {
        test: true
      },
      actions: {},
      mutations: {},
      getters: {}
    }));
    try {
      const state = riotx.stores.test.state;
      assert.fail(`strict mode not working. ${state}`);
    } catch (e) {
      assert.ok('strict mode is working.');
    }
  });

  it('plugins', () => {
    riotx.reset();
    riotx.strict(true);

    const store = new riotx.Store({
      state: {
        hello: 'Hello',
      },
      actions: {
        testAction: (context, text) => {
          return Promise
            .resolve()
            .then(() => {
              context.commit('testMutation', text);
            });
        }
      },
      mutations: {
        testMutation: (context, text) => {
          context.state.hello = `${context.state.hello} ${text}`;
          return ['testChangeMutation'];
        }
      },
      getters: {
        testGetter: context => {
          return context.state.hello;
        }
      },
      plugins: [
        store => {
          store.change('riotx:mutations:after', (name, targets, context, ...args) => { // eslint-disable-line no-unused-vars
            if (name === 'testMutation' && targets.includes('testChangeMutation')) {
              context.state.hello = `Override ${context.state.hello}`;
            }
          });
        },
      ]
    });
    riotx.add(store);

    store.change('testChangeMutation', (state, store) => {
      let res = store.getter('testGetter');
      assert.equal(res, 'Override Hello World');
    });
    const text = 'World';
    store.action('testAction', text);
  });

  it('Checking plugin, action, mutation and getter definition (function)', () => {
    riotx.reset();
    riotx.strict(true);

    assert.throws(() => {
      new riotx.Store({
        state: {},
        actions: {},
        mutations: {},
        getters: {},
        plugins: [
          '...'
        ]
      });
    }, Error);

    const store = new riotx.Store({
      state: {},
      actions: {
        testAction: '...'
      },
      mutations: {
        testMutation: '...'
      },
      getters: {
        testGetter: '...'
      },
      plugins: []
    });

    riotx.add(store);
    assert.throws(() => store.action('testAction'), Error);
    assert.throws(() => store.commit('testMutation'), Error);
    assert.throws(() => store.getter('testGetter'), Error);
    assert.throws(() => store.action('empty'), Error);
    assert.throws(() => store.commit('empty'), Error);
    assert.throws(() => store.getter('empty'), Error);

  });
});
