describe("riotx", () => {
  it("init", () => {
    assert(!!riot);
    assert(!!riotx);
    assert(riotx.version != '');
  });

  it("add riotx.Store", (done) => {
    riotx.settings.debug = true;
    var store = new riotx.Store({
      state: {
        test: false,
      },
      actions: {
        test: function (callback) {
          this.commit('test');
          callback(null);
        }
      },
      mutations: {
        test: function (state) {
          state.test = true;
        }
      },
      getters: {
        test: function (state) {
          return state.test;
        }
      }
    });

    riotx.add(store);

    assert(riotx.get().name == riotx.settings.default);
    assert(!riotx.get().state.test);
    riotx.get().on('test', (err, state, store) => {
      let res = store.getters.test(state);
      assert(res);
      done();
    });

    riotx.get().action('test')
  });

  it("add multi riotx.Store", () => {
    riotx.stores = {}; // TODO reset function...
    riotx.add(new riotx.Store({name: "a", state: {}, actions: {}, mutations: {}, getters: {}}));
    try {
      riotx.add(new riotx.Store({name: "a", state: {}, actions: {}, mutations: {}, getters: {}}));
      assert(false);
    } catch (e) {
      assert(true);
    }
    riotx.add(new riotx.Store({name: "b", state: {}, actions: {}, mutations: {}, getters: {}}));
    assert(riotx.get('a').name == 'a');
    assert(riotx.get('b').name == 'b');
    assert(Object.keys(riotx.stores).length == 2);
  });

  it("mount spec.tag", () => {
    let html = document.createElement('spec');
    document.body.appendChild(html);


    var store = new riotx.Store({
      name: 'spec',
      state: {
        name: false,
      },
      actions: {
        name: function (name, callback) {
          this.commit('name', {name});
          callback(null);
        }
      },
      mutations: {
        name: function (state, obj) {
          state.name = obj.name;
        }
      },
      getters: {
        name: function (state) {
          return state.name;
        }
      }
    });

    riotx.add(store);


    var tag = riot.mount('spec', {
      message: 'Welcome'
    })[0];
    assert(document.querySelector('spec > h1').textContent == 'Welcome');

    assert(!!tag.riotx);
    assert(tag.riotx.get("spec").name === "spec");

  })
});

