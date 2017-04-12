/* riotx version 0.0.1 */
var VERSION = "0.0.1";

import riot from 'riot';

/**
 * log output
 */
var log = function() {
  if (!settings.debug) {
    return;
  }

  var args = Array.prototype.slice.call(arguments);
  args.unshift('[riotx]');
  //args.push(new Error('stack')); // stack trace
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
  default: '@'
};

var Store = function Store(_store) {

  this.name = _store.name;
  if (!this.name) {
    this.name = settings.default;
    log('Default store name. name=' + this.name);
  }

  this.state = _store.state ? Object.assign({}, _store.state) : {};
  this.actions = _store.actions ? _store.actions : {};
  this.mutations = _store.mutations ? _store.mutations : {};
  this.getters = _store.getters ? _store.getters : {};

  riot.observable(this);

};

/**
 * Commit mutation
 * @param name mutation name
 * @param obj commit data object
 */
Store.prototype.commit = function commit (name, obj) {
  var _state = Object.assign({}, this.state);
  this.mutations[name].apply(this, [_state, obj]);
  Object.assign(this.state, _state); // commit!!!
};

/**
 * emit action
 * @param [0] action name
 * @param [1...] parameter's to action
 */
Store.prototype.action = function action () {
    var this$1 = this;

  var args = [].slice.call(arguments);
  var name = args.shift();
  // args.push(Object.assign({}, this.state));

  args.push(function (err, _state) {
    // TODO err
    var res = Object.assign(this$1.state, _state);
    log('[trigger]', name, res);
    // return emit view component's
    this$1.trigger(name, null, res, this$1);
  });

  // emit action
  this.actions[name].apply(this, args);
};

var RiotX = function RiotX() {
  this.version = VERSION || '';
  this.settings = settings;
  this.Store = Store;
  this.stores = {};

  var self = this;
  riot.mixin({
    init: function () {
      var self = this;
      this.on('unmount', function () {
        self.off('*');
      });

      if (self.debug) {
        // curious about all events ?
        this.on('*', function (eventName) {
          console.log('events.*', eventName);
        });
      }
    },
    riotx: self,
  });
};


/**
 * Add store instance
 * @param store RiotX.Store instance
 * @returns {RiotX}
 */
RiotX.prototype.add = function add (store) {
  if (this.stores[store.name]) {
    var err = new Error('The store has been overwritten. name=' + store.name);
    throw err;
  }

  this.stores[store.name] = store;
  return this;
};

/**
 * Get store instance
 * @param name store name
 * @returns {RiotX.Store} store instance
 */
RiotX.prototype.get = function get (name) {
  name = name ? name : settings.default;
  return this.stores[name];
};

var index = new RiotX();

export default index;
