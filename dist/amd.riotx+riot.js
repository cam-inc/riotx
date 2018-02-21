/* riotx version 2.0.0, riot version ^3.8.1 */
define(function () { 'use strict';

var VERSION = "2.0.0";

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

var __TAGS_CACHE = [];
var __TAG_IMPL = {};
var YIELD_TAG = 'yield';
var GLOBAL_MIXIN = '__global_mixin';
var ATTRS_PREFIX = 'riot-';
var REF_DIRECTIVES = ['ref', 'data-ref'];
var IS_DIRECTIVE = 'data-is';
var CONDITIONAL_DIRECTIVE = 'if';
var LOOP_DIRECTIVE = 'each';
var LOOP_NO_REORDER_DIRECTIVE = 'no-reorder';
var SHOW_DIRECTIVE = 'show';
var HIDE_DIRECTIVE = 'hide';
var KEY_DIRECTIVE = 'key';
var RIOT_EVENTS_KEY = '__riot-events__';
var T_STRING = 'string';
var T_OBJECT = 'object';
var T_UNDEF  = 'undefined';
var T_FUNCTION = 'function';
var XLINK_NS = 'http://www.w3.org/1999/xlink';
var SVG_NS = 'http://www.w3.org/2000/svg';
var XLINK_REGEX = /^xlink:(\w+)/;
var WIN = typeof window === T_UNDEF ? undefined : window;
var RE_SPECIAL_TAGS = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?|opt(?:ion|group))$/;
var RE_SPECIAL_TAGS_NO_OPTION = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?)$/;
var RE_EVENTS_PREFIX = /^on/;
var RE_HTML_ATTRS = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g;
var CASE_SENSITIVE_ATTRIBUTES = {
    'viewbox': 'viewBox',
    'preserveaspectratio': 'preserveAspectRatio'
  };
var RE_BOOL_ATTRS = /^(?:disabled|checked|readonly|required|allowfullscreen|auto(?:focus|play)|compact|controls|default|formnovalidate|hidden|ismap|itemscope|loop|multiple|muted|no(?:resize|shade|validate|wrap)?|open|reversed|seamless|selected|sortable|truespeed|typemustmatch)$/;
var IE_VERSION = (WIN && WIN.document || {}).documentMode | 0;

/**
 * Shorter and fast way to select multiple nodes in the DOM
 * @param   { String } selector - DOM selector
 * @param   { Object } ctx - DOM node where the targets of our search will is located
 * @returns { Object } dom nodes found
 */
function $$(selector, ctx) {
  return [].slice.call((ctx || document).querySelectorAll(selector))
}

/**
 * Shorter and fast way to select a single node in the DOM
 * @param   { String } selector - unique dom selector
 * @param   { Object } ctx - DOM node where the target of our search will is located
 * @returns { Object } dom node found
 */
function $(selector, ctx) {
  return (ctx || document).querySelector(selector)
}

/**
 * Create a document fragment
 * @returns { Object } document fragment
 */
function createFrag() {
  return document.createDocumentFragment()
}

/**
 * Create a document text node
 * @returns { Object } create a text node to use as placeholder
 */
function createDOMPlaceholder() {
  return document.createTextNode('')
}

/**
 * Check if a DOM node is an svg tag or part of an svg
 * @param   { HTMLElement }  el - node we want to test
 * @returns {Boolean} true if it's an svg node
 */
function isSvg(el) {
  var owner = el.ownerSVGElement;
  return !!owner || owner === null
}

/**
 * Create a generic DOM node
 * @param   { String } name - name of the DOM node we want to create
 * @returns { Object } DOM node just created
 */
function mkEl(name) {
  return name === 'svg' ? document.createElementNS(SVG_NS, name) : document.createElement(name)
}

/**
 * Set the inner html of any DOM node SVGs included
 * @param { Object } container - DOM node where we'll inject new html
 * @param { String } html - html to inject
 * @param { Boolean } isSvg - svg tags should be treated a bit differently
 */
/* istanbul ignore next */
function setInnerHTML(container, html, isSvg) {
  // innerHTML is not supported on svg tags so we neet to treat them differently
  if (isSvg) {
    var node = container.ownerDocument.importNode(
      new DOMParser()
        .parseFromString(("<svg xmlns=\"" + SVG_NS + "\">" + html + "</svg>"), 'application/xml')
        .documentElement,
      true
    );

    container.appendChild(node);
  } else {
    container.innerHTML = html;
  }
}

/**
 * Toggle the visibility of any DOM node
 * @param   { Object }  dom - DOM node we want to hide
 * @param   { Boolean } show - do we want to show it?
 */

function toggleVisibility(dom, show) {
  dom.style.display = show ? '' : 'none';
  dom.hidden = show ? false : true;
}

/**
 * Remove any DOM attribute from a node
 * @param   { Object } dom - DOM node we want to update
 * @param   { String } name - name of the property we want to remove
 */
function remAttr(dom, name) {
  dom.removeAttribute(name);
}

/**
 * Convert a style object to a string
 * @param   { Object } style - style object we need to parse
 * @returns { String } resulting css string
 * @example
 * styleObjectToString({ color: 'red', height: '10px'}) // => 'color: red; height: 10px'
 */
function styleObjectToString(style) {
  return Object.keys(style).reduce(function (acc, prop) {
    return (acc + " " + prop + ": " + (style[prop]) + ";")
  }, '')
}

/**
 * Get the value of any DOM attribute on a node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { String } name - name of the attribute we want to get
 * @returns { String | undefined } name of the node attribute whether it exists
 */
function getAttr(dom, name) {
  return dom.getAttribute(name)
}

/**
 * Set any DOM attribute
 * @param { Object } dom - DOM node we want to update
 * @param { String } name - name of the property we want to set
 * @param { String } val - value of the property we want to set
 */
function setAttr(dom, name, val) {
  var xlink = XLINK_REGEX.exec(name);
  if (xlink && xlink[1])
    { dom.setAttributeNS(XLINK_NS, xlink[1], val); }
  else
    { dom.setAttribute(name, val); }
}

/**
 * Insert safely a tag to fix #1962 #1649
 * @param   { HTMLElement } root - children container
 * @param   { HTMLElement } curr - node to insert
 * @param   { HTMLElement } next - node that should preceed the current node inserted
 */
function safeInsert(root, curr, next) {
  root.insertBefore(curr, next.parentNode && next);
}

/**
 * Minimize risk: only zero or one _space_ between attr & value
 * @param   { String }   html - html string we want to parse
 * @param   { Function } fn - callback function to apply on any attribute found
 */
function walkAttrs(html, fn) {
  if (!html) { return }
  var m;
  while (m = RE_HTML_ATTRS.exec(html))
    { fn(m[1].toLowerCase(), m[2] || m[3] || m[4]); }
}

/**
 * Walk down recursively all the children tags starting dom node
 * @param   { Object }   dom - starting node where we will start the recursion
 * @param   { Function } fn - callback to transform the child node just found
 * @param   { Object }   context - fn can optionally return an object, which is passed to children
 */
function walkNodes(dom, fn, context) {
  if (dom) {
    var res = fn(dom, context);
    var next;
    // stop the recursion
    if (res === false) { return }

    dom = dom.firstChild;

    while (dom) {
      next = dom.nextSibling;
      walkNodes(dom, fn, res);
      dom = next;
    }
  }
}

var dom = Object.freeze({
	$$: $$,
	$: $,
	createFrag: createFrag,
	createDOMPlaceholder: createDOMPlaceholder,
	isSvg: isSvg,
	mkEl: mkEl,
	setInnerHTML: setInnerHTML,
	toggleVisibility: toggleVisibility,
	remAttr: remAttr,
	styleObjectToString: styleObjectToString,
	getAttr: getAttr,
	setAttr: setAttr,
	safeInsert: safeInsert,
	walkAttrs: walkAttrs,
	walkNodes: walkNodes
});

var styleNode;
// Create cache and shortcut to the correct property
var cssTextProp;
var byName = {};
var remainder = [];
var needsInject = false;

// skip the following code on the server
if (WIN) {
  styleNode = ((function () {
    // create a new style element with the correct type
    var newNode = mkEl('style');
    // replace any user node or insert the new one into the head
    var userNode = $('style[type=riot]');

    setAttr(newNode, 'type', 'text/css');
    /* istanbul ignore next */
    if (userNode) {
      if (userNode.id) { newNode.id = userNode.id; }
      userNode.parentNode.replaceChild(newNode, userNode);
    } else { document.head.appendChild(newNode); }

    return newNode
  }))();
  cssTextProp = styleNode.styleSheet;
}

/**
 * Object that will be used to inject and manage the css of every tag instance
 */
var styleManager = {
  styleNode: styleNode,
  /**
   * Save a tag style to be later injected into DOM
   * @param { String } css - css string
   * @param { String } name - if it's passed we will map the css to a tagname
   */
  add: function add(css, name) {
    if (name) { byName[name] = css; }
    else { remainder.push(css); }
    needsInject = true;
  },
  /**
   * Inject all previously saved tag styles into DOM
   * innerHTML seems slow: http://jsperf.com/riot-insert-style
   */
  inject: function inject() {
    if (!WIN || !needsInject) { return }
    needsInject = false;
    var style = Object.keys(byName)
      .map(function (k) { return byName[k]; })
      .concat(remainder).join('\n');
    /* istanbul ignore next */
    if (cssTextProp) { cssTextProp.cssText = style; }
    else { styleNode.innerHTML = style; }
  }
}

/**
 * The riot template engine
 * @version v3.0.8
 */

var skipRegex = (function () { //eslint-disable-line no-unused-vars

  var beforeReChars = '[{(,;:?=|&!^~>%*/';

  var beforeReWords = [
    'case',
    'default',
    'do',
    'else',
    'in',
    'instanceof',
    'prefix',
    'return',
    'typeof',
    'void',
    'yield'
  ];

  var wordsLastChar = beforeReWords.reduce(function (s, w) {
    return s + w.slice(-1)
  }, '');

  var RE_REGEX = /^\/(?=[^*>/])[^[/\\]*(?:(?:\\.|\[(?:\\.|[^\]\\]*)*\])[^[\\/]*)*?\/[gimuy]*/;
  var RE_VN_CHAR = /[$\w]/;

  function prev (code, pos) {
    while (--pos >= 0 && /\s/.test(code[pos])){  }
    return pos
  }

  function _skipRegex (code, start) {

    var re = /.*/g;
    var pos = re.lastIndex = start++;
    var match = re.exec(code)[0].match(RE_REGEX);

    if (match) {
      var next = pos + match[0].length;

      pos = prev(code, pos);
      var c = code[pos];

      if (pos < 0 || ~beforeReChars.indexOf(c)) {
        return next
      }

      if (c === '.') {

        if (code[pos - 1] === '.') {
          start = next;
        }

      } else if (c === '+' || c === '-') {

        if (code[--pos] !== c ||
            (pos = prev(code, pos)) < 0 ||
            !RE_VN_CHAR.test(code[pos])) {
          start = next;
        }

      } else if (~wordsLastChar.indexOf(c)) {

        var end = pos + 1;

        while (--pos >= 0 && RE_VN_CHAR.test(code[pos])){  }
        if (~beforeReWords.indexOf(code.slice(pos + 1, end))) {
          start = next;
        }
      }
    }

    return start
  }

  return _skipRegex

})();

/**
 * riot.util.brackets
 *
 * - `brackets    ` - Returns a string or regex based on its parameter
 * - `brackets.set` - Change the current riot brackets
 *
 * @module
 */

/* global riot */

var brackets = (function (UNDEF) {

  var
    REGLOB = 'g',

    R_MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,

    R_STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|`[^`\\]*(?:\\[\S\s][^`\\]*)*`/g,

    S_QBLOCKS = R_STRINGS.source + '|' +
      /(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source + '|' +
      /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?([^<]\/)[gim]*/.source,

    UNSUPPORTED = RegExp('[\\' + 'x00-\\x1F<>a-zA-Z0-9\'",;\\\\]'),

    NEED_ESCAPE = /(?=[[\]()*+?.^$|])/g,

    S_QBLOCK2 = R_STRINGS.source + '|' + /(\/)(?![*\/])/.source,

    FINDBRACES = {
      '(': RegExp('([()])|'   + S_QBLOCK2, REGLOB),
      '[': RegExp('([[\\]])|' + S_QBLOCK2, REGLOB),
      '{': RegExp('([{}])|'   + S_QBLOCK2, REGLOB)
    },

    DEFAULT = '{ }';

  var _pairs = [
    '{', '}',
    '{', '}',
    /{[^}]*}/,
    /\\([{}])/g,
    /\\({)|{/g,
    RegExp('\\\\(})|([[({])|(})|' + S_QBLOCK2, REGLOB),
    DEFAULT,
    /^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S.*)\s*}/,
    /(^|[^\\]){=[\S\s]*?}/
  ];

  var
    cachedBrackets = UNDEF,
    _regex,
    _cache = [],
    _settings;

  function _loopback (re) { return re }

  function _rewrite (re, bp) {
    if (!bp) { bp = _cache; }
    return new RegExp(
      re.source.replace(/{/g, bp[2]).replace(/}/g, bp[3]), re.global ? REGLOB : ''
    )
  }

  function _create (pair) {
    if (pair === DEFAULT) { return _pairs }

    var arr = pair.split(' ');

    if (arr.length !== 2 || UNSUPPORTED.test(pair)) {
      throw new Error('Unsupported brackets "' + pair + '"')
    }
    arr = arr.concat(pair.replace(NEED_ESCAPE, '\\').split(' '));

    arr[4] = _rewrite(arr[1].length > 1 ? /{[\S\s]*?}/ : _pairs[4], arr);
    arr[5] = _rewrite(pair.length > 3 ? /\\({|})/g : _pairs[5], arr);
    arr[6] = _rewrite(_pairs[6], arr);
    arr[7] = RegExp('\\\\(' + arr[3] + ')|([[({])|(' + arr[3] + ')|' + S_QBLOCK2, REGLOB);
    arr[8] = pair;
    return arr
  }

  function _brackets (reOrIdx) {
    return reOrIdx instanceof RegExp ? _regex(reOrIdx) : _cache[reOrIdx]
  }

  _brackets.split = function split (str, tmpl, _bp) {
    // istanbul ignore next: _bp is for the compiler
    if (!_bp) { _bp = _cache; }

    var
      parts = [],
      match,
      isexpr,
      start,
      pos,
      re = _bp[6];

    var qblocks = [];
    var prevStr = '';
    var mark, lastIndex;

    isexpr = start = re.lastIndex = 0;

    while ((match = re.exec(str))) {

      lastIndex = re.lastIndex;
      pos = match.index;

      if (isexpr) {

        if (match[2]) {

          var ch = match[2];
          var rech = FINDBRACES[ch];
          var ix = 1;

          rech.lastIndex = lastIndex;
          while ((match = rech.exec(str))) {
            if (match[1]) {
              if (match[1] === ch) { ++ix; }
              else if (!--ix) { break }
            } else {
              rech.lastIndex = pushQBlock(match.index, rech.lastIndex, match[2]);
            }
          }
          re.lastIndex = ix ? str.length : rech.lastIndex;
          continue
        }

        if (!match[3]) {
          re.lastIndex = pushQBlock(pos, lastIndex, match[4]);
          continue
        }
      }

      if (!match[1]) {
        unescapeStr(str.slice(start, pos));
        start = re.lastIndex;
        re = _bp[6 + (isexpr ^= 1)];
        re.lastIndex = start;
      }
    }

    if (str && start < str.length) {
      unescapeStr(str.slice(start));
    }

    parts.qblocks = qblocks;

    return parts

    function unescapeStr (s) {
      if (prevStr) {
        s = prevStr + s;
        prevStr = '';
      }
      if (tmpl || isexpr) {
        parts.push(s && s.replace(_bp[5], '$1'));
      } else {
        parts.push(s);
      }
    }

    function pushQBlock(_pos, _lastIndex, slash) { //eslint-disable-line
      if (slash) {
        _lastIndex = skipRegex(str, _pos);
      }

      if (tmpl && _lastIndex > _pos + 2) {
        mark = '\u2057' + qblocks.length + '~';
        qblocks.push(str.slice(_pos, _lastIndex));
        prevStr += str.slice(start, _pos) + mark;
        start = _lastIndex;
      }
      return _lastIndex
    }
  };

  _brackets.hasExpr = function hasExpr (str) {
    return _cache[4].test(str)
  };

  _brackets.loopKeys = function loopKeys (expr) {
    var m = expr.match(_cache[9]);

    return m
      ? { key: m[1], pos: m[2], val: _cache[0] + m[3].trim() + _cache[1] }
      : { val: expr.trim() }
  };

  _brackets.array = function array (pair) {
    return pair ? _create(pair) : _cache
  };

  function _reset (pair) {
    if ((pair || (pair = DEFAULT)) !== _cache[8]) {
      _cache = _create(pair);
      _regex = pair === DEFAULT ? _loopback : _rewrite;
      _cache[9] = _regex(_pairs[9]);
    }
    cachedBrackets = pair;
  }

  function _setSettings (o) {
    var b;

    o = o || {};
    b = o.brackets;
    Object.defineProperty(o, 'brackets', {
      set: _reset,
      get: function () { return cachedBrackets },
      enumerable: true
    });
    _settings = o;
    _reset(b);
  }

  Object.defineProperty(_brackets, 'settings', {
    set: _setSettings,
    get: function () { return _settings }
  });

  /* istanbul ignore next: in the browser riot is always in the scope */
  _brackets.settings = typeof riot !== 'undefined' && riot.settings || {};
  _brackets.set = _reset;
  _brackets.skipRegex = skipRegex;

  _brackets.R_STRINGS = R_STRINGS;
  _brackets.R_MLCOMMS = R_MLCOMMS;
  _brackets.S_QBLOCKS = S_QBLOCKS;
  _brackets.S_QBLOCK2 = S_QBLOCK2;

  return _brackets

})();

/**
 * @module tmpl
 *
 * tmpl          - Root function, returns the template value, render with data
 * tmpl.hasExpr  - Test the existence of a expression inside a string
 * tmpl.loopKeys - Get the keys for an 'each' loop (used by `_each`)
 */

var tmpl = (function () {

  var _cache = {};

  function _tmpl (str, data) {
    if (!str) { return str }

    return (_cache[str] || (_cache[str] = _create(str))).call(
      data, _logErr.bind({
        data: data,
        tmpl: str
      })
    )
  }

  _tmpl.hasExpr = brackets.hasExpr;

  _tmpl.loopKeys = brackets.loopKeys;

  // istanbul ignore next
  _tmpl.clearCache = function () { _cache = {}; };

  _tmpl.errorHandler = null;

  function _logErr (err, ctx) {

    err.riotData = {
      tagName: ctx && ctx.__ && ctx.__.tagName,
      _riot_id: ctx && ctx._riot_id  //eslint-disable-line camelcase
    };

    if (_tmpl.errorHandler) { _tmpl.errorHandler(err); }
    else if (
      typeof console !== 'undefined' &&
      typeof console.error === 'function'
    ) {
      console.error(err.message);
      console.log('<%s> %s', err.riotData.tagName || 'Unknown tag', this.tmpl); // eslint-disable-line
      console.log(this.data); // eslint-disable-line
    }
  }

  function _create (str) {
    var expr = _getTmpl(str);

    if (expr.slice(0, 11) !== 'try{return ') { expr = 'return ' + expr; }

    return new Function('E', expr + ';')    // eslint-disable-line no-new-func
  }

  var RE_DQUOTE = /\u2057/g;
  var RE_QBMARK = /\u2057(\d+)~/g;

  function _getTmpl (str) {
    var parts = brackets.split(str.replace(RE_DQUOTE, '"'), 1);
    var qstr = parts.qblocks;
    var expr;

    if (parts.length > 2 || parts[0]) {
      var i, j, list = [];

      for (i = j = 0; i < parts.length; ++i) {

        expr = parts[i];

        if (expr && (expr = i & 1

            ? _parseExpr(expr, 1, qstr)

            : '"' + expr
                .replace(/\\/g, '\\\\')
                .replace(/\r\n?|\n/g, '\\n')
                .replace(/"/g, '\\"') +
              '"'

          )) { list[j++] = expr; }

      }

      expr = j < 2 ? list[0]
           : '[' + list.join(',') + '].join("")';

    } else {

      expr = _parseExpr(parts[1], 0, qstr);
    }

    if (qstr.length) {
      expr = expr.replace(RE_QBMARK, function (_, pos) {
        return qstr[pos]
          .replace(/\r/g, '\\r')
          .replace(/\n/g, '\\n')
      });
    }
    return expr
  }

  var RE_CSNAME = /^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\u2057(\d+)~):/;
  var
    RE_BREND = {
      '(': /[()]/g,
      '[': /[[\]]/g,
      '{': /[{}]/g
    };

  function _parseExpr (expr, asText, qstr) {

    expr = expr
      .replace(/\s+/g, ' ').trim()
      .replace(/\ ?([[\({},?\.:])\ ?/g, '$1');

    if (expr) {
      var
        list = [],
        cnt = 0,
        match;

      while (expr &&
            (match = expr.match(RE_CSNAME)) &&
            !match.index
        ) {
        var
          key,
          jsb,
          re = /,|([[{(])|$/g;

        expr = RegExp.rightContext;
        key  = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1];

        while (jsb = (match = re.exec(expr))[1]) { skipBraces(jsb, re); }

        jsb  = expr.slice(0, match.index);
        expr = RegExp.rightContext;

        list[cnt++] = _wrapExpr(jsb, 1, key);
      }

      expr = !cnt ? _wrapExpr(expr, asText)
           : cnt > 1 ? '[' + list.join(',') + '].join(" ").trim()' : list[0];
    }
    return expr

    function skipBraces (ch, re) {
      var
        mm,
        lv = 1,
        ir = RE_BREND[ch];

      ir.lastIndex = re.lastIndex;
      while (mm = ir.exec(expr)) {
        if (mm[0] === ch) { ++lv; }
        else if (!--lv) { break }
      }
      re.lastIndex = lv ? expr.length : ir.lastIndex;
    }
  }

  // istanbul ignore next: not both
  var // eslint-disable-next-line max-len
    JS_CONTEXT = '"in this?this:' + (typeof window !== 'object' ? 'global' : 'window') + ').',
    JS_VARNAME = /[,{][\$\w]+(?=:)|(^ *|[^$\w\.{])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g,
    JS_NOPROPS = /^(?=(\.[$\w]+))\1(?:[^.[(]|$)/;

  function _wrapExpr (expr, asText, key) {
    var tb;

    expr = expr.replace(JS_VARNAME, function (match, p, mvar, pos, s) {
      if (mvar) {
        pos = tb ? 0 : pos + match.length;

        if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
          match = p + '("' + mvar + JS_CONTEXT + mvar;
          if (pos) { tb = (s = s[pos]) === '.' || s === '(' || s === '['; }
        } else if (pos) {
          tb = !JS_NOPROPS.test(s.slice(pos));
        }
      }
      return match
    });

    if (tb) {
      expr = 'try{return ' + expr + '}catch(e){E(e,this)}';
    }

    if (key) {

      expr = (tb
          ? 'function(){' + expr + '}.call(this)' : '(' + expr + ')'
        ) + '?"' + key + '":""';

    } else if (asText) {

      expr = 'function(v){' + (tb
          ? expr.replace('return ', 'v=') : 'v=(' + expr + ')'
        ) + ';return v||v===0?v:""}.call(this)';
    }

    return expr
  }

  _tmpl.version = brackets.version = 'v3.0.8';

  return _tmpl

})();

var observable = function(el) {

  /**
   * Extend the original object or create a new empty one
   * @type { Object }
   */

  el = el || {};

  /**
   * Private variables
   */
  var callbacks = {},
    slice = Array.prototype.slice;

  /**
   * Public Api
   */

  // extend the el object adding the observable methods
  Object.defineProperties(el, {
    /**
     * Listen to the given `event` ands
     * execute the `callback` each time an event is triggered.
     * @param  { String } event - event id
     * @param  { Function } fn - callback function
     * @returns { Object } el
     */
    on: {
      value: function(event, fn) {
        if (typeof fn == 'function')
          { (callbacks[event] = callbacks[event] || []).push(fn); }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Removes the given `event` listeners
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    off: {
      value: function(event, fn) {
        if (event == '*' && !fn) { callbacks = {}; }
        else {
          if (fn) {
            var arr = callbacks[event];
            for (var i = 0, cb; cb = arr && arr[i]; ++i) {
              if (cb == fn) { arr.splice(i--, 1); }
            }
          } else { delete callbacks[event]; }
        }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Listen to the given `event` and
     * execute the `callback` at most once
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    one: {
      value: function(event, fn) {
        function on() {
          el.off(event, on);
          fn.apply(el, arguments);
        }
        return el.on(event, on)
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Execute all callback functions that listen to
     * the given `event`
     * @param   { String } event - event id
     * @returns { Object } el
     */
    trigger: {
      value: function(event) {
        var arguments$1 = arguments;


        // getting the arguments
        var arglen = arguments.length - 1,
          args = new Array(arglen),
          fns,
          fn,
          i;

        for (i = 0; i < arglen; i++) {
          args[i] = arguments$1[i + 1]; // skip first argument
        }

        fns = slice.call(callbacks[event] || [], 0);

        for (i = 0; fn = fns[i]; ++i) {
          fn.apply(el, args);
        }

        if (callbacks['*'] && event != '*')
          { el.trigger.apply(el, ['*', event].concat(args)); }

        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    }
  });

  return el

};

/**
 * Check if the passed argument is a boolean attribute
 * @param   { String } value -
 * @returns { Boolean } -
 */
function isBoolAttr(value) {
  return RE_BOOL_ATTRS.test(value)
}

/**
 * Check if passed argument is a function
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isFunction$2(value) {
  return typeof value === T_FUNCTION
}

/**
 * Check if passed argument is an object, exclude null
 * NOTE: use isObject(x) && !isArray(x) to excludes arrays.
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isObject$2(value) {
  return value && typeof value === T_OBJECT // typeof null is 'object'
}

/**
 * Check if passed argument is undefined
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isUndefined(value) {
  return typeof value === T_UNDEF
}

/**
 * Check if passed argument is a string
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isString(value) {
  return typeof value === T_STRING
}

/**
 * Check if passed argument is empty. Different from falsy, because we dont consider 0 or false to be blank
 * @param { * } value -
 * @returns { Boolean } -
 */
function isBlank(value) {
  return isNil(value) || value === ''
}

/**
 * Check against the null and undefined values
 * @param   { * }  value -
 * @returns {Boolean} -
 */
function isNil(value) {
  return isUndefined(value) || value === null
}

/**
 * Check if passed argument is a kind of array
 * @param   { * } value -
 * @returns { Boolean } -
 */
function isArray(value) {
  return Array.isArray(value) || value instanceof Array
}

/**
 * Check whether object's property could be overridden
 * @param   { Object }  obj - source object
 * @param   { String }  key - object property
 * @returns { Boolean } true if writable
 */
function isWritable(obj, key) {
  var descriptor = getPropDescriptor(obj, key);
  return isUndefined(obj[key]) || descriptor && descriptor.writable
}


var check = Object.freeze({
	isBoolAttr: isBoolAttr,
	isFunction: isFunction$2,
	isObject: isObject$2,
	isUndefined: isUndefined,
	isString: isString,
	isBlank: isBlank,
	isNil: isNil,
	isArray: isArray,
	isWritable: isWritable
});

/**
 * Specialized function for looping an array-like collection with `each={}`
 * @param   { Array } list - collection of items
 * @param   {Function} fn - callback function
 * @returns { Array } the array looped
 */
function each(list, fn) {
  var len = list ? list.length : 0;
  var i = 0;
  for (; i < len; i++) { fn(list[i], i); }
  return list
}

/**
 * Check whether an array contains an item
 * @param   { Array } array - target array
 * @param   { * } item - item to test
 * @returns { Boolean } -
 */
function contains(array, item) {
  return array.indexOf(item) !== -1
}

/**
 * Convert a string containing dashes to camel case
 * @param   { String } str - input string
 * @returns { String } my-string -> myString
 */
function toCamel(str) {
  return str.replace(/-(\w)/g, function (_, c) { return c.toUpperCase(); })
}

/**
 * Faster String startsWith alternative
 * @param   { String } str - source string
 * @param   { String } value - test string
 * @returns { Boolean } -
 */
function startsWith(str, value) {
  return str.slice(0, value.length) === value
}

/**
 * Helper function to set an immutable property
 * @param   { Object } el - object where the new property will be set
 * @param   { String } key - object key where the new property will be stored
 * @param   { * } value - value of the new property
 * @param   { Object } options - set the propery overriding the default options
 * @returns { Object } - the initial object
 */
function defineProperty(el, key, value, options) {
  Object.defineProperty(el, key, extend({
    value: value,
    enumerable: false,
    writable: false,
    configurable: true
  }, options));
  return el
}

/**
 * Function returning always a unique identifier
 * @returns { Number } - number from 0...n
 */
var uid = (function() {
  var i = -1;
  return function () { return ++i; }
})();


/**
 * Warn a message via console
 * @param   {String} message - warning message
 */
function warn(message) {
  if (console && console.warn) { console.warn(message); }
}

/**
 * Short alias for Object.getOwnPropertyDescriptor
 */
var getPropDescriptor = function (o, k) { return Object.getOwnPropertyDescriptor(o, k); };

/**
 * Extend any object with other properties
 * @param   { Object } src - source object
 * @returns { Object } the resulting extended object
 *
 * var obj = { foo: 'baz' }
 * extend(obj, {bar: 'bar', foo: 'bar'})
 * console.log(obj) => {bar: 'bar', foo: 'bar'}
 *
 */
function extend(src) {
  var obj;
  var i = 1;
  var args = arguments;
  var l = args.length;

  for (; i < l; i++) {
    if (obj = args[i]) {
      for (var key in obj) {
        // check if this property of the source object could be overridden
        if (isWritable(src, key))
          { src[key] = obj[key]; }
      }
    }
  }
  return src
}

var misc = Object.freeze({
	each: each,
	contains: contains,
	toCamel: toCamel,
	startsWith: startsWith,
	defineProperty: defineProperty,
	uid: uid,
	warn: warn,
	getPropDescriptor: getPropDescriptor,
	extend: extend
});

var settings = extend(Object.create(brackets.settings), {
  skipAnonymousTags: true,
  // handle the auto updates on any DOM event
  autoUpdate: true
})

/**
 * Trigger DOM events
 * @param   { HTMLElement } dom - dom element target of the event
 * @param   { Function } handler - user function
 * @param   { Object } e - event object
 */
function handleEvent(dom, handler, e) {
  var ptag = this.__.parent;
  var item = this.__.item;

  if (!item)
    { while (ptag && !item) {
      item = ptag.__.item;
      ptag = ptag.__.parent;
    } }

  // override the event properties
  /* istanbul ignore next */
  if (isWritable(e, 'currentTarget')) { e.currentTarget = dom; }
  /* istanbul ignore next */
  if (isWritable(e, 'target')) { e.target = e.srcElement; }
  /* istanbul ignore next */
  if (isWritable(e, 'which')) { e.which = e.charCode || e.keyCode; }

  e.item = item;

  handler.call(this, e);

  // avoid auto updates
  if (!settings.autoUpdate) { return }

  if (!e.preventUpdate) {
    var p = getImmediateCustomParentTag(this);
    // fixes #2083
    if (p.isMounted) { p.update(); }
  }
}

/**
 * Attach an event to a DOM node
 * @param { String } name - event name
 * @param { Function } handler - event callback
 * @param { Object } dom - dom node
 * @param { Tag } tag - tag instance
 */
function setEventHandler(name, handler, dom, tag) {
  var eventName;
  var cb = handleEvent.bind(tag, dom, handler);

  // avoid to bind twice the same event
  // possible fix for #2332
  dom[name] = null;

  // normalize event name
  eventName = name.replace(RE_EVENTS_PREFIX, '');

  // cache the listener into the listeners array
  if (!contains(tag.__.listeners, dom)) { tag.__.listeners.push(dom); }
  if (!dom[RIOT_EVENTS_KEY]) { dom[RIOT_EVENTS_KEY] = {}; }
  if (dom[RIOT_EVENTS_KEY][name]) { dom.removeEventListener(eventName, dom[RIOT_EVENTS_KEY][name]); }

  dom[RIOT_EVENTS_KEY][name] = cb;
  dom.addEventListener(eventName, cb, false);
}

/**
 * Update dynamically created data-is tags with changing expressions
 * @param { Object } expr - expression tag and expression info
 * @param { Tag }    parent - parent for tag creation
 * @param { String } tagName - tag implementation we want to use
 */
function updateDataIs(expr, parent, tagName) {
  var tag = expr.tag || expr.dom._tag;
  var ref;

  var ref$1 = tag ? tag.__ : {};
  var head = ref$1.head;
  var isVirtual = expr.dom.tagName === 'VIRTUAL';

  if (tag && expr.tagName === tagName) {
    tag.update();
    return
  }

  // sync _parent to accommodate changing tagnames
  if (tag) {
    // need placeholder before unmount
    if(isVirtual) {
      ref = createDOMPlaceholder();
      head.parentNode.insertBefore(ref, head);
    }

    tag.unmount(true);
  }

  // unable to get the tag name
  if (!isString(tagName)) { return }

  expr.impl = __TAG_IMPL[tagName];

  // unknown implementation
  if (!expr.impl) { return }

  expr.tag = tag = initChildTag(
    expr.impl, {
      root: expr.dom,
      parent: parent,
      tagName: tagName
    },
    expr.dom.innerHTML,
    parent
  );

  each(expr.attrs, function (a) { return setAttr(tag.root, a.name, a.value); });
  expr.tagName = tagName;
  tag.mount();

  // root exist first time, after use placeholder
  if (isVirtual) { makeReplaceVirtual(tag, ref || tag.root); }

  // parent is the placeholder tag, not the dynamic tag so clean up
  parent.__.onUnmount = function () {
    var delName = tag.opts.dataIs;
    arrayishRemove(tag.parent.tags, delName, tag);
    arrayishRemove(tag.__.parent.tags, delName, tag);
    tag.unmount();
  };
}

/**
 * Nomalize any attribute removing the "riot-" prefix
 * @param   { String } attrName - original attribute name
 * @returns { String } valid html attribute name
 */
function normalizeAttrName(attrName) {
  if (!attrName) { return null }
  attrName = attrName.replace(ATTRS_PREFIX, '');
  if (CASE_SENSITIVE_ATTRIBUTES[attrName]) { attrName = CASE_SENSITIVE_ATTRIBUTES[attrName]; }
  return attrName
}

/**
 * Update on single tag expression
 * @this Tag
 * @param { Object } expr - expression logic
 * @returns { undefined }
 */
function updateExpression(expr) {
  if (this.root && getAttr(this.root,'virtualized')) { return }

  var dom = expr.dom;
  // remove the riot- prefix
  var attrName = normalizeAttrName(expr.attr);
  var isToggle = contains([SHOW_DIRECTIVE, HIDE_DIRECTIVE], attrName);
  var isVirtual = expr.root && expr.root.tagName === 'VIRTUAL';
  var ref = this.__;
  var isAnonymous = ref.isAnonymous;
  var parent = dom && (expr.parent || dom.parentNode);
  // detect the style attributes
  var isStyleAttr = attrName === 'style';
  var isClassAttr = attrName === 'class';

  var value;

  // if it's a tag we could totally skip the rest
  if (expr._riot_id) {
    if (expr.__.wasCreated) {
      expr.update();
    // if it hasn't been mounted yet, do that now.
    } else {
      expr.mount();
      if (isVirtual) {
        makeReplaceVirtual(expr, expr.root);
      }
    }
    return
  }

  // if this expression has the update method it means it can handle the DOM changes by itself
  if (expr.update) { return expr.update() }

  var context = isToggle && !isAnonymous ? inheritParentProps.call(this) : this;

  // ...it seems to be a simple expression so we try to calculate its value
  value = tmpl(expr.expr, context);

  var hasValue = !isBlank(value);
  var isObj = isObject$2(value);

  // convert the style/class objects to strings
  if (isObj) {
    if (isClassAttr) {
      value = tmpl(JSON.stringify(value), this);
    } else if (isStyleAttr) {
      value = styleObjectToString(value);
    }
  }

  // remove original attribute
  if (expr.attr && (!expr.wasParsedOnce || !hasValue || value === false)) {
    // remove either riot-* attributes or just the attribute name
    remAttr(dom, getAttr(dom, expr.attr) ? expr.attr : attrName);
  }

  // for the boolean attributes we don't need the value
  // we can convert it to checked=true to checked=checked
  if (expr.bool) { value = value ? attrName : false; }
  if (expr.isRtag) { return updateDataIs(expr, this, value) }
  if (expr.wasParsedOnce && expr.value === value) { return }

  // update the expression value
  expr.value = value;
  expr.wasParsedOnce = true;

  // if the value is an object (and it's not a style or class attribute) we can not do much more with it
  if (isObj && !isClassAttr && !isStyleAttr && !isToggle) { return }
  // avoid to render undefined/null values
  if (!hasValue) { value = ''; }

  // textarea and text nodes have no attribute name
  if (!attrName) {
    // about #815 w/o replace: the browser converts the value to a string,
    // the comparison by "==" does too, but not in the server
    value += '';
    // test for parent avoids error with invalid assignment to nodeValue
    if (parent) {
      // cache the parent node because somehow it will become null on IE
      // on the next iteration
      expr.parent = parent;
      if (parent.tagName === 'TEXTAREA') {
        parent.value = value;                    // #1113
        if (!IE_VERSION) { dom.nodeValue = value; }  // #1625 IE throws here, nodeValue
      }                                         // will be available on 'updated'
      else { dom.nodeValue = value; }
    }
    return
  }


  // event handler
  if (isFunction$2(value)) {
    setEventHandler(attrName, value, dom, this);
  // show / hide
  } else if (isToggle) {
    toggleVisibility(dom, attrName === HIDE_DIRECTIVE ? !value : value);
  // handle attributes
  } else {
    if (expr.bool) {
      dom[attrName] = value;
    }

    if (attrName === 'value' && dom.value !== value) {
      dom.value = value;
    } else if (hasValue && value !== false) {
      setAttr(dom, attrName, value);
    }

    // make sure that in case of style changes
    // the element stays hidden
    if (isStyleAttr && dom.hidden) { toggleVisibility(dom, false); }
  }
}

/**
 * Update all the expressions in a Tag instance
 * @this Tag
 * @param { Array } expressions - expression that must be re evaluated
 */
function updateAllExpressions(expressions) {
  each(expressions, updateExpression.bind(this));
}

var IfExpr = {
  init: function init(dom, tag, expr) {
    remAttr(dom, CONDITIONAL_DIRECTIVE);
    this.tag = tag;
    this.expr = expr;
    this.stub = createDOMPlaceholder();
    this.pristine = dom;

    var p = dom.parentNode;
    p.insertBefore(this.stub, dom);
    p.removeChild(dom);

    return this
  },
  update: function update() {
    this.value = tmpl(this.expr, this.tag);

    if (this.value && !this.current) { // insert
      this.current = this.pristine.cloneNode(true);
      this.stub.parentNode.insertBefore(this.current, this.stub);
      this.expressions = parseExpressions.apply(this.tag, [this.current, true]);
    } else if (!this.value && this.current) { // remove
      unmountAll(this.expressions);
      if (this.current._tag) {
        this.current._tag.unmount();
      } else if (this.current.parentNode) {
        this.current.parentNode.removeChild(this.current);
      }
      this.current = null;
      this.expressions = [];
    }

    if (this.value) { updateAllExpressions.call(this.tag, this.expressions); }
  },
  unmount: function unmount() {
    unmountAll(this.expressions || []);
  }
}

var RefExpr = {
  init: function init(dom, parent, attrName, attrValue) {
    this.dom = dom;
    this.attr = attrName;
    this.rawValue = attrValue;
    this.parent = parent;
    this.hasExp = tmpl.hasExpr(attrValue);
    return this
  },
  update: function update() {
    var old = this.value;
    var customParent = this.parent && getImmediateCustomParentTag(this.parent);
    // if the referenced element is a custom tag, then we set the tag itself, rather than DOM
    var tagOrDom = this.dom.__ref || this.tag || this.dom;

    this.value = this.hasExp ? tmpl(this.rawValue, this.parent) : this.rawValue;

    // the name changed, so we need to remove it from the old key (if present)
    if (!isBlank(old) && customParent) { arrayishRemove(customParent.refs, old, tagOrDom); }
    if (!isBlank(this.value) && isString(this.value)) {
      // add it to the refs of parent tag (this behavior was changed >=3.0)
      if (customParent) { arrayishAdd(
        customParent.refs,
        this.value,
        tagOrDom,
        // use an array if it's a looped node and the ref is not an expression
        null,
        this.parent.__.index
      ); }

      if (this.value !== old) {
        setAttr(this.dom, this.attr, this.value);
      }
    } else {
      remAttr(this.dom, this.attr);
    }

    // cache the ref bound to this dom node
    // to reuse it in future (see also #2329)
    if (!this.dom.__ref) { this.dom.__ref = tagOrDom; }
  },
  unmount: function unmount() {
    var tagOrDom = this.tag || this.dom;
    var customParent = this.parent && getImmediateCustomParentTag(this.parent);
    if (!isBlank(this.value) && customParent)
      { arrayishRemove(customParent.refs, this.value, tagOrDom); }
  }
}

/**
 * Convert the item looped into an object used to extend the child tag properties
 * @param   { Object } expr - object containing the keys used to extend the children tags
 * @param   { * } key - value to assign to the new object returned
 * @param   { * } val - value containing the position of the item in the array
 * @param   { Object } base - prototype object for the new item
 * @returns { Object } - new object containing the values of the original item
 *
 * The variables 'key' and 'val' are arbitrary.
 * They depend on the collection type looped (Array, Object)
 * and on the expression used on the each tag
 *
 */
function mkitem(expr, key, val, base) {
  var item = base ? Object.create(base) : {};
  item[expr.key] = key;
  if (expr.pos) { item[expr.pos] = val; }
  return item
}

/**
 * Unmount the redundant tags
 * @param   { Array } items - array containing the current items to loop
 * @param   { Array } tags - array containing all the children tags
 */
function unmountRedundant(items, tags) {
  var i = tags.length;
  var j = items.length;

  while (i > j) {
    i--;
    remove.apply(tags[i], [tags, i]);
  }
}


/**
 * Remove a child tag
 * @this Tag
 * @param   { Array } tags - tags collection
 * @param   { Number } i - index of the tag to remove
 */
function remove(tags, i) {
  tags.splice(i, 1);
  this.unmount();
  arrayishRemove(this.parent, this, this.__.tagName, true);
}

/**
 * Move the nested custom tags in non custom loop tags
 * @this Tag
 * @param   { Number } i - current position of the loop tag
 */
function moveNestedTags(i) {
  var this$1 = this;

  each(Object.keys(this.tags), function (tagName) {
    moveChildTag.apply(this$1.tags[tagName], [tagName, i]);
  });
}

/**
 * Move a child tag
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Tag } nextTag - instance of the next tag preceding the one we want to move
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function move(root, nextTag, isVirtual) {
  if (isVirtual)
    { moveVirtual.apply(this, [root, nextTag]); }
  else
    { safeInsert(root, this.root, nextTag.root); }
}

/**
 * Insert and mount a child tag
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Tag } nextTag - instance of the next tag preceding the one we want to insert
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function insert(root, nextTag, isVirtual) {
  if (isVirtual)
    { makeVirtual.apply(this, [root, nextTag]); }
  else
    { safeInsert(root, this.root, nextTag.root); }
}

/**
 * Append a new tag into the DOM
 * @this Tag
 * @param   { HTMLElement } root - dom node containing all the loop children
 * @param   { Boolean } isVirtual - is it a virtual tag?
 */
function append(root, isVirtual) {
  if (isVirtual)
    { makeVirtual.call(this, root); }
  else
    { root.appendChild(this.root); }
}

/**
 * Return the value we want to use to lookup the postion of our items in the collection
 * @param   { String }  keyAttr         - lookup string or expression
 * @param   { * }       originalItem    - original item from the collection
 * @param   { Object }  keyedItem       - object created by riot via { item, i in collection }
 * @param   { Boolean } hasKeyAttrExpr  - flag to check whether the key is an expression
 * @returns { * } value that we will use to figure out the item position via collection.indexOf
 */
function getItemId(keyAttr, originalItem, keyedItem, hasKeyAttrExpr) {
  if (keyAttr) {
    return hasKeyAttrExpr ?  tmpl(keyAttr, keyedItem) :  originalItem[keyAttr]
  }

  return originalItem
}

/**
 * Manage tags having the 'each'
 * @param   { HTMLElement } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the 'each' attribute
 * @returns { Object } expression object for this each loop
 */
function _each(dom, parent, expr) {
  var mustReorder = typeof getAttr(dom, LOOP_NO_REORDER_DIRECTIVE) !== T_STRING || remAttr(dom, LOOP_NO_REORDER_DIRECTIVE);
  var keyAttr = getAttr(dom, KEY_DIRECTIVE);
  var hasKeyAttrExpr = keyAttr ? tmpl.hasExpr(keyAttr) : false;
  var tagName = getTagName(dom);
  var impl = __TAG_IMPL[tagName];
  var parentNode = dom.parentNode;
  var placeholder = createDOMPlaceholder();
  var child = getTag(dom);
  var ifExpr = getAttr(dom, CONDITIONAL_DIRECTIVE);
  var tags = [];
  var isLoop = true;
  var innerHTML = dom.innerHTML;
  var isAnonymous = !__TAG_IMPL[tagName];
  var isVirtual = dom.tagName === 'VIRTUAL';
  var oldItems = [];
  var hasKeys;

  // remove the each property from the original tag
  remAttr(dom, LOOP_DIRECTIVE);
  remAttr(dom, KEY_DIRECTIVE);

  // parse the each expression
  expr = tmpl.loopKeys(expr);
  expr.isLoop = true;

  if (ifExpr) { remAttr(dom, CONDITIONAL_DIRECTIVE); }

  // insert a marked where the loop tags will be injected
  parentNode.insertBefore(placeholder, dom);
  parentNode.removeChild(dom);

  expr.update = function updateEach() {
    // get the new items collection
    expr.value = tmpl(expr.val, parent);

    var items = expr.value;
    var frag = createFrag();
    var isObject = !isArray(items) && !isString(items);
    var root = placeholder.parentNode;
    var tmpItems = [];

    // if this DOM was removed the update here is useless
    // this condition fixes also a weird async issue on IE in our unit test
    if (!root) { return }

    // object loop. any changes cause full redraw
    if (isObject) {
      hasKeys = items || false;
      items = hasKeys ?
        Object.keys(items).map(function (key) { return mkitem(expr, items[key], key); }) : [];
    } else {
      hasKeys = false;
    }

    if (ifExpr) {
      items = items.filter(function (item, i) {
        if (expr.key && !isObject)
          { return !!tmpl(ifExpr, mkitem(expr, item, i, parent)) }

        return !!tmpl(ifExpr, extend(Object.create(parent), item))
      });
    }

    // loop all the new items
    each(items, function (_item, i) {
      var item = !hasKeys && expr.key ? mkitem(expr, _item, i) : _item;
      var itemId = getItemId(keyAttr, _item, item, hasKeyAttrExpr);
      // reorder only if the items are objects
      var doReorder = mustReorder && typeof _item === T_OBJECT && !hasKeys;
      var oldPos = oldItems.indexOf(itemId);
      var isNew = oldPos === -1;
      var pos = !isNew && doReorder ? oldPos : i;
      // does a tag exist in this position?
      var tag = tags[pos];
      var mustAppend = i >= oldItems.length;
      var mustCreate =  doReorder && isNew || !doReorder && !tag;

      // new tag
      if (mustCreate) {
        tag = createTag(impl, {
          parent: parent,
          isLoop: isLoop,
          isAnonymous: isAnonymous,
          tagName: tagName,
          root: dom.cloneNode(isAnonymous),
          item: item,
          index: i,
        }, innerHTML);

        // mount the tag
        tag.mount();

        if (mustAppend)
          { append.apply(tag, [frag || root, isVirtual]); }
        else
          { insert.apply(tag, [root, tags[i], isVirtual]); }

        if (!mustAppend) { oldItems.splice(i, 0, item); }
        tags.splice(i, 0, tag);
        if (child) { arrayishAdd(parent.tags, tagName, tag, true); }
      } else if (pos !== i && doReorder) {
        // move
        if (keyAttr || contains(items, oldItems[pos])) {
          move.apply(tag, [root, tags[i], isVirtual]);
          // move the old tag instance
          tags.splice(i, 0, tags.splice(pos, 1)[0]);
          // move the old item
          oldItems.splice(i, 0, oldItems.splice(pos, 1)[0]);
        }

        // update the position attribute if it exists
        if (expr.pos) { tag[expr.pos] = i; }

        // if the loop tags are not custom
        // we need to move all their custom tags into the right position
        if (!child && tag.tags) { moveNestedTags.call(tag, i); }
      }

      // cache the original item to use it in the events bound to this node
      // and its children
      tag.__.item = item;
      tag.__.index = i;
      tag.__.parent = parent;

      tmpItems[i] = itemId;

      if (!mustCreate) { tag.update(item); }
    });

    // remove the redundant tags
    unmountRedundant(items, tags);

    // clone the items array
    oldItems = tmpItems.slice();

    root.insertBefore(frag, placeholder);
  };

  expr.unmount = function () {
    each(tags, function (t) { t.unmount(); });
  };

  return expr
}

/**
 * Walk the tag DOM to detect the expressions to evaluate
 * @this Tag
 * @param   { HTMLElement } root - root tag where we will start digging the expressions
 * @param   { Boolean } mustIncludeRoot - flag to decide whether the root must be parsed as well
 * @returns { Array } all the expressions found
 */
function parseExpressions(root, mustIncludeRoot) {
  var this$1 = this;

  var expressions = [];

  walkNodes(root, function (dom) {
    var type = dom.nodeType;
    var attr;
    var tagImpl;

    if (!mustIncludeRoot && dom === root) { return }

    // text node
    if (type === 3 && dom.parentNode.tagName !== 'STYLE' && tmpl.hasExpr(dom.nodeValue))
      { expressions.push({dom: dom, expr: dom.nodeValue}); }

    if (type !== 1) { return }

    var isVirtual = dom.tagName === 'VIRTUAL';

    // loop. each does it's own thing (for now)
    if (attr = getAttr(dom, LOOP_DIRECTIVE)) {
      if(isVirtual) { setAttr(dom, 'loopVirtual', true); } // ignore here, handled in _each
      expressions.push(_each(dom, this$1, attr));
      return false
    }

    // if-attrs become the new parent. Any following expressions (either on the current
    // element, or below it) become children of this expression.
    if (attr = getAttr(dom, CONDITIONAL_DIRECTIVE)) {
      expressions.push(Object.create(IfExpr).init(dom, this$1, attr));
      return false
    }

    if (attr = getAttr(dom, IS_DIRECTIVE)) {
      if (tmpl.hasExpr(attr)) {
        expressions.push({
          isRtag: true,
          expr: attr,
          dom: dom,
          attrs: [].slice.call(dom.attributes)
        });

        return false
      }
    }

    // if this is a tag, stop traversing here.
    // we ignore the root, since parseExpressions is called while we're mounting that root
    tagImpl = getTag(dom);

    if(isVirtual) {
      if(getAttr(dom, 'virtualized')) {dom.parentElement.removeChild(dom); } // tag created, remove from dom
      if(!tagImpl && !getAttr(dom, 'virtualized') && !getAttr(dom, 'loopVirtual'))  // ok to create virtual tag
        { tagImpl = { tmpl: dom.outerHTML }; }
    }

    if (tagImpl && (dom !== root || mustIncludeRoot)) {
      if(isVirtual) { // handled in update
        if (getAttr(dom, IS_DIRECTIVE))
          { warn(("Virtual tags shouldn't be used together with the \"" + IS_DIRECTIVE + "\" attribute - https://github.com/riot/riot/issues/2511")); }
        // can not remove attribute like directives
        // so flag for removal after creation to prevent maximum stack error
        setAttr(dom, 'virtualized', true);
        var tag = createTag(
          {tmpl: dom.outerHTML},
          {root: dom, parent: this$1},
          dom.innerHTML
        );

        expressions.push(tag); // no return, anonymous tag, keep parsing
      } else {
        expressions.push(
          initChildTag(
            tagImpl,
            {
              root: dom,
              parent: this$1
            },
            dom.innerHTML,
            this$1
          )
        );
        return false
      }
    }

    // attribute expressions
    parseAttributes.apply(this$1, [dom, dom.attributes, function (attr, expr) {
      if (!expr) { return }
      expressions.push(expr);
    }]);
  });

  return expressions
}

/**
 * Calls `fn` for every attribute on an element. If that attr has an expression,
 * it is also passed to fn.
 * @this Tag
 * @param   { HTMLElement } dom - dom node to parse
 * @param   { Array } attrs - array of attributes
 * @param   { Function } fn - callback to exec on any iteration
 */
function parseAttributes(dom, attrs, fn) {
  var this$1 = this;

  each(attrs, function (attr) {
    if (!attr) { return false }

    var name = attr.name;
    var bool = isBoolAttr(name);
    var expr;

    if (contains(REF_DIRECTIVES, name) && dom.tagName.toLowerCase() !== YIELD_TAG) {
      expr =  Object.create(RefExpr).init(dom, this$1, name, attr.value);
    } else if (tmpl.hasExpr(attr.value)) {
      expr = {dom: dom, expr: attr.value, attr: name, bool: bool};
    }

    fn(attr, expr);
  });
}

/*
  Includes hacks needed for the Internet Explorer version 9 and below
  See: http://kangax.github.io/compat-table/es5/#ie8
       http://codeplanet.io/dropping-ie8/
*/

var reHasYield  = /<yield\b/i;
var reYieldAll  = /<yield\s*(?:\/>|>([\S\s]*?)<\/yield\s*>|>)/ig;
var reYieldSrc  = /<yield\s+to=['"]([^'">]*)['"]\s*>([\S\s]*?)<\/yield\s*>/ig;
var reYieldDest = /<yield\s+from=['"]?([-\w]+)['"]?\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/ig;
var rootEls = { tr: 'tbody', th: 'tr', td: 'tr', col: 'colgroup' };
var tblTags = IE_VERSION && IE_VERSION < 10 ? RE_SPECIAL_TAGS : RE_SPECIAL_TAGS_NO_OPTION;
var GENERIC = 'div';
var SVG = 'svg';


/*
  Creates the root element for table or select child elements:
  tr/th/td/thead/tfoot/tbody/caption/col/colgroup/option/optgroup
*/
function specialTags(el, tmpl, tagName) {

  var
    select = tagName[0] === 'o',
    parent = select ? 'select>' : 'table>';

  // trim() is important here, this ensures we don't have artifacts,
  // so we can check if we have only one element inside the parent
  el.innerHTML = '<' + parent + tmpl.trim() + '</' + parent;
  parent = el.firstChild;

  // returns the immediate parent if tr/th/td/col is the only element, if not
  // returns the whole tree, as this can include additional elements
  /* istanbul ignore next */
  if (select) {
    parent.selectedIndex = -1;  // for IE9, compatible w/current riot behavior
  } else {
    // avoids insertion of cointainer inside container (ex: tbody inside tbody)
    var tname = rootEls[tagName];
    if (tname && parent.childElementCount === 1) { parent = $(tname, parent); }
  }
  return parent
}

/*
  Replace the yield tag from any tag template with the innerHTML of the
  original tag in the page
*/
function replaceYield(tmpl, html) {
  // do nothing if no yield
  if (!reHasYield.test(tmpl)) { return tmpl }

  // be careful with #1343 - string on the source having `$1`
  var src = {};

  html = html && html.replace(reYieldSrc, function (_, ref, text) {
    src[ref] = src[ref] || text;   // preserve first definition
    return ''
  }).trim();

  return tmpl
    .replace(reYieldDest, function (_, ref, def) {  // yield with from - to attrs
      return src[ref] || def || ''
    })
    .replace(reYieldAll, function (_, def) {        // yield without any "from"
      return html || def || ''
    })
}

/**
 * Creates a DOM element to wrap the given content. Normally an `DIV`, but can be
 * also a `TABLE`, `SELECT`, `TBODY`, `TR`, or `COLGROUP` element.
 *
 * @param   { String } tmpl  - The template coming from the custom tag definition
 * @param   { String } html - HTML content that comes from the DOM element where you
 *           will mount the tag, mostly the original tag in the page
 * @param   { Boolean } isSvg - true if the root node is an svg
 * @returns { HTMLElement } DOM element with _tmpl_ merged through `YIELD` with the _html_.
 */
function mkdom(tmpl, html, isSvg$$1) {
  var match   = tmpl && tmpl.match(/^\s*<([-\w]+)/);
  var  tagName = match && match[1].toLowerCase();
  var el = mkEl(isSvg$$1 ? SVG : GENERIC);

  // replace all the yield tags with the tag inner html
  tmpl = replaceYield(tmpl, html);

  /* istanbul ignore next */
  if (tblTags.test(tagName))
    { el = specialTags(el, tmpl, tagName); }
  else
    { setInnerHTML(el, tmpl, isSvg$$1); }

  return el
}

/**
 * Another way to create a riot tag a bit more es6 friendly
 * @param { HTMLElement } el - tag DOM selector or DOM node/s
 * @param { Object } opts - tag logic
 * @returns { Tag } new riot tag instance
 */
function Tag(el, opts) {
  // get the tag properties from the class constructor
  var ref = this;
  var name = ref.name;
  var tmpl = ref.tmpl;
  var css = ref.css;
  var attrs = ref.attrs;
  var onCreate = ref.onCreate;
  // register a new tag and cache the class prototype
  if (!__TAG_IMPL[name]) {
    tag(name, tmpl, css, attrs, onCreate);
    // cache the class constructor
    __TAG_IMPL[name].class = this.constructor;
  }

  // mount the tag using the class instance
  mountTo(el, name, opts, this);
  // inject the component css
  if (css) { styleManager.inject(); }

  return this
}

/**
 * Create a new riot tag implementation
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   tmpl - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
function tag(name, tmpl, css, attrs, fn) {
  if (isFunction$2(attrs)) {
    fn = attrs;

    if (/^[\w-]+\s?=/.test(css)) {
      attrs = css;
      css = '';
    } else
      { attrs = ''; }
  }

  if (css) {
    if (isFunction$2(css))
      { fn = css; }
    else
      { styleManager.add(css); }
  }

  name = name.toLowerCase();
  __TAG_IMPL[name] = { name: name, tmpl: tmpl, attrs: attrs, fn: fn };

  return name
}

/**
 * Create a new riot tag implementation (for use by the compiler)
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   tmpl - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
function tag2(name, tmpl, css, attrs, fn) {
  if (css) { styleManager.add(css, name); }

  __TAG_IMPL[name] = { name: name, tmpl: tmpl, attrs: attrs, fn: fn };

  return name
}

/**
 * Mount a tag using a specific tag implementation
 * @param   { * } selector - tag DOM selector or DOM node/s
 * @param   { String } tagName - tag implementation name
 * @param   { Object } opts - tag logic
 * @returns { Array } new tags instances
 */
function mount(selector, tagName, opts) {
  var tags = [];
  var elem, allTags;

  function pushTagsTo(root) {
    if (root.tagName) {
      var riotTag = getAttr(root, IS_DIRECTIVE), tag;

      // have tagName? force riot-tag to be the same
      if (tagName && riotTag !== tagName) {
        riotTag = tagName;
        setAttr(root, IS_DIRECTIVE, tagName);
      }

      tag = mountTo(root, riotTag || root.tagName.toLowerCase(), opts);

      if (tag)
        { tags.push(tag); }
    } else if (root.length)
      { each(root, pushTagsTo); } // assume nodeList
  }

  // inject styles into DOM
  styleManager.inject();

  if (isObject$2(tagName)) {
    opts = tagName;
    tagName = 0;
  }

  // crawl the DOM to find the tag
  if (isString(selector)) {
    selector = selector === '*' ?
      // select all registered tags
      // & tags found with the riot-tag attribute set
      allTags = selectTags() :
      // or just the ones named like the selector
      selector + selectTags(selector.split(/, */));

    // make sure to pass always a selector
    // to the querySelectorAll function
    elem = selector ? $$(selector) : [];
  }
  else
    // probably you have passed already a tag or a NodeList
    { elem = selector; }

  // select all the registered and mount them inside their root elements
  if (tagName === '*') {
    // get all custom tags
    tagName = allTags || selectTags();
    // if the root els it's just a single tag
    if (elem.tagName)
      { elem = $$(tagName, elem); }
    else {
      // select all the children for all the different root elements
      var nodeList = [];

      each(elem, function (_el) { return nodeList.push($$(tagName, _el)); });

      elem = nodeList;
    }
    // get rid of the tagName
    tagName = 0;
  }

  pushTagsTo(elem);

  return tags
}

// Create a mixin that could be globally shared across all the tags
var mixins = {};
var globals = mixins[GLOBAL_MIXIN] = {};
var mixins_id = 0;

/**
 * Create/Return a mixin by its name
 * @param   { String }  name - mixin name (global mixin if object)
 * @param   { Object }  mix - mixin logic
 * @param   { Boolean } g - is global?
 * @returns { Object }  the mixin logic
 */
function mixin(name, mix, g) {
  // Unnamed global
  if (isObject$2(name)) {
    mixin(("__" + (mixins_id++) + "__"), name, true);
    return
  }

  var store = g ? globals : mixins;

  // Getter
  if (!mix) {
    if (isUndefined(store[name]))
      { throw new Error(("Unregistered mixin: " + name)) }

    return store[name]
  }

  // Setter
  store[name] = isFunction$2(mix) ?
    extend(mix.prototype, store[name] || {}) && mix :
    extend(store[name] || {}, mix);
}

/**
 * Update all the tags instances created
 * @returns { Array } all the tags instances
 */
function update() {
  return each(__TAGS_CACHE, function (tag) { return tag.update(); })
}

function unregister(name) {
  __TAG_IMPL[name] = null;
}

var version = 'WIP';


var core = Object.freeze({
	Tag: Tag,
	tag: tag,
	tag2: tag2,
	mount: mount,
	mixin: mixin,
	update: update,
	unregister: unregister,
	version: version
});

/**
 * We need to update opts for this tag. That requires updating the expressions
 * in any attributes on the tag, and then copying the result onto opts.
 * @this Tag
 * @param   {Boolean} isLoop - is it a loop tag?
 * @param   { Tag }  parent - parent tag node
 * @param   { Boolean }  isAnonymous - is it a tag without any impl? (a tag not registered)
 * @param   { Object }  opts - tag options
 * @param   { Array }  instAttrs - tag attributes array
 */
function updateOpts(isLoop, parent, isAnonymous, opts, instAttrs) {
  // isAnonymous `each` tags treat `dom` and `root` differently. In this case
  // (and only this case) we don't need to do updateOpts, because the regular parse
  // will update those attrs. Plus, isAnonymous tags don't need opts anyway
  if (isLoop && isAnonymous) { return }
  var ctx = isLoop ? inheritParentProps.call(this) : parent || this;

  each(instAttrs, function (attr) {
    if (attr.expr) { updateExpression.call(ctx, attr.expr); }
    // normalize the attribute names
    opts[toCamel(attr.name).replace(ATTRS_PREFIX, '')] = attr.expr ? attr.expr.value : attr.value;
  });
}

/**
 * Manage the mount state of a tag triggering also the observable events
 * @this Tag
 * @param { Boolean } value - ..of the isMounted flag
 */
function setMountState(value) {
  var ref = this.__;
  var isAnonymous = ref.isAnonymous;

  defineProperty(this, 'isMounted', value);

  if (!isAnonymous) {
    if (value) { this.trigger('mount'); }
    else {
      this.trigger('unmount');
      this.off('*');
      this.__.wasCreated = false;
    }
  }
}


/**
 * Tag creation factory function
 * @constructor
 * @param { Object } impl - it contains the tag template, and logic
 * @param { Object } conf - tag options
 * @param { String } innerHTML - html that eventually we need to inject in the tag
 */
function createTag(impl, conf, innerHTML) {
  if ( impl === void 0 ) impl = {};
  if ( conf === void 0 ) conf = {};

  var tag$$1 = conf.context || {};
  var opts = extend({}, conf.opts);
  var parent = conf.parent;
  var isLoop = conf.isLoop;
  var isAnonymous = !!conf.isAnonymous;
  var skipAnonymous = settings.skipAnonymousTags && isAnonymous;
  var item = conf.item;
  // available only for the looped nodes
  var index = conf.index;
  // All attributes on the Tag when it's first parsed
  var instAttrs = [];
  // expressions on this type of Tag
  var implAttrs = [];
  var expressions = [];
  var root = conf.root;
  var tagName = conf.tagName || getTagName(root);
  var isVirtual = tagName === 'virtual';
  var isInline = !isVirtual && !impl.tmpl;
  var dom;

  // make this tag observable
  if (!skipAnonymous) { observable(tag$$1); }
  // only call unmount if we have a valid __TAG_IMPL (has name property)
  if (impl.name && root._tag) { root._tag.unmount(true); }

  // not yet mounted
  defineProperty(tag$$1, 'isMounted', false);

  defineProperty(tag$$1, '__', {
    isAnonymous: isAnonymous,
    instAttrs: instAttrs,
    innerHTML: innerHTML,
    tagName: tagName,
    index: index,
    isLoop: isLoop,
    isInline: isInline,
    // tags having event listeners
    // it would be better to use weak maps here but we can not introduce breaking changes now
    listeners: [],
    // these vars will be needed only for the virtual tags
    virts: [],
    wasCreated: false,
    tail: null,
    head: null,
    parent: null,
    item: null
  });

  // create a unique id to this tag
  // it could be handy to use it also to improve the virtual dom rendering speed
  defineProperty(tag$$1, '_riot_id', uid()); // base 1 allows test !t._riot_id
  defineProperty(tag$$1, 'root', root);
  extend(tag$$1, { opts: opts }, item);
  // protect the "tags" and "refs" property from being overridden
  defineProperty(tag$$1, 'parent', parent || null);
  defineProperty(tag$$1, 'tags', {});
  defineProperty(tag$$1, 'refs', {});

  if (isInline || isLoop && isAnonymous) {
    dom = root;
  } else {
    if (!isVirtual) { root.innerHTML = ''; }
    dom = mkdom(impl.tmpl, innerHTML, isSvg(root));
  }

  /**
   * Update the tag expressions and options
   * @param   { * }  data - data we want to use to extend the tag properties
   * @returns { Tag } the current tag instance
   */
  defineProperty(tag$$1, 'update', function tagUpdate(data) {
    var nextOpts = {};
    var canTrigger = tag$$1.isMounted && !skipAnonymous;

    // inherit properties from the parent tag
    if (isAnonymous && parent) { extend(tag$$1, parent); }
    extend(tag$$1, data);

    updateOpts.apply(tag$$1, [isLoop, parent, isAnonymous, nextOpts, instAttrs]);

    if (
      canTrigger &&
      tag$$1.isMounted &&
      isFunction$2(tag$$1.shouldUpdate) && !tag$$1.shouldUpdate(data, nextOpts)
    ) {
      return tag$$1
    }

    extend(opts, nextOpts);

    if (canTrigger) { tag$$1.trigger('update', data); }
    updateAllExpressions.call(tag$$1, expressions);
    if (canTrigger) { tag$$1.trigger('updated'); }

    return tag$$1
  });

  /**
   * Add a mixin to this tag
   * @returns { Tag } the current tag instance
   */
  defineProperty(tag$$1, 'mixin', function tagMixin() {
    each(arguments, function (mix) {
      var instance;
      var obj;
      var props = [];

      // properties blacklisted and will not be bound to the tag instance
      var propsBlacklist = ['init', '__proto__'];

      mix = isString(mix) ? mixin(mix) : mix;

      // check if the mixin is a function
      if (isFunction$2(mix)) {
        // create the new mixin instance
        instance = new mix();
      } else { instance = mix; }

      var proto = Object.getPrototypeOf(instance);

      // build multilevel prototype inheritance chain property list
      do { props = props.concat(Object.getOwnPropertyNames(obj || instance)); }
      while (obj = Object.getPrototypeOf(obj || instance))

      // loop the keys in the function prototype or the all object keys
      each(props, function (key) {
        // bind methods to tag
        // allow mixins to override other properties/parent mixins
        if (!contains(propsBlacklist, key)) {
          // check for getters/setters
          var descriptor = getPropDescriptor(instance, key) || getPropDescriptor(proto, key);
          var hasGetterSetter = descriptor && (descriptor.get || descriptor.set);

          // apply method only if it does not already exist on the instance
          if (!tag$$1.hasOwnProperty(key) && hasGetterSetter) {
            Object.defineProperty(tag$$1, key, descriptor);
          } else {
            tag$$1[key] = isFunction$2(instance[key]) ?
              instance[key].bind(tag$$1) :
              instance[key];
          }
        }
      });

      // init method will be called automatically
      if (instance.init)
        { instance.init.bind(tag$$1)(opts); }
    });

    return tag$$1
  });

  /**
   * Mount the current tag instance
   * @returns { Tag } the current tag instance
   */
  defineProperty(tag$$1, 'mount', function tagMount() {
    root._tag = tag$$1; // keep a reference to the tag just created

    // Read all the attrs on this instance. This give us the info we need for updateOpts
    parseAttributes.apply(parent, [root, root.attributes, function (attr, expr) {
      if (!isAnonymous && RefExpr.isPrototypeOf(expr)) { expr.tag = tag$$1; }
      attr.expr = expr;
      instAttrs.push(attr);
    }]);

    // update the root adding custom attributes coming from the compiler
    walkAttrs(impl.attrs, function (k, v) { implAttrs.push({name: k, value: v}); });
    parseAttributes.apply(tag$$1, [root, implAttrs, function (attr, expr) {
      if (expr) { expressions.push(expr); }
      else { setAttr(root, attr.name, attr.value); }
    }]);

    // initialiation
    updateOpts.apply(tag$$1, [isLoop, parent, isAnonymous, opts, instAttrs]);

    // add global mixins
    var globalMixin = mixin(GLOBAL_MIXIN);

    if (globalMixin && !skipAnonymous) {
      for (var i in globalMixin) {
        if (globalMixin.hasOwnProperty(i)) {
          tag$$1.mixin(globalMixin[i]);
        }
      }
    }

    if (impl.fn) { impl.fn.call(tag$$1, opts); }

    if (!skipAnonymous) { tag$$1.trigger('before-mount'); }

    // parse layout after init. fn may calculate args for nested custom tags
    each(parseExpressions.apply(tag$$1, [dom, isAnonymous]), function (e) { return expressions.push(e); });

    tag$$1.update(item);

    if (!isAnonymous && !isInline) {
      while (dom.firstChild) { root.appendChild(dom.firstChild); }
    }

    defineProperty(tag$$1, 'root', root);

    // if we need to wait that the parent "mount" or "updated" event gets triggered
    if (!skipAnonymous && tag$$1.parent) {
      var p = getImmediateCustomParentTag(tag$$1.parent);
      p.one(!p.isMounted ? 'mount' : 'updated', function () {
        setMountState.call(tag$$1, true);
      });
    } else {
      // otherwise it's not a child tag we can trigger its mount event
      setMountState.call(tag$$1, true);
    }

    tag$$1.__.wasCreated = true;

    return tag$$1

  });

  /**
   * Unmount the tag instance
   * @param { Boolean } mustKeepRoot - if it's true the root node will not be removed
   * @returns { Tag } the current tag instance
   */
  defineProperty(tag$$1, 'unmount', function tagUnmount(mustKeepRoot) {
    var el = tag$$1.root;
    var p = el.parentNode;
    var tagIndex = __TAGS_CACHE.indexOf(tag$$1);

    if (!skipAnonymous) { tag$$1.trigger('before-unmount'); }

    // clear all attributes coming from the mounted tag
    walkAttrs(impl.attrs, function (name) {
      if (startsWith(name, ATTRS_PREFIX))
        { name = name.slice(ATTRS_PREFIX.length); }

      remAttr(root, name);
    });

    // remove all the event listeners
    tag$$1.__.listeners.forEach(function (dom) {
      Object.keys(dom[RIOT_EVENTS_KEY]).forEach(function (eventName) {
        dom.removeEventListener(eventName, dom[RIOT_EVENTS_KEY][eventName]);
      });
    });

    // remove tag instance from the global tags cache collection
    if (tagIndex !== -1) { __TAGS_CACHE.splice(tagIndex, 1); }

    // clean up the parent tags object
    if (parent && !isAnonymous) {
      var ptag = getImmediateCustomParentTag(parent);

      if (isVirtual) {
        Object
          .keys(tag$$1.tags)
          .forEach(function (tagName) { return arrayishRemove(ptag.tags, tagName, tag$$1.tags[tagName]); });
      } else {
        arrayishRemove(ptag.tags, tagName, tag$$1);
      }
    }

    // unmount all the virtual directives
    if (tag$$1.__.virts) {
      each(tag$$1.__.virts, function (v) {
        if (v.parentNode) { v.parentNode.removeChild(v); }
      });
    }

    // allow expressions to unmount themselves
    unmountAll(expressions);
    each(instAttrs, function (a) { return a.expr && a.expr.unmount && a.expr.unmount(); });

    // clear the tag html if it's necessary
    if (mustKeepRoot) { setInnerHTML(el, ''); }
    // otherwise detach the root tag from the DOM
    else if (p) { p.removeChild(el); }

    // custom internal unmount function to avoid relying on the observable
    if (tag$$1.__.onUnmount) { tag$$1.__.onUnmount(); }

    // weird fix for a weird edge case #2409 and #2436
    // some users might use your software not as you've expected
    // so I need to add these dirty hacks to mitigate unexpected issues
    if (!tag$$1.isMounted) { setMountState.call(tag$$1, true); }

    setMountState.call(tag$$1, false);

    delete tag$$1.root._tag;

    return tag$$1
  });

  return tag$$1
}

/**
 * Detect the tag implementation by a DOM node
 * @param   { Object } dom - DOM node we need to parse to get its tag implementation
 * @returns { Object } it returns an object containing the implementation of a custom tag (template and boot function)
 */
function getTag(dom) {
  return dom.tagName && __TAG_IMPL[getAttr(dom, IS_DIRECTIVE) ||
    getAttr(dom, IS_DIRECTIVE) || dom.tagName.toLowerCase()]
}

/**
 * Move the position of a custom tag in its parent tag
 * @this Tag
 * @param   { String } tagName - key where the tag was stored
 * @param   { Number } newPos - index where the new tag will be stored
 */
function moveChildTag(tagName, newPos) {
  var parent = this.parent;
  var tags;
  // no parent no move
  if (!parent) { return }

  tags = parent.tags[tagName];

  if (isArray(tags))
    { tags.splice(newPos, 0, tags.splice(tags.indexOf(this), 1)[0]); }
  else { arrayishAdd(parent.tags, tagName, this); }
}

/**
 * Create a new child tag including it correctly into its parent
 * @param   { Object } child - child tag implementation
 * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
 * @param   { String } innerHTML - inner html of the child node
 * @param   { Object } parent - instance of the parent tag including the child custom tag
 * @returns { Object } instance of the new child tag just created
 */
function initChildTag(child, opts, innerHTML, parent) {
  var tag = createTag(child, opts, innerHTML);
  var tagName = opts.tagName || getTagName(opts.root, true);
  var ptag = getImmediateCustomParentTag(parent);
  // fix for the parent attribute in the looped elements
  defineProperty(tag, 'parent', ptag);
  // store the real parent tag
  // in some cases this could be different from the custom parent tag
  // for example in nested loops
  tag.__.parent = parent;

  // add this tag to the custom parent tag
  arrayishAdd(ptag.tags, tagName, tag);

  // and also to the real parent tag
  if (ptag !== parent)
    { arrayishAdd(parent.tags, tagName, tag); }

  return tag
}

/**
 * Loop backward all the parents tree to detect the first custom parent tag
 * @param   { Object } tag - a Tag instance
 * @returns { Object } the instance of the first custom parent tag found
 */
function getImmediateCustomParentTag(tag) {
  var ptag = tag;
  while (ptag.__.isAnonymous) {
    if (!ptag.parent) { break }
    ptag = ptag.parent;
  }
  return ptag
}

/**
 * Trigger the unmount method on all the expressions
 * @param   { Array } expressions - DOM expressions
 */
function unmountAll(expressions) {
  each(expressions, function (expr) {
    if (expr.unmount) { expr.unmount(true); }
    else if (expr.tagName) { expr.tag.unmount(true); }
    else if (expr.unmount) { expr.unmount(); }
  });
}

/**
 * Get the tag name of any DOM node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { Boolean } skipDataIs - hack to ignore the data-is attribute when attaching to parent
 * @returns { String } name to identify this dom node in riot
 */
function getTagName(dom, skipDataIs) {
  var child = getTag(dom);
  var namedTag = !skipDataIs && getAttr(dom, IS_DIRECTIVE);
  return namedTag && !tmpl.hasExpr(namedTag) ?
    namedTag : child ? child.name : dom.tagName.toLowerCase()
}

/**
 * Set the property of an object for a given key. If something already
 * exists there, then it becomes an array containing both the old and new value.
 * @param { Object } obj - object on which to set the property
 * @param { String } key - property name
 * @param { Object } value - the value of the property to be set
 * @param { Boolean } ensureArray - ensure that the property remains an array
 * @param { Number } index - add the new item in a certain array position
 */
function arrayishAdd(obj, key, value, ensureArray, index) {
  var dest = obj[key];
  var isArr = isArray(dest);
  var hasIndex = !isUndefined(index);

  if (dest && dest === value) { return }

  // if the key was never set, set it once
  if (!dest && ensureArray) { obj[key] = [value]; }
  else if (!dest) { obj[key] = value; }
  // if it was an array and not yet set
  else {
    if (isArr) {
      var oldIndex = dest.indexOf(value);
      // this item never changed its position
      if (oldIndex === index) { return }
      // remove the item from its old position
      if (oldIndex !== -1) { dest.splice(oldIndex, 1); }
      // move or add the item
      if (hasIndex) {
        dest.splice(index, 0, value);
      } else {
        dest.push(value);
      }
    } else { obj[key] = [dest, value]; }
  }
}

/**
 * Removes an item from an object at a given key. If the key points to an array,
 * then the item is just removed from the array.
 * @param { Object } obj - object on which to remove the property
 * @param { String } key - property name
 * @param { Object } value - the value of the property to be removed
 * @param { Boolean } ensureArray - ensure that the property remains an array
*/
function arrayishRemove(obj, key, value, ensureArray) {
  if (isArray(obj[key])) {
    var index = obj[key].indexOf(value);
    if (index !== -1) { obj[key].splice(index, 1); }
    if (!obj[key].length) { delete obj[key]; }
    else if (obj[key].length === 1 && !ensureArray) { obj[key] = obj[key][0]; }
  } else if (obj[key] === value)
    { delete obj[key]; } // otherwise just delete the key
}

/**
 * Mount a tag creating new Tag instance
 * @param   { Object } root - dom node where the tag will be mounted
 * @param   { String } tagName - name of the riot tag we want to mount
 * @param   { Object } opts - options to pass to the Tag instance
 * @param   { Object } ctx - optional context that will be used to extend an existing class ( used in riot.Tag )
 * @returns { Tag } a new Tag instance
 */
function mountTo(root, tagName, opts, ctx) {
  var impl = __TAG_IMPL[tagName];
  var implClass = __TAG_IMPL[tagName].class;
  var context = ctx || (implClass ? Object.create(implClass.prototype) : {});
  // cache the inner HTML to fix #855
  var innerHTML = root._innerHTML = root._innerHTML || root.innerHTML;
  var conf = extend({ root: root, opts: opts, context: context }, { parent: opts ? opts.parent : null });
  var tag;

  if (impl && root) { tag = createTag(impl, conf, innerHTML); }

  if (tag && tag.mount) {
    tag.mount(true);
    // add this tag to the virtualDom variable
    if (!contains(__TAGS_CACHE, tag)) { __TAGS_CACHE.push(tag); }
  }

  return tag
}

/**
 * makes a tag virtual and replaces a reference in the dom
 * @this Tag
 * @param { tag } the tag to make virtual
 * @param { ref } the dom reference location
 */
function makeReplaceVirtual(tag, ref) {
  var frag = createFrag();
  makeVirtual.call(tag, frag);
  ref.parentNode.replaceChild(frag, ref);
}

/**
 * Adds the elements for a virtual tag
 * @this Tag
 * @param { Node } src - the node that will do the inserting or appending
 * @param { Tag } target - only if inserting, insert before this tag's first child
 */
function makeVirtual(src, target) {
  var this$1 = this;

  var head = createDOMPlaceholder();
  var tail = createDOMPlaceholder();
  var frag = createFrag();
  var sib;
  var el;

  this.root.insertBefore(head, this.root.firstChild);
  this.root.appendChild(tail);

  this.__.head = el = head;
  this.__.tail = tail;

  while (el) {
    sib = el.nextSibling;
    frag.appendChild(el);
    this$1.__.virts.push(el); // hold for unmounting
    el = sib;
  }

  if (target)
    { src.insertBefore(frag, target.__.head); }
  else
    { src.appendChild(frag); }
}

/**
 * Return a temporary context containing also the parent properties
 * @this Tag
 * @param { Tag } - temporary tag context containing all the parent properties
 */
function inheritParentProps() {
  if (this.parent) { return extend(Object.create(this), this.parent) }
  return this
}

/**
 * Move virtual tag and all child nodes
 * @this Tag
 * @param { Node } src  - the node that will do the inserting
 * @param { Tag } target - insert before this tag's first child
 */
function moveVirtual(src, target) {
  var this$1 = this;

  var el = this.__.head;
  var sib;
  var frag = createFrag();

  while (el) {
    sib = el.nextSibling;
    frag.appendChild(el);
    el = sib;
    if (el === this$1.__.tail) {
      frag.appendChild(el);
      src.insertBefore(frag, target.__.head);
      break
    }
  }
}

/**
 * Get selectors for tags
 * @param   { Array } tags - tag names to select
 * @returns { String } selector
 */
function selectTags(tags) {
  // select all tags
  if (!tags) {
    var keys = Object.keys(__TAG_IMPL);
    return keys + selectTags(keys)
  }

  return tags
    .filter(function (t) { return !/[^-\w]/.test(t); })
    .reduce(function (list, t) {
      var name = t.trim().toLowerCase();
      return list + ",[" + IS_DIRECTIVE + "=\"" + name + "\"]"
    }, '')
}


var tags = Object.freeze({
	getTag: getTag,
	moveChildTag: moveChildTag,
	initChildTag: initChildTag,
	getImmediateCustomParentTag: getImmediateCustomParentTag,
	unmountAll: unmountAll,
	getTagName: getTagName,
	arrayishAdd: arrayishAdd,
	arrayishRemove: arrayishRemove,
	mountTo: mountTo,
	makeReplaceVirtual: makeReplaceVirtual,
	makeVirtual: makeVirtual,
	inheritParentProps: inheritParentProps,
	moveVirtual: moveVirtual,
	selectTags: selectTags
});

/**
 * Riot public api
 */
var settings$1 = settings;
var util = {
  tmpl: tmpl,
  brackets: brackets,
  styleManager: styleManager,
  vdom: __TAGS_CACHE,
  styleNode: styleManager.styleNode,
  // export the riot internal utils as well
  dom: dom,
  check: check,
  misc: misc,
  tags: tags
};

// export the core props/methods










var riot$1 = extend({}, core, {
  observable: observable,
  settings: settings$1,
  util: util,
})

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
var settings$2 = {
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

  if (!settings$2.debug) {
    return;
  }
  args.unshift('DEBUG');
  settings$2.logger.output.apply(null, args);
};

/**
 * console error output
 * @param {*} message
 */
var error = function (message) {
  var err = new Error(("[riotx] " + message));
  settings$2.logger.output.apply(null, ['ERROR', err]);
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
    this.name = settings$2.default;
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
      if (settings$2.strict) {
        error('[strict] Direct access get error.');
      }
      return this$1._state;
    },
    set: function (state) {

      if (settings$2.strict) {
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

  riot$1.observable(this);

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
  riot$1.mixin({
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
        delete this$1[settings$2.changeBindName];
      });

      if (settings$2.debug) {
        this.on('*', function (eventName) {
          debug('[riot.mixin]', eventName, this$1);
        });
      }

      // let users set the name.
      this[settings$2.changeBindName] = riotxChange;
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
    if ( name === void 0 ) name = settings$2.default;

  return this.stores[name];
};

/**
 * Set debug flag
 * @param {boolean} flag
 * @memberof RiotX
 * @returns {RiotX}
 */
RiotX.prototype.debug = function debug (flag) {
  settings$2.debug = !!flag;
  return this;
};

/**
 * Set function name to bind store change event.
 * @param {String} name
 * @memberof RiotX
 * @returns {RiotX}
 */
RiotX.prototype.setChangeBindName = function setChangeBindName (name) {
  settings$2.changeBindName = name;
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
  settings$2.strict = !!flag;
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
  settings$2.logger.output = fn;
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

return index;

});
//# sourceMappingURL=amd.riotx+riot.js.map
