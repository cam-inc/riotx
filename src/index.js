/*global VERSION*/

import forEach from 'mout/array/forEach';
import forOwn from 'mout/object/forOwn';
import keys from 'mout/object/keys';
import isFunction from 'mout/lang/isFunction';
import isObject from 'mout/lang/isObject';
import Promise from 'promise-polyfill';
import riot from 'riot';


/**
 * console output
 *
 * @param {String} type level
 * @param {*} args output messages
 */
const _output = (type, ...args) => {
  args.unshift('[riotx]');
  try {
    console.log.apply(console, args); // eslint-disable-line
  } catch (e) {
    console.log(args); // eslint-disable-line
  }
};

/**
 * settings for riotx
 * @type {{debug: boolean, default: string}}
 */
const settings = {
  debug: false,
  default: '@',
  changeBindName: 'riotxChange',
  strict: false,
  logger: {
    output: _output,
  }
};

/**
 * console debug output
 * @param {*} args
 */
const debug = (...args) => {
  if (!settings.debug) {
    return;
  }
  args.unshift('DEBUG');
  settings.logger.output.apply(null, args);
};

/**
 * console error output
 * @param {*} message
 */
const error = message => {
  const err = new Error(`[riotx] ${message}`);
  settings.logger.output.apply(null, ['ERROR', err]);
  throw err;
};

/**
 * @class Store
 */
class Store {

  /**
   * Creates an instance of Store.
   * @param {Object} _store { name: 'Store Name', state: { default state data }, actions: { functions... } mutations: { functions... }, getters: { functions... }, plugins: { functions... } }
   * @memberof Store
   */
  constructor(_store) {
    /**
     * name of the store.
     * @type {String}
     * @memberof Store
     */
    this.name = _store.name;
    if (!this.name) {
      this.name = settings.default;
      debug(`Default store name. name=${this.name}`);
    }

    /**
     * a object that represents full application state.
     * @memberof Store
     * @type {Object}
     */
    this._state = _store.state;
    Object.defineProperty(this, 'state', {
      get: () => {
        if (settings.strict) {
          error('[strict] Direct access get error.');
        }
        return this._state;
      },
      set: state => {

        if (settings.strict) {
          error(`[strict] Direct access set error. ${state}`);
        }
        this._state = state;
      }
    });

    /**
     * functions to mutate application state.
     * @memberof Store
     * @type {Object}
     */
    this._actions = _store.actions;

    /**
     * mutaions.
     * mutaion = a function which mutates the state.
     * all mutation functions take two parameters which are `state` and `obj`.
     * @memberof Store
     * @type {Object}
     */
    this._mutations = _store.mutations;

    /**
     * functions to get data from states.
     * @memberof Store
     * @type {Object}
     */
    this._getters = _store.getters;

    /**
     * functions to plugins.
     * @memberof Store
     * @type {Array}
     */
    this._plugins = _store.plugins;

    riot.observable(this);

    // Load plugins.
    forEach(this._plugins, p => {
      if (!isFunction(p)) {
        error('[plugin] The plugin is not a function.');
      }
      p.apply(null, [this]);
    });

  }

  /**
   * Reset store instance.
   * @memberof Store
   */
  reset() {
    this.name = null;
    this._state = null;
    this._actions = null;
    this._mutations = null;
    this._getters = null;
    this._plugins = null;
    this.off('*');
  }

  /**
   * Getter state
   * @param {String} name
   * @param {Object} data
   * @memberof Store
   * @returns {*}
   */
  getter(name, data) {
    if (data && !isObject(data)) {
      error(`[getter]', 'The getter data is not object type. name=${name} data=${data}`);
    }
    const context = {
      state: this._state
    };
    const fn = this._getters[name];
    if (!fn || !isFunction(fn)) {
      error(`[getter]', 'The getter is not a function. name=${name} data=${data}`);
    }
    debug('[getter]', name, data);
    return fn.apply(null, [context, data]);
  }

  /**
   * Commit mutation.
   * only actions are allowed to execute this function.
   * @param {String} name mutation name
   * @param {Object} data
   * @memberof Store
   */
  commit(name, data) {
    if (data && !isObject(data)) {
      error(`[mutation]', 'The mutation data is not object type. name=${name} data=${data}`);
    }
    const context = {
      getter: (name, data) => {
        return this.getter.apply(this, [name, data]);
      },
      state: this._state
    };

    const fn = this._mutations[name];
    if (!fn || !isFunction(fn)) {
      error(`[mutation]', 'The mutation is not a function. name=${name} data=${data}`);
    }

    debug('[mutation(before)]', name, this._state, data);
    const triggers = fn.apply(null, [context, data]);
    debug('[mutation(after)]', name, this._state, data);

    // Plugins
    this.trigger('riotx:mutations:after', name, triggers, context, data);

    forEach(triggers, v => {
      // this.trigger(v, null, this.state, this);
      this.trigger(v, this._state, this);
    });
  }

  /**
   * emit action.
   * only ui components are allowed to execute this function.
   * @param {Stting} name action name
   * @param {Object} data parameter's to action
   * @memberof Store
   * @return {Promise}
   */
  action(name, data) {
    if (data && !isObject(data)) {
      error(`[action]', 'The action data is not object type. name=${name} data=${data}`);
    }
    const context = {
      getter: (name, data) => {
        return this.getter.apply(this, [name, data]);
      },
      //state: this._state,
      commit: (name, data) => {
        this.commit(name, data);
      }
    };

    const fn = this._actions[name];
    if (!fn || !isFunction(fn)) {
      error(`[action] The action is not a function. name=${name} data=${data}`);
    }

    debug('[action]', name, data);
    return Promise
      .resolve()
      .then(() => fn.apply(null, [context, data]));
  }

  /**
   * shorthand for `store.on('event', () => {})`.
   * @param {...*} args
   * @memberof Store
   */
  change(...args) {
    this.on(...args);
  }

}

/**
 * @class RiotX
 */
class RiotX {

  /**
   * Creates an instance of RiotX.
   * @memberof RiotX
   */
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
    const riotxChange = function (store, evtName, handler, ...args) {
      this._riotx_change_handlers.push({
        store,
        evtName,
        handler
      });
      args.unshift(handler);
      args.unshift(evtName);
      store.change(...args);
    };

    // register a mixin globally.
    riot.mixin({
      // intendedly use `function`.
      // switch the context of `this` from `riotx` to `riot tag instance`.
      init: function () {
        // the context of `this` will be equal to riot tag instant.
        this.on('unmount', () => {
          this.off('*');
          forEach(this._riotx_change_handlers, obj => {
            obj.store.off(obj.evtName, obj.handler);
          });
          delete this.riotx;
          delete this._riotx_change_handlers;
          delete this[settings.changeBindName];
        });

        if (settings.debug) {
          this.on('*', eventName => {
            debug('[riot.mixin]', eventName, this);
          });
        }

        this._riotx_change_handlers = [];

        // let users set the name.
        this[settings.changeBindName] = riotxChange;
      },
      // give each riot instance the ability to access the globally defined singleton RiotX instance.
      riotx: this
    });
  }

  /**
   * Add a store instance
   * @param {RiotX.Store} store instance of RiotX.Store
   * @memberof RiotX
   * @returns {RiotX}
   */
  add(store) {
    if (this.stores[store.name]) {
      error(`[store.add] The store instance named \`${store.name}\` already exists.`);
    }

    this.stores[store.name] = store;
    return this;
  }

  /**
   * Get store instance
   * @param {String} name store name
   * @memberof RiotX
   * @returns {RiotX.Store} store instance
   */
  get(name = settings.default) {
    return this.stores[name];
  }

  /**
   * Set debug flag
   * @param {boolean} flag
   * @memberof RiotX
   * @returns {RiotX}
   */
  debug(flag) {
    settings.debug = !!flag;
    return this;
  }

  /**
   * Set function name to bind store change event.
   * @param {String} name
   * @memberof RiotX
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
   * @memberof RiotX
   * @returns {RiotX}
   */
  strict(flag) {
    settings.strict = !!flag;
    return this;
  }

  /**
   *
   *
   * @param {Function} fn @see function _output
   * @returns Riotx
   * @memberof RiotX
   */
  logger(fn) {
    settings.logger.output = fn;
    return this;
  }

  /**
   * Reset all store instances at once.
   * @memberof RiotX
   * @returns {RiotX} instance
   */
  reset() {
    forOwn(this.stores || {}, store => {
      store.reset();
    });
    this.stores = {};
    return this;
  }

  /**
   * Store's count
   * @memberof RiotX
   * @returns {int} size
   */
  size() {
    return keys(this.stores).length;
  }

}

export default new RiotX();
