/* riotx version 2.0.0 */
var VERSION = "2.0.0";

import riot from 'riot';

/**
     * Array forEach
     */
    function forEach(arr, callback, thisObj) {
        if (arr == null) {
            return;
        }
        var i = -1,
            len = arr.length;
        while (++i < len) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if ( callback.call(thisObj, arr[i], i, arr) === false ) {
                break;
            }
        }
    }

    var forEach_1 = forEach;

/**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     var hasOwn_1 = hasOwn;

var _hasDontEnumBug;
var _dontEnums;

    function checkDontEnum(){
        _dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

        _hasDontEnumBug = true;

        for (var key in {'toString': null}) {
            _hasDontEnumBug = false;
        }
    }

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forIn(obj, fn, thisObj){
        var key, i = 0;
        // no need to check if argument is a real object that way we can use
        // it for arrays, functions, date, etc.

        //post-pone check till needed
        if (_hasDontEnumBug == null) { checkDontEnum(); }

        for (key in obj) {
            if (exec(fn, obj, key, thisObj) === false) {
                break;
            }
        }


        if (_hasDontEnumBug) {
            var ctor = obj.constructor,
                isProto = !!ctor && obj === ctor.prototype;

            while (key = _dontEnums[i++]) {
                // For constructor, if it is a prototype object the constructor
                // is always non-enumerable unless defined otherwise (and
                // enumerated above).  For non-prototype objects, it will have
                // to be defined on this object, since it cannot be defined on
                // any prototype objects.
                //
                // For other [[DontEnum]] properties, check if the value is
                // different than Object prototype value.
                if (
                    (key !== 'constructor' ||
                        (!isProto && hasOwn_1(obj, key))) &&
                    obj[key] !== Object.prototype[key]
                ) {
                    if (exec(fn, obj, key, thisObj) === false) {
                        break;
                    }
                }
            }
        }
    }

    function exec(fn, obj, key, thisObj){
        return fn.call(thisObj, obj[key], key, obj);
    }

    var forIn_1 = forIn;

/**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forOwn(obj, fn, thisObj){
        forIn_1(obj, function(val, key){
            if (hasOwn_1(obj, key)) {
                return fn.call(thisObj, obj[key], key, obj);
            }
        });
    }

    var forOwn_1 = forOwn;

/**
     * Get object keys
     */
     var keys = Object.keys || function (obj) {
            var keys = [];
            forOwn_1(obj, function(val, key){
                keys.push(key);
            });
            return keys;
        };

    var keys_1 = keys;

/**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     */
    function kindOf(val) {
        return Object.prototype.toString.call(val).slice(8, -1);
    }
    var kindOf_1 = kindOf;

/**
     * Check if value is from a specific "kind".
     */
    function isKind(val, kind){
        return kindOf_1(val) === kind;
    }
    var isKind_1 = isKind;

/**
     */
    function isFunction(val) {
        return isKind_1(val, 'Function');
    }
    var isFunction_1 = isFunction;

/**
     */
    function isObject(val) {
        return isKind_1(val, 'Object');
    }
    var isObject_1 = isObject;

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}

function Promise(fn) {
  if (!(this instanceof Promise))
    { throw new TypeError('Promises must be constructed via new'); }
  if (typeof fn !== 'function') { throw new TypeError('not a function'); }
  this._state = 0;
  this._handled = false;
  this._value = undefined;
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  Promise._immediateFn(function() {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      { throw new TypeError('A promise cannot be resolved with itself.'); }
    if (
      newValue &&
      (typeof newValue === 'object' || typeof newValue === 'function')
    ) {
      var then = newValue.then;
      if (newValue instanceof Promise) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === 'function') {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    Promise._immediateFn(function() {
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done) { return; }
        done = true;
        resolve(self, value);
      },
      function(reason) {
        if (done) { return; }
        done = true;
        reject(self, reason);
      }
    );
  } catch (ex) {
    if (done) { return; }
    done = true;
    reject(self, ex);
  }
}

Promise.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

Promise.prototype['finally'] = function(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      return constructor.resolve(callback()).then(function() {
        return constructor.reject(reason);
      });
    }
  );
};

Promise.all = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!arr || typeof arr.length === 'undefined')
      { throw new TypeError('Promise.all accepts an array'); }
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) { return resolve([]); }
    var remaining = args.length;

    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              reject
            );
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.resolve = function(value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value;
  }

  return new Promise(function(resolve) {
    resolve(value);
  });
};

Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value);
  });
};

Promise.race = function(values) {
  return new Promise(function(resolve, reject) {
    for (var i = 0, len = values.length; i < len; i++) {
      values[i].then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
Promise._immediateFn =
  (typeof setImmediate === 'function' &&
    function(fn) {
      setImmediate(fn);
    }) ||
  function(fn) {
    setTimeoutFunc(fn, 0);
  };

Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
  }
};

/*global VERSION*/

/**
 * console output
 *
 * @param {String} type level
 * @param {*} args output messages
 */
var _output = function (type) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

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
var settings = {
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
var debug = function () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

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
var error = function (message) {
  var err = new Error(("[riotx] " + message));
  settings.logger.output.apply(null, ['ERROR', err]);
  throw err;
};

/**
 * @class Store
 */
var Store = function Store(_store) {
  var this$1 = this;

  /**
   * name of the store.
   * @type {String}
   * @memberof Store
   */
  this.name = _store.name;
  if (!this.name) {
    this.name = settings.default;
    debug(("Default store name. name=" + (this.name)));
  }

  /**
   * a object that represents full application state.
   * @memberof Store
   * @type {Object}
   */
  this._state = _store.state;
  Object.defineProperty(this, 'state', {
    get: function () {
      if (settings.strict) {
        error('[strict] Direct access get error.');
      }
      return this$1._state;
    },
    set: function (state) {

      if (settings.strict) {
        error(("[strict] Direct access set error. " + state));
      }
      this$1._state = state;
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
  forEach_1(this._plugins, function (p) {
    if (!isFunction_1(p)) {
      error('[plugin] The plugin is not a function.');
    }
    p.apply(null, [this$1]);
  });

};

/**
 * Reset store instance.
 * @memberof Store
 */
Store.prototype.reset = function reset () {
  this.name = null;
  this._state = null;
  this._actions = null;
  this._mutations = null;
  this._getters = null;
  this._plugins = null;
  this.off('*');
};

/**
 * Getter state
 * @param {String} name
 * @param {Object} data
 * @memberof Store
 * @returns {*}
 */
Store.prototype.getter = function getter (name, data) {
  if (data && !isObject_1(data)) {
    error(("[getter]', 'The getter data is not object type. name=" + name + " data=" + data));
  }
  var context = {
    state: this._state
  };
  var fn = this._getters[name];
  if (!fn || !isFunction_1(fn)) {
    error(("[getter]', 'The getter is not a function. name=" + name + " data=" + data));
  }
  debug('[getter]', name, data);
  return fn.apply(null, [context, data]);
};

/**
 * Commit mutation.
 * only actions are allowed to execute this function.
 * @param {String} name mutation name
 * @param {Object} data
 * @memberof Store
 */
Store.prototype.commit = function commit (name, data) {
    var this$1 = this;

  if (data && !isObject_1(data)) {
    error(("[mutation]', 'The mutation data is not object type. name=" + name + " data=" + data));
  }
  var context = {
    getter: function (name, data) {
      return this$1.getter.apply(this$1, [name, data]);
    },
    state: this._state
  };

  var fn = this._mutations[name];
  if (!fn || !isFunction_1(fn)) {
    error(("[mutation]', 'The mutation is not a function. name=" + name + " data=" + data));
  }

  debug('[mutation(before)]', name, this._state, data);
  var triggers = fn.apply(null, [context, data]);
  debug('[mutation(after)]', name, this._state, data);

  // Plugins
  this.trigger('riotx:mutations:after', name, triggers, context, data);

  forEach_1(triggers, function (v) {
    // this.trigger(v, null, this.state, this);
    this$1.trigger(v, this$1._state, this$1);
  });
};

/**
 * emit action.
 * only ui components are allowed to execute this function.
 * @param {Stting} name action name
 * @param {Object} data parameter's to action
 * @memberof Store
 * @return {Promise}
 */
Store.prototype.action = function action (name, data) {
    var this$1 = this;

  if (data && !isObject_1(data)) {
    error(("[action]', 'The action data is not object type. name=" + name + " data=" + data));
  }
  var context = {
    getter: function (name, data) {
      return this$1.getter.apply(this$1, [name, data]);
    },
    //state: this._state,
    commit: function (name, data) {
      this$1.commit(name, data);
    }
  };

  var fn = this._actions[name];
  if (!fn || !isFunction_1(fn)) {
    error(("[action] The action is not a function. name=" + name + " data=" + data));
  }

  debug('[action]', name, data);
  return Promise
    .resolve()
    .then(function () { return fn.apply(null, [context, data]); });
};

/**
 * shorthand for `store.on('event', () => {})`.
 * @param {...*} args
 * @memberof Store
 */
Store.prototype.change = function change () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

  (ref = this).on.apply(ref, args);
    var ref;
};

/**
 * @class RiotX
 */
var RiotX = function RiotX() {
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
  var riotxChange = function (store, evtName) {
    var args = [], len = arguments.length - 2;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 2 ];

    this._riotx_change_handlers.push({
      store: store,
      evtName: evtName
    });
    args.unshift(evtName);
    store.change.apply(store, args);
  };

  // register a mixin globally.
  riot.mixin({
    // intendedly use `function`.
    // switch the context of `this` from `riotx` to `riot tag instance`.
    init: function () {
      var this$1 = this;

      // the context of `this` will be equal to riot tag instant.
      this.on('unmount', function () {
        this$1.off('*');
        forEach_1(this$1._riotx_change_handlers, function (obj) {
          obj.store.off(obj.evtName);
        });
        delete this$1.riotx;
        delete this$1._riotx_change_handlers;
        delete this$1[settings.changeBindName];
      });

      if (settings.debug) {
        this.on('*', function (eventName) {
          debug('[riot.mixin]', eventName, this$1);
        });
      }

      // let users set the name.
      this[settings.changeBindName] = riotxChange;
    },
    // give each riot instance the ability to access the globally defined singleton RiotX instance.
    riotx: this,
    _riotx_change_handlers: []
  });
};

/**
 * Add a store instance
 * @param {RiotX.Store} store instance of RiotX.Store
 * @memberof RiotX
 * @returns {RiotX}
 */
RiotX.prototype.add = function add (store) {
  if (this.stores[store.name]) {
    error(("[store.add] The store instance named `" + (store.name) + "` already exists."));
  }

  this.stores[store.name] = store;
  return this;
};

/**
 * Get store instance
 * @param {String} name store name
 * @memberof RiotX
 * @returns {RiotX.Store} store instance
 */
RiotX.prototype.get = function get (name) {
    if ( name === void 0 ) name = settings.default;

  return this.stores[name];
};

/**
 * Set debug flag
 * @param {boolean} flag
 * @memberof RiotX
 * @returns {RiotX}
 */
RiotX.prototype.debug = function debug (flag) {
  settings.debug = !!flag;
  return this;
};

/**
 * Set function name to bind store change event.
 * @param {String} name
 * @memberof RiotX
 * @returns {RiotX}
 */
RiotX.prototype.setChangeBindName = function setChangeBindName (name) {
  settings.changeBindName = name;
  return this;
};

/**
 * Directly changing the state property from outside will occur an exception.
 * You can change it through “mutations”, or you can get it via “getters”.
 * @param {boolean} flag
 * @memberof RiotX
 * @returns {RiotX}
 */
RiotX.prototype.strict = function strict (flag) {
  settings.strict = !!flag;
  return this;
};

/**
 *
 *
 * @param {Function} fn @see function _output
 * @returns Riotx
 * @memberof RiotX
 */
RiotX.prototype.logger = function logger (fn) {
  settings.logger.output = fn;
  return this;
};

/**
 * Reset all store instances at once.
 * @memberof RiotX
 * @returns {RiotX} instance
 */
RiotX.prototype.reset = function reset () {
  forOwn_1(this.stores || {}, function (store) {
    store.reset();
  });
  this.stores = {};
  return this;
};

/**
 * Store's count
 * @memberof RiotX
 * @returns {int} size
 */
RiotX.prototype.size = function size () {
  return keys_1(this.stores).length;
};

var index = new RiotX();

export default index;
