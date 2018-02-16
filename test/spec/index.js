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


riotx.strict(true);


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

  it('reset riotx', done => {
    riotx.add(new riotx.Store({
      name: 'A',
      state: {},
      actions: {},
      mutations: {},
      getters: {}
    }));
    riotx.add(new riotx.Store({
      name: 'B',
      state: {},
      actions: {},
      mutations: {},
      getters: {}
    }));

    const storeA = riotx.get('A');
    let isCalled = false;
    storeA.on('evt', () => {
      isCalled = true;
    });
    assert(riotx.get('A').name === 'A');
    assert(riotx.get('B').name === 'B');
    assert(riotx.size() === 2);
    riotx.reset();
    assert(!riotx.get('A'));
    assert(!riotx.get('B'));
    assert(riotx.size() === 0);
    storeA.trigger('evt');
    setTimeout(() => {
      assert(!isCalled);
      done();
    }, 100);
  });

  it('mixin', () => {
    riot.tag('test-tag', '<p>{ message }</p>');
  });

  it('basic new Store()', done => {
    riotx.reset();
    riotx.setChangeBindName('change');

    var store = new riotx.Store({
      state: {
        text: '',
      },
      actions: {
        testAction: context => {
          return Promise
            .resolve()
            .then(() => {
              context.commit('testMutation');
            });
        }
      },
      mutations: {
        testMutation: context => {
          context.state.test = true;
          return ['testChangeMutation'];
        }
      },
      getters: {
        testGetter: context => {
          return context.state.test;
        }
      }
    });

    riotx.add(store);

    riotx.strict(false);
    assert(riotx.get().name === '@');
    assert(!riotx.get().state.test);
    riotx.strict(true);


    riotx.get().change('testChangeMutation', (state, store) => {
      let res = store.getter('testGetter');
      assert(res);
      done();
    });

    riotx.get().action('testAction'); // fire!
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

  it('plugins', done => {
    riotx.reset();
    riotx.strict(true);

    const store = new riotx.Store({
      state: {
        hello: 'Hello',
      },
      actions: {
        testAction: (context, data) => {
          return Promise
            .resolve()
            .then(() => {
              context.commit('testMutation', data);
            });
        }
      },
      mutations: {
        testMutation: (context, data) => {
          context.state.hello = `${context.state.hello} ${data.text}`;
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
          store.change('riotx:mutations:after', (name, targets, context, data) => { // eslint-disable-line no-unused-vars
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
      done();
    });
    const text = 'World';
    store.action('testAction', {
      text: text
    });
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

  it('Unify the arguments to Getter, Action Mutation and Plugin.', done => {
    riotx.reset();
    riotx.strict(true);

    const store = new riotx.Store({
      state: {
        text: 'Hello'
      },
      /**
       * - sayGetter/sayAppendSuffixGetter Getter name.
       * @param {Object} context Information provided by `riotx` to `Getter`.
       * - context.state Store.state object
       * @param {Object} data Data from this caller.
       */
      getters: {
        sayGetter: context => {
          return context.state.text;
        },
        sayAppendSuffixGetter: (context, data) => {
          return `${context.state.text} ${data.text}`;
        }
      },
      /**
       * - sayAction Action name.
       * @param {Object} context Information provided by `riotx` to `Action`.
       * - context.getter Store.getter shortcut
       * - context.commit Data to carry to Mutation.
       * @param {Object} data Data from this caller.
       */
      actions: {
        sayAction: (context, data) => {
          context.commit('sayMutation', data);
        }
      },
      /**
       * - sayMutation Mutation name.
       * @param {Object} context Information provided by `riotx` to `Mutation`.
       * - context.getter Store.getter shortcut
       * - context.state Store.state object
       * @param {Object} data Data from this caller. (from action)
       * @return {Array} The name of the subscriber who wants to let you catch fire.
       */
      mutations: {
        sayMutation: (context, data) => {
          const text = `${context.getter('sayGetter')} ${data.text}`;
          context.state.text = text;
          return ['sayChangeMutation'];
        }
      },
      plugins: [
        /**
         * @param {Object} store Store instance.
         */
        store => {
          /**
           * - plugin subscriber
           * @param {String} name It will be hooked after running all `mutations`.
           * Event name : `riotx:mutations:after`
           * @param {Array} triggers Subscriber list
           * @param {Object} context Information provided by `riotx` to  `Mutation`.
           * - context.getter Store.getter shortcut
           * - context.state Store.state object
           */
          store.change('riotx:mutations:after', (name, targets, context, data) => { // eslint-disable-line no-unused-vars
            if (name === 'sayMutation' && targets.includes('sayChangeMutation')) {
              context.state.text = `Override ${context.state.text}`;
            }
          });
        },
      ]
    });

    riotx.add(store);

    store.change('sayChangeMutation', (state, store) => {
      const text = store.getter('sayAppendSuffixGetter', {
        text: ':)'
      });
      assert.equal(text, 'Override Hello World :)');
      assert(store);
      done();
    });

    store.action('sayAction', {
      text: 'World'
    });
  });

  it('execute functions with proper arguments and values.', done => {
    riotx.reset();
    riotx.strict(true);
    riotx.add(new riotx.Store({
      name: 'sample',
      state: {
        text: 'A'
      },
      actions: {
        testAction: (context, data) => {
          assert(!!context);
          assert(!!context.getter);
          assert(!!context.commit);
          assert(!!data);
          assert(data.text === ':)');
          const text = context.getter('testGetter', {
            text: ':('
          });
          assert(text === 'A');
          return Promise.resolve().then(() => {
            context.commit('testMutation', {
              text: 'B'
            });
          });
        }
      },
      mutations: {
        testMutation: (context, data) => {
          assert(!!context);
          assert(!!context.getter);
          const currentText = context.getter('testGetter', {
            text: ':('
          });
          assert(currentText === 'A');
          assert(!!context.state);
          assert(data.text === 'B');
          context.state.text = data.text;
          return ['change'];
        }
      },
      getters: {
        testGetter: (context, data) => {
          assert(!!context);
          assert(!!context.state);
          assert(context.state.text === 'A');
          assert(!!data);
          assert(data.text === ':(');
          return context.state.text;
        }
      },
      plugins: [store => {
        try {
          const text = store.state.text;// eslint-disable-line no-unused-vars
          assert.fail('direct access not allowed with strict mode on.');
        } catch (e) {
          assert.ok('direct access not allowed with strict mode on.');
        }
        try {
          store.state.text = ':(';
          assert.fail('direct mutation not allowed with strict mode on.');
        } catch (e) {
          assert.ok('direct mutation not allowed with strict mode on.');
        }
        store.change('riotx:mutations:after', (name, triggers, context, data) => {
          assert(name === 'testMutation');
          assert(triggers.length === 1);
          assert(triggers[0] === 'change');
          assert(!!context);
          assert(!!context.getter);
          assert(!!context.state);
          assert(!!data);
          assert(data.text === 'B');
        });
      }]
    }));
    const store = riotx.get('sample');
    try {
      const text = store.state.text;// eslint-disable-line no-unused-vars
      assert.fail('direct access not allowed with strict mode on.');
    } catch (e) {
      assert.ok('direct access not allowed with strict mode on.');
    }
    try {
      store.state.text = ':(';
      assert.fail('direct mutation not allowed with strict mode on.');
    } catch (e) {
      assert.ok('direct mutation not allowed with strict mode on.');
    }
    let text;
    try {
      text = store.getter('testGetter', {
        text: ':('
      });
    } catch (e) {
      assert.fail('should be able to get data via getter functions.');
    }
    assert(text === 'A');
    store.on('change', (state, store) => {
      assert(!!state);
      assert(!!store);
      assert(store.name === 'sample');
      assert(state.text === 'B');
      try {
        const text = store.state.text;// eslint-disable-line no-unused-vars
        assert.fail('direct access not allowed with strict mode on.');
      } catch (e) {
        assert.ok('direct access not allowed with strict mode on.');
      }
      try {
        store.state.text = ':(';
        assert.fail('direct mutation not allowed with strict mode on.');
      } catch (e) {
        assert.ok('direct mutation not allowed with strict mode on.');
      }
      done();
    });
    store.action('testAction', {
      text: ':)'
    });
  });

});
