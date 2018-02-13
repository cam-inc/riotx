/* global  assert, riot, riotx */
/* eslint-env browser, node */

describe('riotx', () => {
  it('init', () => {
    assert(!!riot);
    assert(!!riotx);
    assert(riotx.version !== '');
  });

  it('reset riotx', () => {
    riotx.add(new riotx.Store({name: 'test', state: {test: true}, actions: {}, mutations: {}, getters: {}}));
    assert(riotx.get('test').name === 'test');
    assert(riotx.size() === 1);
    riotx.reset();
    assert(riotx.size() === 0);
  });

  it('add riotx.Store', done => {
    riotx.reset();
    riotx.debug(true);
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

    assert(riotx.get().name === '@');
    assert(!riotx.get().state.test);


    riotx.get().change('test', (state, store) => {
      let res = store.getter('test');
      assert(res);
      done();
    });

    riotx.get().action('test'); // fire!
  });

  it('add multi riotx.Store', () => {
    riotx.reset();

    riotx.add(new riotx.Store({name: 'a', state: {}, actions: {}, mutations: {}, getters: {}}));
    try {
      riotx.add(new riotx.Store({name: 'a', state: {}, actions: {}, mutations: {}, getters: {}}));
      assert(false);
    } catch (e) {
      assert(true);
    }
    riotx.add(new riotx.Store({name: 'b', state: {}, actions: {}, mutations: {}, getters: {}}));
    assert(riotx.get('a').name === 'a');
    assert(riotx.get('b').name === 'b');
    assert(riotx.size() === 2);
  });

  it('mount spec.tag', () => {
    let html = document.createElement('spec');
    document.body.appendChild(html);

    var store = new riotx.Store({
      name: 'spec',
      state: {
        name: '',
      },
      actions: {
        name: (context, name) => {
          return Promise
            .resolve()
            .then(() => {
              context.commit('name', {name});
            });
        }
      },
      mutations: {
        name: (context, obj) => {
          context.state.name = obj.name;
          return ['name'];
        }
      },
      getters: {
        name: context => {
          return context.state.name;
        }
      }
    });

    riotx.add(store);


    var tag = riot.mount('spec', {
      message: 'Welcome'
    })[0];
    assert(document.querySelector('spec > h1').textContent === 'Welcome');

    assert(!!tag.riotx);
    assert(tag.riotx.get('spec').name === 'spec');

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
