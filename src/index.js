/*global VERSION*/

import forEach from 'mout/array/forEach';
import keys from 'mout/object/keys';
import ObjectAssign from 'object-assign';
import Promise from 'promise-polyfill';
import riot from 'riot';

/**
 * settings for riotx
 * @type {{debug: boolean, default: string}}
 */
const settings = {
  debug: false,
  default: '@',
  changeBindName: 'riotxChange',
  strict: false
};

/**
 * log output
 */
const log = (...args) => {
  if (!settings.debug) {
    return;
  }

  args.unshift('[riotx]');
  try {
    console.log.apply(console, args); // eslint-disable-line
  } catch (e) {
    console.log(args); // eslint-disable-line
  }
};


class Store {
  /**
   * @param { name: 'Store Name', state: { default state data }, actions: { TODO } mutations: { TODO }, getters: { TODO } }
   */
  constructor(_store) {
    /**
     * name of the store.
     * @type {String}
     */
    this.name = _store.name;
    if (!this.name) {
      this.name = settings.default;
      log(`Default store name. name=${this.name}`);
    }

    /**
     * a object that represents full application state.
     * @type {Object}
     */
    this._state = ObjectAssign({}, _store.state);
    Object.defineProperty(this, 'state', {
      get: () => {
        if (settings.strict) {
          throw new Error('[riotx] [strict] Direct access get error.');
        }
        return this._state;
      },
      set: state => {

        if (settings.strict) {
          throw new Error(`[riotx] [strict] Direct access set error. ${state}`);
        }
        this._state = state;
      }
    });

    /**
     * functions to mutate application state.
     * @type {Object}
     */
    this._actions = ObjectAssign({}, _store.actions);

    /**
     * mutaions.
     * mutaion = a function which mutates the state.
     * all mutation functions take two parameters which are `state` and `obj`.
     * `state` will be TODO.
     * `obj` will be TODO.
     * @type {Object}
     */
    this._mutations = ObjectAssign({}, _store.mutations);

    /**
     * functions to get data from states.
     * @type {Object}
     */
    this._getters = ObjectAssign({}, _store.getters);

    riot.observable(this);
  }

  /**
   * Getter state
   * @param {String} name TODO
   * @param {...*} args
   */
  getter(name, ...args) {
    log('[getter]', name, args);
    const context = {
      state: ObjectAssign({}, this._state)
    };
    return this._getters[name].apply(null, [context, ...args]);
  }

  /**
   * Commit mutation.
   * only actions are allowed to execute this function.
   * @param {String} name mutation name
   * @param {...*} args
   */
  commit(name, ...args) {
    const _state = ObjectAssign({}, this._state);
    log('[commit(before)]', name, _state, ...args);
    const context = {
      getter: (name, ...args) => {
        return this.getter.apply(this, [name, ...args]);
      },
      state: _state
    };
    const triggers = this._mutations[name].apply(null, [context, ...args]);
    log('[commit(after)]', name, _state, ...args);
    ObjectAssign(this._state, _state);

    forEach(triggers, v => {
      // this.trigger(v, null, this.state, this);
      this.trigger(v, this._state, this);
    });
  }

  /**
   * emit action.
   * only ui components are allowed to execute this function.
   * @param {Stting} name action name
   * @param {...*} args parameter's to action
   * @return {Promise}
   */
  action(name, ...args) {
    log('[action]', name, args);

    const context = {
      getter: (name, ...args) => {
        return this.getter.apply(this, [name, ...args]);
      },
      state: ObjectAssign({}, this._state),
      commit: (...args) => {
        this.commit(...args);
      }
    };
    return Promise
      .resolve()
      .then(() => this._actions[name].apply(null, [context, ...args]));
  }

  /**
   * shorthand for `store.on('event', () => {})`.
   * @param {...*} args
   */
  change(...args) {
    this.on(...args);
  }
}

class RiotX {
  constructor() {
    this.version = VERSION || '';

    /**
     * constructor of RiotX.Store.
     * @type {RiotX.Store}
     */
    this.Store = Store;

    /**
     * instances of RiotX.Store.
     * @type {Object}
     */
    this.stores = {};

    // add and keep event listener for store changes.
    // through this function the event listeners will be unbinded automatically.
    const riotxChange = function(store, evtName, ...args) {
      this._riotx_change_handlers.push({
        store,
        evtName
      });
      args.unshift(evtName);
      store.change(...args);
    };

    // register a mixin globally.
    riot.mixin({
      // intendedly use `function`.
      // switch the context of `this` from `riotx` to `riot tag instance`.
      init: function() {
        // the context of `this` will be equal to riot tag instant.
        this.on('unmount', () => {
          this.off('*');
          forEach(this._riotx_change_handlers, obj => {
            obj.store.off(obj.evtName);
          });
          delete this.riotx;
          delete this._riotx_change_handlers;
          delete this[settings.changeBindName];
        });

        if (settings.debug) {
          this.on('*', eventName => {
            log('[riot.mixin]', eventName, this);
          });
        }

        // let users set the name.
        this[settings.changeBindName] = riotxChange;
      },
      // give each riot instance the ability to access the globally defined singleton RiotX instance.
      riotx: this,
      _riotx_change_handlers: []
    });
  }

  /**
   * Add a store instance
   * @param {RiotX.Store} store instance of RiotX.Store
   * @returns {RiotX}
   */
  add(store) {
    if (this.stores[store.name]) {
      throw new Error(`The store instance named \`${store.name}\` already exists.`);
    }

    this.stores[store.name] = store;
    return this;
  }

  /**
   * Get store instance
   * @param {String} name store name
   * @returns {RiotX.Store} store instance
   */
  get(name = settings.default) {
    return this.stores[name];
  }

  /**
   * Set debug flag
   * @param {boolean} flag
   * @returns {RiotX}
   */
  debug(flag) {
    settings.debug = !!flag;
    return this;
  }

  /**
   * Set function name to bind store change event.
   * @param {String} name
   * @returns {RiotX}
   */
  setChangeBindName(name) {
    settings.changeBindName = name;
    return this;
  }

  /**
   * Directly changing the state property from outside will occur an exception.
   * You can change it through “mutations”, or you can get it via “getters”.
   * @param {boolean} flag
   * @returns {RiotX}
   */
  strict(flag) {
    settings.strict = !!flag;
    return this;
  }

  /**
   * Reset riotx instance
   * @returns {RiotX} instance
   */
  reset() {
    this.stores = {};
    return this;
  }

  /**
   * Store's count
   * @returns {int} size
   */
  size() {
    return keys(this.stores).length;
  }

}

export default new RiotX();
