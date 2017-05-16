/* riotx version 0.9.1 */
'use strict';

var VERSION = "0.9.1";

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var riot = _interopDefault(require('riot'));

/**
     * Appends an array to the end of another.
     * The first array will be modified.
     */
    function append(arr1, arr2) {
        if (arr2 == null) {
            return arr1;
        }

        var pad = arr1.length,
            i = -1,
            len = arr2.length;
        while (++i < len) {
            arr1[pad + i] = arr2[i];
        }
        return arr1;
    }
    var append_1 = append;

/**
     * Returns the first argument provided to it.
     */
    function identity(val){
        return val;
    }

    var identity_1 = identity;

/**
     * Returns a function that gets a property of the passed object
     */
    function prop(name){
        return function(obj){
            return obj[name];
        };
    }

    var prop_1 = prop;

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

var _rKind = /^\[object (.*)\]$/;
var _toString = Object.prototype.toString;
var UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     */
    function kindOf(val) {
        if (val === null) {
            return 'Null';
        } else if (val === UNDEF) {
            return 'Undefined';
        } else {
            return _rKind.exec( _toString.call(val) )[1];
        }
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
    var isArray = Array.isArray || function (val) {
        return isKind_1(val, 'Array');
    };
    var isArray_1 = isArray;

function containsMatch(array, pattern) {
        var i = -1, length = array.length;
        while (++i < length) {
            if (deepMatches(array[i], pattern)) {
                return true;
            }
        }

        return false;
    }

    function matchArray(target, pattern) {
        var i = -1, patternLength = pattern.length;
        while (++i < patternLength) {
            if (!containsMatch(target, pattern[i])) {
                return false;
            }
        }

        return true;
    }

    function matchObject(target, pattern) {
        var result = true;
        forOwn_1(pattern, function(val, key) {
            if (!deepMatches(target[key], val)) {
                // Return false to break out of forOwn early
                return (result = false);
            }
        });

        return result;
    }

    /**
     * Recursively check if the objects match.
     */
    function deepMatches(target, pattern){
        if (target && typeof target === 'object' &&
            pattern && typeof pattern === 'object') {
            if (isArray_1(target) && isArray_1(pattern)) {
                return matchArray(target, pattern);
            } else {
                return matchObject(target, pattern);
            }
        } else {
            return target === pattern;
        }
    }

    var deepMatches_1 = deepMatches;

/**
     * Converts argument into a valid iterator.
     * Used internally on most array/object/collection methods that receives a
     * callback/iterator providing a shortcut syntax.
     */
    function makeIterator(src, thisObj){
        if (src == null) {
            return identity_1;
        }
        switch(typeof src) {
            case 'function':
                // function is the first to improve perf (most common case)
                // also avoid using `Function#call` if not needed, which boosts
                // perf a lot in some cases
                return (typeof thisObj !== 'undefined')? function(val, i, arr){
                    return src.call(thisObj, val, i, arr);
                } : src;
            case 'object':
                return function(val){
                    return deepMatches_1(val, src);
                };
            case 'string':
            case 'number':
                return prop_1(src);
        }
    }

    var makeIterator_ = makeIterator;

/**
     * Maps the items in the array and concatenates the result arrays.
     */
    function collect(arr, callback, thisObj){
        callback = makeIterator_(callback, thisObj);
        var results = [];
        if (arr == null) {
            return results;
        }

        var i = -1, len = arr.length;
        while (++i < len) {
            var value = callback(arr[i], i, arr);
            if (value != null) {
                append_1(results, value);
            }
        }

        return results;
    }

    var collect_1 = collect;

/**
     * Array.indexOf
     */
    function indexOf(arr, item, fromIndex) {
        fromIndex = fromIndex || 0;
        if (arr == null) {
            return -1;
        }

        var len = arr.length,
            i = fromIndex < 0 ? len + fromIndex : fromIndex;
        while (i < len) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if (arr[i] === item) {
                return i;
            }

            i++;
        }

        return -1;
    }

    var indexOf_1 = indexOf;

/**
     * Combines an array with all the items of another.
     * Does not allow duplicates and is case and type sensitive.
     */
    function combine(arr1, arr2) {
        if (arr2 == null) {
            return arr1;
        }

        var i = -1, len = arr2.length;
        while (++i < len) {
            if (indexOf_1(arr1, arr2[i]) === -1) {
                arr1.push(arr2[i]);
            }
        }

        return arr1;
    }
    var combine_1 = combine;

/**
     * Array filter
     */
    function filter(arr, callback, thisObj) {
        callback = makeIterator_(callback, thisObj);
        var results = [];
        if (arr == null) {
            return results;
        }

        var i = -1, len = arr.length, value;
        while (++i < len) {
            value = arr[i];
            if (callback(value, i, arr)) {
                results.push(value);
            }
        }

        return results;
    }

    var filter_1 = filter;

/**
     * Remove all null/undefined items from array.
     */
    function compact(arr) {
        return filter_1(arr, function(val){
            return (val != null);
        });
    }

    var compact_1 = compact;

/**
     * If array contains values.
     */
    function contains(arr, val) {
        return indexOf_1(arr, val) !== -1;
    }
    var contains_1 = contains;

/**
     * @return {array} Array of unique items
     */
    function unique(arr, compare){
        compare = compare || isEqual;
        return filter_1(arr, function(item, i, arr){
            var n = arr.length;
            while (++i < n) {
                if ( compare(item, arr[i]) ) {
                    return false;
                }
            }
            return true;
        });
    }

    function isEqual(a, b){
        return a === b;
    }

    var unique_1 = unique;

/**
     * Array some
     */
    function some(arr, callback, thisObj) {
        callback = makeIterator_(callback, thisObj);
        var result = false;
        if (arr == null) {
            return result;
        }

        var i = -1, len = arr.length;
        while (++i < len) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if ( callback(arr[i], i, arr) ) {
                result = true;
                break;
            }
        }

        return result;
    }

    var some_1 = some;

/**
     * Create slice of source array or array-like object
     */
    function slice(arr, start, end){
        var len = arr.length;

        if (start == null) {
            start = 0;
        } else if (start < 0) {
            start = Math.max(len + start, 0);
        } else {
            start = Math.min(start, len);
        }

        if (end == null) {
            end = len;
        } else if (end < 0) {
            end = Math.max(len + end, 0);
        } else {
            end = Math.min(end, len);
        }

        var result = [];
        while (start < end) {
            result.push(arr[start++]);
        }

        return result;
    }

    var slice_1 = slice;

/**
     * Return a new Array with elements that aren't present in the other Arrays.
     */
    function difference(arr) {
        var arrs = slice_1(arguments, 1),
            result = filter_1(unique_1(arr), function(needle){
                return !some_1(arrs, function(haystack){
                    return contains_1(haystack, needle);
                });
            });
        return result;
    }

    var difference_1 = difference;

/**
     * Check if both arguments are egal.
     */
    function is(x, y){
        // implementation borrowed from harmony:egal spec
        if (x === y) {
          // 0 === -0, but they are not identical
          return x !== 0 || 1 / x === 1 / y;
        }

        // NaN !== NaN, but they are identical.
        // NaNs are the only non-reflexive value, i.e., if x !== x,
        // then x is a NaN.
        // isNaN is broken: it converts its argument to number, so
        // isNaN("foo") => true
        return x !== x && y !== y;
    }

    var is_1 = is;

/**
     * Array every
     */
    function every(arr, callback, thisObj) {
        callback = makeIterator_(callback, thisObj);
        var result = true;
        if (arr == null) {
            return result;
        }

        var i = -1, len = arr.length;
        while (++i < len) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if (!callback(arr[i], i, arr) ) {
                result = false;
                break;
            }
        }

        return result;
    }

    var every_1 = every;

/**
     * Compares if both arrays have the same elements
     */
    function equals(a, b, callback){
        callback = callback || is_1;

        if (!isArray_1(a) || !isArray_1(b)) {
            return callback(a, b);
        }

        if (a.length !== b.length) {
            return false;
        }

        return every_1(a, makeCompare(callback), b);
    }

    function makeCompare(callback) {
        return function(value, i) {
            return i in this && callback(value, this[i]);
        };
    }

    var equals_1 = equals;

/**
     * Returns the index of the first item that matches criteria
     */
    function findIndex(arr, iterator, thisObj){
        iterator = makeIterator_(iterator, thisObj);
        if (arr == null) {
            return -1;
        }

        var i = -1, len = arr.length;
        while (++i < len) {
            if (iterator(arr[i], i, arr)) {
                return i;
            }
        }

        return -1;
    }

    var findIndex_1 = findIndex;

/**
     * Returns first item that matches criteria
     */
    function find(arr, iterator, thisObj){
        var idx = findIndex_1(arr, iterator, thisObj);
        return idx >= 0? arr[idx] : void(0);
    }

    var find_1 = find;

/**
     * Returns the index of the last item that matches criteria
     */
    function findLastIndex(arr, iterator, thisObj){
        iterator = makeIterator_(iterator, thisObj);
        if (arr == null) {
            return -1;
        }

        var n = arr.length;
        while (--n >= 0) {
            if (iterator(arr[n], n, arr)) {
                return n;
            }
        }

        return -1;
    }

    var findLastIndex_1 = findLastIndex;

/**
     * Returns last item that matches criteria
     */
    function findLast(arr, iterator, thisObj){
        var idx = findLastIndex_1(arr, iterator, thisObj);
        return idx >= 0? arr[idx] : void(0);
    }

    var findLast_1 = findLast;

/*
     * Helper function to flatten to a destination array.
     * Used to remove the need to create intermediate arrays while flattening.
     */
    function flattenTo(arr, result, level) {
        if (level === 0) {
            append_1(result, arr);
            return result;
        }

        var value,
            i = -1,
            len = arr.length;
        while (++i < len) {
            value = arr[i];
            if (isArray_1(value)) {
                flattenTo(value, result, level - 1);
            } else {
                result.push(value);
            }
        }
        return result;
    }

    /**
     * Recursively flattens an array.
     * A new array containing all the elements is returned.
     * If level is specified, it will only flatten up to that level.
     */
    function flatten(arr, level) {
        if (arr == null) {
            return [];
        }

        level = level == null ? -1 : level;
        return flattenTo(arr, [], level);
    }

    var flatten_1 = flatten;

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
     * Bucket the array values.
     */
    function groupBy(arr, categorize, thisObj) {
        if (categorize) {
            categorize = makeIterator_(categorize, thisObj);
        } else {
            // Default to identity function.
            categorize = identity_1;
        }

        var buckets = {};
        forEach_1(arr, function(element) {
            var bucket = categorize(element);
            if (!(bucket in buckets)) {
                buckets[bucket] = [];
            }

            buckets[bucket].push(element);
        });

        return buckets;
    }

    var groupBy_1 = groupBy;

/**
     * Array indicesOf
     */
    function indicesOf(arr, item, fromIndex) {
        var results = [];
        if (arr == null) {
            return results;
        }

        fromIndex = typeof fromIndex === 'number' ? fromIndex : 0;

        var length = arr.length;
        var cursor = fromIndex >= 0 ? fromIndex : length + fromIndex;

        while (cursor < length) {
            if (arr[cursor] === item) {
                results.push(cursor);
            }
            cursor++;
        }

        return results;
    }

    var indicesOf_1 = indicesOf;

/**
     * Insert item into array if not already present.
     */
    function insert(arr, rest_items) {
        var diff = difference_1(slice_1(arguments, 1), arr);
        if (diff.length) {
            Array.prototype.push.apply(arr, diff);
        }
        return arr.length;
    }
    var insert_1 = insert;

/**
     * Return a new Array with elements common to all Arrays.
     * - based on underscore.js implementation
     */
    function intersection(arr) {
        var arrs = slice_1(arguments, 1),
            result = filter_1(unique_1(arr), function(needle){
                return every_1(arrs, function(haystack){
                    return contains_1(haystack, needle);
                });
            });
        return result;
    }

    var intersection_1 = intersection;

/**
     * Call `methodName` on each item of the array passing custom arguments if
     * needed.
     */
    function invoke(arr, methodName, var_args){
        if (arr == null) {
            return arr;
        }

        var args = slice_1(arguments, 2);
        var i = -1, len = arr.length, value;
        while (++i < len) {
            value = arr[i];
            value[methodName].apply(value, args);
        }

        return arr;
    }

    var invoke_1 = invoke;

function isValidString(val) {
        return (val != null && val !== '');
    }

    /**
     * Joins strings with the specified separator inserted between each value.
     * Null values and empty strings will be excluded.
     */
    function join(items, separator) {
        separator = separator || '';
        return filter_1(items, isValidString).join(separator);
    }

    var join_1 = join;

/**
     * Returns last element of array.
     */
    function last(arr){
        if (arr == null || arr.length < 1) {
            return undefined;
        }

        return arr[arr.length - 1];
    }

    var last_1 = last;

/**
     * Array lastIndexOf
     */
    function lastIndexOf(arr, item, fromIndex) {
        if (arr == null) {
            return -1;
        }

        var len = arr.length;
        fromIndex = (fromIndex == null || fromIndex >= len)? len - 1 : fromIndex;
        fromIndex = (fromIndex < 0)? len + fromIndex : fromIndex;

        while (fromIndex >= 0) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if (arr[fromIndex] === item) {
                return fromIndex;
            }
            fromIndex--;
        }

        return -1;
    }

    var lastIndexOf_1 = lastIndexOf;

/**
     * Array map
     */
    function map(arr, callback, thisObj) {
        callback = makeIterator_(callback, thisObj);
        var results = [];
        if (arr == null){
            return results;
        }

        var i = -1, len = arr.length;
        while (++i < len) {
            results[i] = callback(arr[i], i, arr);
        }

        return results;
    }

     var map_1 = map;

/**
     * Return maximum value inside array
     */
    function max(arr, iterator, thisObj){
        if (arr == null || !arr.length) {
            return Infinity;
        } else if (arr.length && !iterator) {
            return Math.max.apply(Math, arr);
        } else {
            iterator = makeIterator_(iterator, thisObj);
            var result,
                compare = -Infinity,
                value,
                temp;

            var i = -1, len = arr.length;
            while (++i < len) {
                value = arr[i];
                temp = iterator(value, i, arr);
                if (temp > compare) {
                    compare = temp;
                    result = value;
                }
            }

            return result;
        }
    }

    var max_1 = max;

/**
     * Return minimum value inside array
     */
    function min(arr, iterator, thisObj){
        if (arr == null || !arr.length) {
            return -Infinity;
        } else if (arr.length && !iterator) {
            return Math.min.apply(Math, arr);
        } else {
            iterator = makeIterator_(iterator, thisObj);
            var result,
                compare = Infinity,
                value,
                temp;

            var i = -1, len = arr.length;
            while (++i < len) {
                value = arr[i];
                temp = iterator(value, i, arr);
                if (temp < compare) {
                    compare = temp;
                    result = value;
                }
            }

            return result;
        }
    }

    var min_1 = min;

/**
 * @constant Minimum 32-bit signed integer value (-2^31).
 */

    var MIN_INT = -2147483648;

/**
 * @constant Maximum 32-bit signed integer value. (2^31 - 1)
 */

    var MAX_INT = 2147483647;

/**
     * Just a wrapper to Math.random. No methods inside mout/random should call
     * Math.random() directly so we can inject the pseudo-random number
     * generator if needed (ie. in case we need a seeded random or a better
     * algorithm than the native one)
     */
    function random(){
        return random.get();
    }

    // we expose the method so it can be swapped if needed
    random.get = Math.random;

    var random_1 = random;

/**
     * Returns random number inside range
     */
    function rand(min, max){
        min = min == null? MIN_INT : min;
        max = max == null? MAX_INT : max;
        return min + (max - min) * random_1();
    }

    var rand_1 = rand;

/**
     * Gets random integer inside range or snap to min/max values.
     */
    function randInt(min, max){
        min = min == null? MIN_INT : ~~min;
        max = max == null? MAX_INT : ~~max;
        // can't be max + 0.5 otherwise it will round up if `rand`
        // returns `max` causing it to overflow range.
        // -0.5 and + 0.49 are required to avoid bias caused by rounding
        return Math.round( rand_1(min - 0.5, max + 0.499999999999) );
    }

    var randInt_1 = randInt;

/**
     * Remove random item(s) from the Array and return it.
     * Returns an Array of items if [nItems] is provided or a single item if
     * it isn't specified.
     */
    function pick(arr, nItems){
        if (nItems != null) {
            var result = [];
            if (nItems > 0 && arr && arr.length) {
                nItems = nItems > arr.length? arr.length : nItems;
                while (nItems--) {
                    result.push( pickOne(arr) );
                }
            }
            return result;
        }
        return (arr && arr.length)? pickOne(arr) : void(0);
    }


    function pickOne(arr){
        var idx = randInt_1(0, arr.length - 1);
        return arr.splice(idx, 1)[0];
    }


    var pick_1 = pick;

/**
     * Extract a list of property values.
     */
    function pluck(arr, propName){
        return map_1(arr, propName);
    }

    var pluck_1 = pluck;

/**
    * Count number of full steps.
    */
    function countSteps(val, step, overflow){
        val = Math.floor(val / step);

        if (overflow) {
            return val % overflow;
        }

        return val;
    }

    var countSteps_1 = countSteps;

/**
     * Returns an Array of numbers inside range.
     */
    function range(start, stop, step) {
        if (stop == null) {
            stop = start;
            start = 0;
        }
        step = step || 1;

        var result = [],
            nSteps = countSteps_1(stop - start, step),
            i = start;

        while (i <= stop) {
            result.push(i);
            i += step;
        }

        return result;
    }

    var range_1 = range;

/**
     * Array reduce
     */
    function reduce(arr, fn, initVal) {
        // check for args.length since initVal might be "undefined" see #gh-57
        var hasInit = arguments.length > 2,
            result = initVal;

        if (arr == null || !arr.length) {
            if (!hasInit) {
                throw new Error('reduce of empty array with no initial value');
            } else {
                return initVal;
            }
        }

        var i = -1, len = arr.length;
        while (++i < len) {
            if (!hasInit) {
                result = arr[i];
                hasInit = true;
            } else {
                result = fn(result, arr[i], i, arr);
            }
        }

        return result;
    }

    var reduce_1 = reduce;

/**
     * Array reduceRight
     */
    function reduceRight(arr, fn, initVal) {
        // check for args.length since initVal might be "undefined" see #gh-57
        var hasInit = arguments.length > 2;

        if (arr == null || !arr.length) {
            if (hasInit) {
                return initVal;
            } else {
                throw new Error('reduce of empty array with no initial value');
            }
        }

        var i = arr.length, result = initVal, value;
        while (--i >= 0) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            value = arr[i];
            if (!hasInit) {
                result = value;
                hasInit = true;
            } else {
                result = fn(result, value, i, arr);
            }
        }
        return result;
    }

    var reduceRight_1 = reduceRight;

/**
     * Array reject
     */
    function reject(arr, callback, thisObj) {
        callback = makeIterator_(callback, thisObj);
        var results = [];
        if (arr == null) {
            return results;
        }

        var i = -1, len = arr.length, value;
        while (++i < len) {
            value = arr[i];
            if (!callback(value, i, arr)) {
                results.push(value);
            }
        }

        return results;
    }

    var reject_1 = reject;

/**
     * Remove a single item from the array.
     * (it won't remove duplicates, just a single item)
     */
    function remove(arr, item){
        var idx = indexOf_1(arr, item);
        if (idx !== -1) { arr.splice(idx, 1); }
    }

    var remove_1 = remove;

/**
     * Remove all instances of an item from array.
     */
    function removeAll(arr, item){
        var idx = indexOf_1(arr, item);
        while (idx !== -1) {
            arr.splice(idx, 1);
            idx = indexOf_1(arr, item, idx);
        }
    }

    var removeAll_1 = removeAll;

/**
     * Returns a copy of the array in reversed order.
     */
    function reverse(array) {
        var copy = array.slice();
        copy.reverse();
        return copy;
    }

    var reverse_1 = reverse;

/**
     * Shuffle array items.
     */
    function shuffle(arr) {
        var results = [],
            rnd;
        if (arr == null) {
            return results;
        }

        var i = -1, len = arr.length;
        while (++i < len) {
            if (!i) {
                results[0] = arr[0];
            } else {
                rnd = randInt_1(0, i);
                results[i] = results[rnd];
                results[rnd] = arr[i];
            }
        }

        return results;
    }

    var shuffle_1 = shuffle;

/**
     * Merge sort (http://en.wikipedia.org/wiki/Merge_sort)
     */
    function mergeSort(arr, compareFn) {
        if (arr == null) {
            return [];
        } else if (arr.length < 2) {
            return arr;
        }

        if (compareFn == null) {
            compareFn = defaultCompare;
        }

        var mid, left, right;

        mid   = ~~(arr.length / 2);
        left  = mergeSort( arr.slice(0, mid), compareFn );
        right = mergeSort( arr.slice(mid, arr.length), compareFn );

        return merge(left, right, compareFn);
    }

    function defaultCompare(a, b) {
        return a < b ? -1 : (a > b? 1 : 0);
    }

    function merge(left, right, compareFn) {
        var result = [];

        while (left.length && right.length) {
            if (compareFn(left[0], right[0]) <= 0) {
                // if 0 it should preserve same order (stable)
                result.push(left.shift());
            } else {
                result.push(right.shift());
            }
        }

        if (left.length) {
            result.push.apply(result, left);
        }

        if (right.length) {
            result.push.apply(result, right);
        }

        return result;
    }

    var sort = mergeSort;

/*
     * Sort array by the result of the callback
     */
    function sortBy(arr, callback, context){
        callback = makeIterator_(callback, context);

        return sort(arr, function(a, b) {
            a = callback(a);
            b = callback(b);
            return (a < b) ? -1 : ((a > b) ? 1 : 0);
        });
    }

    var sortBy_1 = sortBy;

/**
     * Split array into a fixed number of segments.
     */
    function split(array, segments) {
        segments = segments || 2;
        var results = [];
        if (array == null) {
            return results;
        }

        var minLength = Math.floor(array.length / segments),
            remainder = array.length % segments,
            i = 0,
            len = array.length,
            segmentIndex = 0,
            segmentLength;

        while (i < len) {
            segmentLength = minLength;
            if (segmentIndex < remainder) {
                segmentLength++;
            }

            results.push(array.slice(i, i + segmentLength));

            segmentIndex++;
            i += segmentLength;
        }

        return results;
    }
    var split_1 = split;

/**
     * Iterates over a callback a set amount of times
     * returning the results
     */
    function take(n, callback, thisObj){
        var i = -1;
        var arr = [];
        if( !thisObj ){
            while(++i < n){
                arr[i] = callback(i, n);
            }
        } else {
            while(++i < n){
                arr[i] = callback.call(thisObj, i, n);
            }
        }
        return arr;
    }

    var take_1 = take;

/**
     */
    function isFunction(val) {
        return isKind_1(val, 'Function');
    }
    var isFunction_1 = isFunction;

/**
     * Creates an object that holds a lookup for the objects in the array.
     */
    function toLookup(arr, key) {
        var result = {};
        if (arr == null) {
            return result;
        }

        var i = -1, len = arr.length, value;
        if (isFunction_1(key)) {
            while (++i < len) {
                value = arr[i];
                result[key(value)] = value;
            }
        } else {
            while (++i < len) {
                value = arr[i];
                result[value[key]] = value;
            }
        }

        return result;
    }
    var toLookup_1 = toLookup;

/**
     * Concat multiple arrays and remove duplicates
     */
    function union(arrs) {
        var arguments$1 = arguments;

        var results = [];
        var i = -1, len = arguments.length;
        while (++i < len) {
            append_1(results, arguments$1[i]);
        }

        return unique_1(results);
    }

    var union_1 = union;

/**
     * Exclusive OR. Returns items that are present in a single array.
     * - like ptyhon's `symmetric_difference`
     */
    function xor(arr1, arr2) {
        arr1 = unique_1(arr1);
        arr2 = unique_1(arr2);

        var a1 = filter_1(arr1, function(item){
                return !contains_1(arr2, item);
            }),
            a2 = filter_1(arr2, function(item){
                return !contains_1(arr1, item);
            });

        return a1.concat(a2);
    }

    var xor_1 = xor;

function getLength(arr) {
        return arr == null ? 0 : arr.length;
    }

    /**
     * Merges together the values of each of the arrays with the values at the
     * corresponding position.
     */
    function zip(arr){
        var arguments$1 = arguments;

        var len = arr ? max_1(map_1(arguments, getLength)) : 0,
            results = [],
            i = -1;
        while (++i < len) {
            // jshint loopfunc: true
            results.push(map_1(arguments$1, function(item) {
                return item == null ? undefined : item[i];
            }));
        }

        return results;
    }

    var zip_1 = zip;

//automatically generated, do not edit!
//run `node build` instead
var array = {
    'append' : append_1,
    'collect' : collect_1,
    'combine' : combine_1,
    'compact' : compact_1,
    'contains' : contains_1,
    'difference' : difference_1,
    'equals' : equals_1,
    'every' : every_1,
    'filter' : filter_1,
    'find' : find_1,
    'findIndex' : findIndex_1,
    'findLast' : findLast_1,
    'findLastIndex' : findLastIndex_1,
    'flatten' : flatten_1,
    'forEach' : forEach_1,
    'groupBy' : groupBy_1,
    'indexOf' : indexOf_1,
    'indicesOf' : indicesOf_1,
    'insert' : insert_1,
    'intersection' : intersection_1,
    'invoke' : invoke_1,
    'join' : join_1,
    'last' : last_1,
    'lastIndexOf' : lastIndexOf_1,
    'map' : map_1,
    'max' : max_1,
    'min' : min_1,
    'pick' : pick_1,
    'pluck' : pluck_1,
    'range' : range_1,
    'reduce' : reduce_1,
    'reduceRight' : reduceRight_1,
    'reject' : reject_1,
    'remove' : remove_1,
    'removeAll' : removeAll_1,
    'reverse' : reverse_1,
    'shuffle' : shuffle_1,
    'slice' : slice_1,
    'some' : some_1,
    'sort' : sort,
    'sortBy' : sortBy_1,
    'split' : split_1,
    'take' : take_1,
    'toLookup' : toLookup_1,
    'union' : union_1,
    'unique' : unique_1,
    'xor' : xor_1,
    'zip' : zip_1
};

var array_1 = array.forEach;

/**
     * return a list of all enumerable properties that have function values
     */
    function functions(obj){
        var keys = [];
        forIn_1(obj, function(val, key){
            if (typeof val === 'function'){
                keys.push(key);
            }
        });
        return keys.sort();
    }

    var functions_1 = functions;

/**
     * Return a function that will execute in the given context, optionally adding any additional supplied parameters to the beginning of the arguments collection.
     * @param {Function} fn  Function.
     * @param {object} context   Execution context.
     * @param {rest} args    Arguments (0...n arguments).
     * @return {Function} Wrapped Function.
     */
    function bind(fn, context, args){
        var argsArr = slice_1(arguments, 2); //curried args
        return function(){
            return fn.apply(context, argsArr.concat(slice_1(arguments)));
        };
    }

    var bind_1 = bind;

/**
     * Binds methods of the object to be run in it's own context.
     */
    function bindAll(obj, rest_methodNames){
        var keys = arguments.length > 1?
                    slice_1(arguments, 1) : functions_1(obj);
        forEach_1(keys, function(key){
            obj[key] = bind_1(obj[key], obj);
        });
    }

    var bindAll_1 = bindAll;

/**
     * Object some
     */
    function some$2(obj, callback, thisObj) {
        callback = makeIterator_(callback, thisObj);
        var result = false;
        forOwn_1(obj, function(val, key) {
            if (callback(val, key, obj)) {
                result = true;
                return false; // break
            }
        });
        return result;
    }

    var some_1$2 = some$2;

/**
     * Check if object contains value
     */
    function contains$2(obj, needle) {
        return some_1$2(obj, function(val) {
            return (val === needle);
        });
    }
    var contains_1$2 = contains$2;

/**
     * Checks if the value is created by the `Object` constructor.
     */
    function isPlainObject(value) {
        return (!!value && typeof value === 'object' &&
            value.constructor === Object);
    }

    var isPlainObject_1 = isPlainObject;

/**
     * Deeply copy missing properties in the target from the defaults.
     */
    function deepFillIn(target, defaults){
        var arguments$1 = arguments;

        var i = 0,
            n = arguments.length,
            obj;

        while(++i < n) {
            obj = arguments$1[i];
            if (obj) {
                // jshint loopfunc: true
                forOwn_1(obj, function(newValue, key) {
                    var curValue = target[key];
                    if (curValue == null) {
                        target[key] = newValue;
                    } else if (isPlainObject_1(curValue) &&
                               isPlainObject_1(newValue)) {
                        deepFillIn(curValue, newValue);
                    }
                });
            }
        }

        return target;
    }

    var deepFillIn_1 = deepFillIn;

/**
     * Mixes objects into the target object, recursively mixing existing child
     * objects.
     */
    function deepMixIn(target, objects) {
        var arguments$1 = arguments;

        var i = 0,
            n = arguments.length,
            obj;

        while(++i < n){
            obj = arguments$1[i];
            if (obj) {
                forOwn_1(obj, copyProp, target);
            }
        }

        return target;
    }

    function copyProp(val, key) {
        var existing = this[key];
        if (isPlainObject_1(val) && isPlainObject_1(existing)) {
            deepMixIn(existing, val);
        } else {
            this[key] = val;
        }
    }

    var deepMixIn_1 = deepMixIn;

/**
     * Object every
     */
    function every$2(obj, callback, thisObj) {
        callback = makeIterator_(callback, thisObj);
        var result = true;
        forOwn_1(obj, function(val, key) {
            // we consider any falsy values as "false" on purpose so shorthand
            // syntax can be used to check property existence
            if (!callback(val, key, obj)) {
                result = false;
                return false; // break
            }
        });
        return result;
    }

    var every_1$2 = every$2;

/**
     */
    function isObject(val) {
        return isKind_1(val, 'Object');
    }
    var isObject_1 = isObject;

// Makes a function to compare the object values from the specified compare
    // operation callback.
    function makeCompare$1(callback) {
        return function(value, key) {
            return hasOwn_1(this, key) && callback(value, this[key]);
        };
    }

    function checkProperties(value, key) {
        return hasOwn_1(this, key);
    }

    /**
     * Checks if two objects have the same keys and values.
     */
    function equals$1(a, b, callback) {
        callback = callback || is_1;

        if (!isObject_1(a) || !isObject_1(b)) {
            return callback(a, b);
        }

        return (every_1$2(a, makeCompare$1(callback), b) &&
                every_1$2(b, checkProperties, a));
    }

    var equals_1$2 = equals$1;

/**
     * Copy missing properties in the obj from the defaults.
     */
    function fillIn(obj, var_defaults){
        forEach_1(slice_1(arguments, 1), function(base){
            forOwn_1(base, function(val, key){
                if (obj[key] == null) {
                    obj[key] = val;
                }
            });
        });
        return obj;
    }

    var fillIn_1 = fillIn;

/**
     * Creates a new object with all the properties where the callback returns
     * true.
     */
    function filterValues(obj, callback, thisObj) {
        callback = makeIterator_(callback, thisObj);
        var output = {};
        forOwn_1(obj, function(value, key, obj) {
            if (callback(value, key, obj)) {
                output[key] = value;
            }
        });

        return output;
    }
    var filter$2 = filterValues;

/**
     * Returns first item that matches criteria
     */
    function find$1(obj, callback, thisObj) {
        callback = makeIterator_(callback, thisObj);
        var result;
        some_1$2(obj, function(value, key, obj) {
            if (callback(value, key, obj)) {
                result = value;
                return true; //break
            }
        });
        return result;
    }

    var find_1$2 = find$1;

/*
     * Helper function to flatten to a destination object.
     * Used to remove the need to create intermediate objects while flattening.
     */
    function flattenTo$1(obj, result, prefix, level) {
        forOwn_1(obj, function (value, key) {
            var nestedPrefix = prefix ? prefix + '.' + key : key;

            if (level !== 0 && isPlainObject_1(value)) {
                flattenTo$1(value, result, nestedPrefix, level - 1);
            } else {
                result[nestedPrefix] = value;
            }
        });

        return result;
    }

    /**
     * Recursively flattens an object.
     * A new object containing all the elements is returned.
     * If level is specified, it will only flatten up to that level.
     */
    function flatten$1(obj, level) {
        if (obj == null) {
            return {};
        }

        level = level == null ? -1 : level;
        return flattenTo$1(obj, {}, '', level);
    }

    var flatten_1$2 = flatten$1;

/**
     * Checks if the object is a primitive
     */

/**
     * get "nested" object property
     */
    function get(obj, prop){
        var parts = prop.split('.'),
            last = parts.pop();

        while (prop = parts.shift()) {
            obj = obj[prop];
            if (obj == null) { return; }
        }

        return obj[last];
    }

    var get_1 = get;

var UNDEF$1;

    /**
     * Check if object has nested property.
     */
    function has(obj, prop){
        return get_1(obj, prop) !== UNDEF$1;
    }

    var has_1 = has;

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
     * Creates a new object where all the values are the result of calling
     * `callback`.
     */
    function mapValues(obj, callback, thisObj) {
        callback = makeIterator_(callback, thisObj);
        var output = {};
        forOwn_1(obj, function(val, key, obj) {
            output[key] = callback(val, key, obj);
        });

        return output;
    }
    var map$2 = mapValues;

/**
     * checks if a object contains all given properties/values
     */
    function matches(target, props){
        // can't use "object/every" because of circular dependency
        var result = true;
        forOwn_1(props, function(val, key){
            if (target[key] !== val) {
                // break loop at first difference
                return (result = false);
            }
        });
        return result;
    }

    var matches_1 = matches;

/**
     * Get object values
     */
    function values(obj) {
        var vals = [];
        forOwn_1(obj, function(val, key){
            vals.push(val);
        });
        return vals;
    }

    var values_1 = values;

/**
     * Returns maximum value inside object.
     */
    function max$1(obj, compareFn) {
        return max_1(values_1(obj), compareFn);
    }

    var max_1$2 = max$1;

/**
    * Combine properties from all the objects into first one.
    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
    * @param {object} target    Target Object
    * @param {...object} objects    Objects to be combined (0...n objects).
    * @return {object} Target Object.
    */
    function mixIn(target, objects){
        var arguments$1 = arguments;

        var i = 0,
            n = arguments.length,
            obj;
        while(++i < n){
            obj = arguments$1[i];
            if (obj != null) {
                forOwn_1(obj, copyProp$1, target);
            }
        }
        return target;
    }

    function copyProp$1(val, key){
        this[key] = val;
    }

    var mixIn_1 = mixIn;

/**
     * Clone native types.
     */
    function clone(val){
        switch (kindOf_1(val)) {
            case 'Object':
                return cloneObject$1(val);
            case 'Array':
                return cloneArray$1(val);
            case 'RegExp':
                return cloneRegExp(val);
            case 'Date':
                return cloneDate(val);
            default:
                return val;
        }
    }

    function cloneObject$1(source) {
        if (isPlainObject_1(source)) {
            return mixIn_1({}, source);
        } else {
            return source;
        }
    }

    function cloneRegExp(r) {
        var flags = '';
        flags += r.multiline ? 'm' : '';
        flags += r.global ? 'g' : '';
        flags += r.ignoreCase ? 'i' : '';
        return new RegExp(r.source, flags);
    }

    function cloneDate(date) {
        return new Date(+date);
    }

    function cloneArray$1(arr) {
        return arr.slice();
    }

    var clone_1 = clone;

/**
     * Recursively clone native types.
     */
    function deepClone(val, instanceClone) {
        switch ( kindOf_1(val) ) {
            case 'Object':
                return cloneObject(val, instanceClone);
            case 'Array':
                return cloneArray(val, instanceClone);
            default:
                return clone_1(val);
        }
    }

    function cloneObject(source, instanceClone) {
        if (isPlainObject_1(source)) {
            var out = {};
            forOwn_1(source, function(val, key) {
                this[key] = deepClone(val, instanceClone);
            }, out);
            return out;
        } else if (instanceClone) {
            return instanceClone(source);
        } else {
            return source;
        }
    }

    function cloneArray(arr, instanceClone) {
        var out = [],
            i = -1,
            n = arr.length,
            val;
        while (++i < n) {
            out[i] = deepClone(arr[i], instanceClone);
        }
        return out;
    }

    var deepClone_1 = deepClone;

/**
     * Deep merge objects.
     */
    function merge$1() {
        var i = 1,
            key, val, obj, target;

        // make sure we don't modify source element and it's properties
        // objects are passed by reference
        target = deepClone_1( arguments[0] );

        while (obj = arguments[i++]) {
            for (key in obj) {
                if ( ! hasOwn_1(obj, key) ) {
                    continue;
                }

                val = obj[key];

                if ( isObject_1(val) && isObject_1(target[key]) ){
                    // inception, deep merge objects
                    target[key] = merge$1(target[key], val);
                } else {
                    // make sure arrays, regexp, date, objects are cloned
                    target[key] = deepClone_1(val);
                }

            }
        }

        return target;
    }

    var merge_1 = merge$1;

/**
     * Returns minimum value inside object.
     */
    function min$1(obj, iterator) {
        return min_1(values_1(obj), iterator);
    }

    var min_1$2 = min$1;

/**
     * Create nested object if non-existent
     */
    function namespace(obj, path){
        if (!path) { return obj; }
        forEach_1(path.split('.'), function(key){
            if (!obj[key]) {
                obj[key] = {};
            }
            obj = obj[key];
        });
        return obj;
    }

    var namespace_1 = namespace;

/**
     * Return a copy of the object, filtered to only contain properties except the blacklisted keys.
     */
    function omit(obj, var_keys){
        var keys = typeof arguments[1] !== 'string'? arguments[1] : slice_1(arguments, 1),
            out = {};

        for (var property in obj) {
            if (obj.hasOwnProperty(property) && !contains_1(keys, property)) {
                out[property] = obj[property];
            }
        }
        return out;
    }

    var omit_1 = omit;

/**
     * Return a copy of the object, filtered to only have values for the whitelisted keys.
     */
    function pick$1(obj, var_keys){
        var keys = typeof arguments[1] !== 'string'? arguments[1] : slice_1(arguments, 1),
            out = {},
            i = 0, key;
        while (key = keys[i++]) {
            out[key] = obj[key];
        }
        return out;
    }

    var pick_1$2 = pick$1;

/**
     * Extract a list of property values.
     */
    function pluck$1(obj, propName){
        return map$2(obj, prop_1(propName));
    }

    var pluck_1$2 = pluck$1;

/**
     * Get object size
     */
    function size(obj) {
        var count = 0;
        forOwn_1(obj, function(){
            count++;
        });
        return count;
    }

    var size_1 = size;

/**
     * Object reduce
     */
    function reduce$1(obj, callback, memo, thisObj) {
        var initial = arguments.length > 2;

        if (!size_1(obj) && !initial) {
            throw new Error('reduce of empty object with no initial value');
        }

        forOwn_1(obj, function(value, key, list) {
            if (!initial) {
                memo = value;
                initial = true;
            }
            else {
                memo = callback.call(thisObj, memo, value, key, list);
            }
        });

        return memo;
    }

    var reduce_1$2 = reduce$1;

/**
     * Object reject
     */
    function reject$1(obj, callback, thisObj) {
        callback = makeIterator_(callback, thisObj);
        return filter$2(obj, function(value, index, obj) {
            return !callback(value, index, obj);
        }, thisObj);
    }

    var reject_1$2 = reject$1;

function result(obj, prop) {
        var property = obj[prop];

        if(property === undefined) {
            return;
        }

        return isFunction_1(property) ? property.call(obj) : property;
    }

    var result_1 = result;

/**
     * set "nested" object property
     */
    function set(obj, prop, val){
        var parts = (/^(.+)\.(.+)$/).exec(prop);
        if (parts){
            namespace_1(obj, parts[1])[parts[2]] = val;
        } else {
            obj[prop] = val;
        }
    }

    var set_1 = set;

/**
     * Unset object property.
     */
    function unset(obj, prop){
        if (has_1(obj, prop)) {
            var parts = prop.split('.'),
                last = parts.pop();
            while (prop = parts.shift()) {
                obj = obj[prop];
            }
            return (delete obj[last]);

        } else {
            // if property doesn't exist treat as deleted
            return true;
        }
    }

    var unset_1 = unset;

//automatically generated, do not edit!
//run `node build` instead
var object = {
    'bindAll' : bindAll_1,
    'contains' : contains_1$2,
    'deepFillIn' : deepFillIn_1,
    'deepMatches' : deepMatches_1,
    'deepMixIn' : deepMixIn_1,
    'equals' : equals_1$2,
    'every' : every_1$2,
    'fillIn' : fillIn_1,
    'filter' : filter$2,
    'find' : find_1$2,
    'flatten' : flatten_1$2,
    'forIn' : forIn_1,
    'forOwn' : forOwn_1,
    'functions' : functions_1,
    'get' : get_1,
    'has' : has_1,
    'hasOwn' : hasOwn_1,
    'keys' : keys_1,
    'map' : map$2,
    'matches' : matches_1,
    'max' : max_1$2,
    'merge' : merge_1,
    'min' : min_1$2,
    'mixIn' : mixIn_1,
    'namespace' : namespace_1,
    'omit' : omit_1,
    'pick' : pick_1$2,
    'pluck' : pluck_1$2,
    'reduce' : reduce_1$2,
    'reject' : reject_1$2,
    'result' : result_1,
    'set' : set_1,
    'size' : size_1,
    'some' : some_1$2,
    'unset' : unset_1,
    'values' : values_1
};

var object_1 = object.keys;

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

/**
 * settings for riotx
 * @type {{debug: boolean, default: string}}
 */
var settings = {
  debug: false,
  default: '@'
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

  array_1(triggers, function (v) {
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
  return Promise
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

  // register a mixin globally.
  riot.mixin({
    // intendedly use `function`.
    // switch the context of `this` from `riotx` to `riot tag instance`.
    init: function () {
      var this$1 = this;

      // the context of `this` will be equal to riot tag instant.
      this.on('unmount', function () {
        this$1.off('*');
      });

      if (settings.debug) {
        this.on('*', function (eventName) {
          log(eventName, this$1);
        });
      }
    },
    // give each riot instance the ability to access the globally defined singleton RiotX instance.
    riotx: this
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
  return object_1(this.stores).length;
};

var index = new RiotX();

module.exports = index;
