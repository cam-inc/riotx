/* riotx version 0.9.3 */
var riotx = (function (riot) {
'use strict';

var VERSION = "0.9.3";

riot = 'default' in riot ? riot['default'] : riot;

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

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var index$1 = shouldUseNative() ? Object.assign : function (target, source) {
	var arguments$1 = arguments;

	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments$1[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var promise = createCommonjsModule(function (module) {
(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') { throw new TypeError('Promises must be constructed via new'); }
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
    Promise._immediateFn(function () {
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
      if (newValue === self) { throw new TypeError('A promise cannot be resolved with itself.'); }
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
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
      fn(function (value) {
        if (done) { return; }
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) { return; }
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) { return; }
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) { return resolve([]); }
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
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

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if ('object' !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(commonjsGlobal);
});

/**
 * settings for riotx
 * @type {{debug: boolean, default: string}}
 */
var settings = {
  debug: false,
  default: '@',
  changeBindName: 'riotxChange'
};

/**
 * log output
 */
var log = function () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

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


var Store = function Store(_store) {
  /**
   * name of the store.
   * @type {String}
   */
  this.name = _store.name;
  if (!this.name) {
    this.name = settings.default;
    log(("Default store name. name=" + (this.name)));
  }

  /**
   * a object that represents full application state.
   * @type {Object}
   */
  this.state = index$1({}, _store.state);

  /**
   * functions to mutate application state.
   * @type {Object}
   */
  this._actions = index$1({}, _store.actions);

  /**
   * mutaions.
   * mutaion = a function which mutates the state.
   * all mutation functions take two parameters which are `state` and `obj`.
   * `state` will be TODO.
   * `obj` will be TODO.
   * @type {Object}
   */
  this._mutations = index$1({}, _store.mutations);

  /**
   * functions to get data from states.
   * @type {Object}
   */
  this._getters = index$1({}, _store.getters);

  riot.observable(this);
};

/**
 * Getter state
 * @param {String} name TODO
 * @param {...*} args
 */
Store.prototype.getter = function getter (name) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  log('[getter]', name, args);
  var context = {
    state : index$1({}, this.state)
  };
  return this._getters[name].apply(null, [context ].concat( args));
};

/**
 * Commit mutation.
 * only actions are allowed to execute this function.
 * @param {String} name mutation name
 * @param {...*} args
 */
Store.prototype.commit = function commit (name) {
    var this$1 = this;
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var _state = index$1({}, this.state);
  log.apply(void 0, [ '[commit(before)]', name, _state ].concat( args ));
  var context = {
    getter: function (name) {
        var args = [], len = arguments.length - 1;
        while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

      return this$1.getter.apply(this$1, [name ].concat( args));
    },
    state : _state
  };
  var triggers = this._mutations[name].apply(null, [context ].concat( args));
  log.apply(void 0, [ '[commit(after)]', name, _state ].concat( args ));
  index$1(this.state, _state);

  forEach_1(triggers, function (v) {
    // this.trigger(v, null, this.state, this);
    this$1.trigger(v, this$1.state, this$1);
  });
};

/**
 * emit action.
 * only ui components are allowed to execute this function.
 * @param {Stting} name action name
 * @param {...*} args parameter's to action
 * @return {Promise}
 */
Store.prototype.action = function action (name) {
    var this$1 = this;
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  log('[action]', name, args);

  var context = {
    getter: function (name) {
        var args = [], len = arguments.length - 1;
        while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

      return this$1.getter.apply(this$1, [name ].concat( args));
    },
    state: index$1({}, this.state),
    commit: function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

      (ref = this$1).commit.apply(ref, args);
        var ref;
    }
  };
  return promise
    .resolve()
    .then(function () { return this$1._actions[name].apply(null, [context ].concat( args)); });
};

/**
 * shorthand for `store.on('event', () => {})`.
 * @param {...*} args
 */
Store.prototype.change = function change () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

  (ref = this).on.apply(ref, args);
    var ref;
};

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
  var riotxChange = function(store, evtName) {
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
          log(eventName, this$1);
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
 * @returns {RiotX}
 */
RiotX.prototype.add = function add (store) {
  if (this.stores[store.name]) {
    throw new Error(("The store instance named `" + (store.name) + "` already exists."));
  }

  this.stores[store.name] = store;
  return this;
};

/**
 * Get store instance
 * @param {String} name store name
 * @returns {RiotX.Store} store instance
 */
RiotX.prototype.get = function get (name) {
    if ( name === void 0 ) name = settings.default;

  return this.stores[name];
};

/**
 * Set debug flag
 * @param flag
 * @returns {RiotX}
 */
RiotX.prototype.debug = function debug (flag) {
  settings.debug = !!flag;
  return this;
};

/**
 * Set function name to bind store change event.
 * @param {String} name
 * @returns {RiotX}
 */
RiotX.prototype.setChangeBindName = function setChangeBindName (name) {
  settings.changeBindName = name;
  return this;
};

/**
 * Reset riotx instance
 * @returns {RiotX} instance
 */
RiotX.prototype.reset = function reset () {
  this.stores = {};
  return this;
};

/**
 * Store's count
 * @returns {int} size
 */
RiotX.prototype.size = function size () {
  return keys_1(this.stores).length;
};

var index = new RiotX();

return index;

}(riot));
