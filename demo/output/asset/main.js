define('underscore/underscore', [
    'require',
    'exports',
    'module'
], function (require, exports, module) {
    (function () {
        var root = this;
        var previousUnderscore = root._;
        var breaker = {};
        var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
        var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
        var nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
        var _ = function (obj) {
            if (obj instanceof _)
                return obj;
            if (!(this instanceof _))
                return new _(obj);
            this._wrapped = obj;
        };
        if (typeof exports !== 'undefined') {
            if (typeof module !== 'undefined' && module.exports) {
                exports = module.exports = _;
            }
            exports._ = _;
        } else {
            root._ = _;
        }
        _.VERSION = '1.6.0';
        var createCallback = function (func, context, argCount) {
            if (context === void 0)
                return func;
            switch (argCount == null ? 3 : argCount) {
            case 1:
                return function (value) {
                    return func.call(context, value);
                };
            case 2:
                return function (value, other) {
                    return func.call(context, value, other);
                };
            case 3:
                return function (value, index, collection) {
                    return func.call(context, value, index, collection);
                };
            case 4:
                return function (accumulator, value, index, collection) {
                    return func.call(context, accumulator, value, index, collection);
                };
            }
            return function () {
                return func.apply(context, arguments);
            };
        };
        var lookupIterator = function (value, context, argCount) {
            if (value == null)
                return _.identity;
            if (_.isFunction(value))
                return createCallback(value, context, argCount);
            if (_.isObject(value))
                return _.matches(value);
            return _.property(value);
        };
        _.each = _.forEach = function (obj, iterator, context) {
            var i, length;
            if (obj == null)
                return obj;
            iterator = createCallback(iterator, context);
            if (obj.length === +obj.length) {
                for (i = 0, length = obj.length; i < length; i++) {
                    if (iterator(obj[i], i, obj) === breaker)
                        break;
                }
            } else {
                var keys = _.keys(obj);
                for (i = 0, length = keys.length; i < length; i++) {
                    if (iterator(obj[keys[i]], keys[i], obj) === breaker)
                        break;
                }
            }
            return obj;
        };
        _.map = _.collect = function (obj, iterator, context) {
            var results = [];
            if (obj == null)
                return results;
            iterator = lookupIterator(iterator, context);
            _.each(obj, function (value, index, list) {
                results.push(iterator(value, index, list));
            });
            return results;
        };
        var reduceError = 'Reduce of empty array with no initial value';
        _.reduce = _.foldl = _.inject = function (obj, iterator, memo, context) {
            var initial = arguments.length > 2;
            if (obj == null)
                obj = [];
            iterator = createCallback(iterator, context, 4);
            _.each(obj, function (value, index, list) {
                if (!initial) {
                    memo = value;
                    initial = true;
                } else {
                    memo = iterator(memo, value, index, list);
                }
            });
            if (!initial)
                throw TypeError(reduceError);
            return memo;
        };
        _.reduceRight = _.foldr = function (obj, iterator, memo, context) {
            var initial = arguments.length > 2;
            if (obj == null)
                obj = [];
            var length = obj.length;
            iterator = createCallback(iterator, context, 4);
            if (length !== +length) {
                var keys = _.keys(obj);
                length = keys.length;
            }
            _.each(obj, function (value, index, list) {
                index = keys ? keys[--length] : --length;
                if (!initial) {
                    memo = obj[index];
                    initial = true;
                } else {
                    memo = iterator(memo, obj[index], index, list);
                }
            });
            if (!initial)
                throw TypeError(reduceError);
            return memo;
        };
        _.find = _.detect = function (obj, predicate, context) {
            var result;
            predicate = lookupIterator(predicate, context);
            _.some(obj, function (value, index, list) {
                if (predicate(value, index, list)) {
                    result = value;
                    return true;
                }
            });
            return result;
        };
        _.filter = _.select = function (obj, predicate, context) {
            var results = [];
            if (obj == null)
                return results;
            predicate = lookupIterator(predicate, context);
            _.each(obj, function (value, index, list) {
                if (predicate(value, index, list))
                    results.push(value);
            });
            return results;
        };
        _.reject = function (obj, predicate, context) {
            return _.filter(obj, _.negate(lookupIterator(predicate)), context);
        };
        _.every = _.all = function (obj, predicate, context) {
            var result = true;
            if (obj == null)
                return result;
            predicate = lookupIterator(predicate, context);
            _.each(obj, function (value, index, list) {
                result = predicate(value, index, list);
                if (!result)
                    return breaker;
            });
            return !!result;
        };
        _.some = _.any = function (obj, predicate, context) {
            var result = false;
            if (obj == null)
                return result;
            predicate = lookupIterator(predicate, context);
            _.each(obj, function (value, index, list) {
                result = predicate(value, index, list);
                if (result)
                    return breaker;
            });
            return !!result;
        };
        _.contains = _.include = function (obj, target) {
            if (obj == null)
                return false;
            if (obj.length === +obj.length)
                return _.indexOf(obj, target) >= 0;
            return _.some(obj, function (value) {
                return value === target;
            });
        };
        _.invoke = function (obj, method) {
            var args = slice.call(arguments, 2);
            var isFunc = _.isFunction(method);
            return _.map(obj, function (value) {
                return (isFunc ? method : value[method]).apply(value, args);
            });
        };
        _.pluck = function (obj, key) {
            return _.map(obj, _.property(key));
        };
        _.where = function (obj, attrs) {
            return _.filter(obj, _.matches(attrs));
        };
        _.findWhere = function (obj, attrs) {
            return _.find(obj, _.matches(attrs));
        };
        _.max = function (obj, iterator, context) {
            var result = -Infinity, lastComputed = -Infinity, value, computed;
            if (!iterator && _.isArray(obj)) {
                for (var i = 0, length = obj.length; i < length; i++) {
                    value = obj[i];
                    if (value > result) {
                        result = value;
                    }
                }
            } else {
                iterator = lookupIterator(iterator, context);
                _.each(obj, function (value, index, list) {
                    computed = iterator(value, index, list);
                    if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                        result = value;
                        lastComputed = computed;
                    }
                });
            }
            return result;
        };
        _.min = function (obj, iterator, context) {
            var result = Infinity, lastComputed = Infinity, value, computed;
            if (!iterator && _.isArray(obj)) {
                for (var i = 0, length = obj.length; i < length; i++) {
                    value = obj[i];
                    if (value < result) {
                        result = value;
                    }
                }
            } else {
                iterator = lookupIterator(iterator, context);
                _.each(obj, function (value, index, list) {
                    computed = iterator(value, index, list);
                    if (computed < lastComputed || computed === Infinity && result === Infinity) {
                        result = value;
                        lastComputed = computed;
                    }
                });
            }
            return result;
        };
        _.shuffle = function (obj) {
            var rand;
            var index = 0;
            var shuffled = [];
            _.each(obj, function (value) {
                rand = _.random(index++);
                shuffled[index - 1] = shuffled[rand];
                shuffled[rand] = value;
            });
            return shuffled;
        };
        _.sample = function (obj, n, guard) {
            if (n == null || guard) {
                if (obj.length !== +obj.length)
                    obj = _.values(obj);
                return obj[_.random(obj.length - 1)];
            }
            return _.shuffle(obj).slice(0, Math.max(0, n));
        };
        _.sortBy = function (obj, iterator, context) {
            iterator = lookupIterator(iterator, context);
            return _.pluck(_.map(obj, function (value, index, list) {
                return {
                    value: value,
                    index: index,
                    criteria: iterator(value, index, list)
                };
            }).sort(function (left, right) {
                var a = left.criteria;
                var b = right.criteria;
                if (a !== b) {
                    if (a > b || a === void 0)
                        return 1;
                    if (a < b || b === void 0)
                        return -1;
                }
                return left.index - right.index;
            }), 'value');
        };
        var group = function (behavior) {
            return function (obj, iterator, context) {
                var result = {};
                iterator = lookupIterator(iterator, context);
                _.each(obj, function (value, index) {
                    var key = iterator(value, index, obj);
                    behavior(result, value, key);
                });
                return result;
            };
        };
        _.groupBy = group(function (result, value, key) {
            if (_.has(result, key))
                result[key].push(value);
            else
                result[key] = [value];
        });
        _.indexBy = group(function (result, value, key) {
            result[key] = value;
        });
        _.countBy = group(function (result, value, key) {
            if (_.has(result, key))
                result[key]++;
            else
                result[key] = 1;
        });
        _.sortedIndex = function (array, obj, iterator, context) {
            iterator = lookupIterator(iterator, context, 1);
            var value = iterator(obj);
            var low = 0, high = array.length;
            while (low < high) {
                var mid = low + high >>> 1;
                if (iterator(array[mid]) < value)
                    low = mid + 1;
                else
                    high = mid;
            }
            return low;
        };
        _.toArray = function (obj) {
            if (!obj)
                return [];
            if (_.isArray(obj))
                return slice.call(obj);
            if (obj.length === +obj.length)
                return _.map(obj, _.identity);
            return _.values(obj);
        };
        _.size = function (obj) {
            if (obj == null)
                return 0;
            return obj.length === +obj.length ? obj.length : _.keys(obj).length;
        };
        _.partition = function (obj, predicate, context) {
            predicate = lookupIterator(predicate, context);
            var pass = [], fail = [];
            _.each(obj, function (value, key, obj) {
                (predicate(value, key, obj) ? pass : fail).push(value);
            });
            return [
                pass,
                fail
            ];
        };
        _.first = _.head = _.take = function (array, n, guard) {
            if (array == null)
                return void 0;
            if (n == null || guard)
                return array[0];
            if (n < 0)
                return [];
            return slice.call(array, 0, n);
        };
        _.initial = function (array, n, guard) {
            return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
        };
        _.last = function (array, n, guard) {
            if (array == null)
                return void 0;
            if (n == null || guard)
                return array[array.length - 1];
            return slice.call(array, Math.max(array.length - n, 0));
        };
        _.rest = _.tail = _.drop = function (array, n, guard) {
            return slice.call(array, n == null || guard ? 1 : n);
        };
        _.compact = function (array) {
            return _.filter(array, _.identity);
        };
        var flatten = function (input, shallow, strict, output) {
            if (shallow && _.every(input, _.isArray)) {
                return concat.apply(output, input);
            }
            for (var i = 0, length = input.length; i < length; i++) {
                var value = input[i];
                if (!_.isArray(value) && !_.isArguments(value)) {
                    if (!strict)
                        output.push(value);
                } else if (shallow) {
                    push.apply(output, value);
                } else {
                    flatten(value, shallow, strict, output);
                }
            }
            return output;
        };
        _.flatten = function (array, shallow) {
            return flatten(array, shallow, false, []);
        };
        _.without = function (array) {
            return _.difference(array, slice.call(arguments, 1));
        };
        _.uniq = _.unique = function (array, isSorted, iterator, context) {
            if (array == null)
                return [];
            if (_.isFunction(isSorted)) {
                context = iterator;
                iterator = isSorted;
                isSorted = false;
            }
            if (iterator)
                iterator = lookupIterator(iterator, context);
            var result = [];
            var seen = [];
            for (var i = 0, length = array.length; i < length; i++) {
                var value = array[i];
                if (iterator)
                    value = iterator(value, i, array);
                if (isSorted ? !i || seen !== value : !_.contains(seen, value)) {
                    if (isSorted)
                        seen = value;
                    else
                        seen.push(value);
                    result.push(array[i]);
                }
            }
            return result;
        };
        _.union = function () {
            return _.uniq(flatten(arguments, true, true, []));
        };
        _.intersection = function (array) {
            if (array == null)
                return [];
            var result = [];
            var argsLength = arguments.length;
            for (var i = 0, length = array.length; i < length; i++) {
                var item = array[i];
                if (_.contains(result, item))
                    continue;
                for (var j = 1; j < argsLength; j++) {
                    if (!_.contains(arguments[j], item))
                        break;
                }
                if (j === argsLength)
                    result.push(item);
            }
            return result;
        };
        _.difference = function (array) {
            var rest = flatten(slice.call(arguments, 1), true, true, []);
            return _.filter(array, function (value) {
                return !_.contains(rest, value);
            });
        };
        _.zip = function (array) {
            if (array == null)
                return [];
            var length = _.max(arguments, 'length').length;
            var results = Array(length);
            for (var i = 0; i < length; i++) {
                results[i] = _.pluck(arguments, i);
            }
            return results;
        };
        _.object = function (list, values) {
            if (list == null)
                return {};
            var result = {};
            for (var i = 0, length = list.length; i < length; i++) {
                if (values) {
                    result[list[i]] = values[i];
                } else {
                    result[list[i][0]] = list[i][1];
                }
            }
            return result;
        };
        _.indexOf = function (array, item, isSorted) {
            if (array == null)
                return -1;
            var i = 0, length = array.length;
            if (isSorted) {
                if (typeof isSorted == 'number') {
                    i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
                } else {
                    i = _.sortedIndex(array, item);
                    return array[i] === item ? i : -1;
                }
            }
            for (; i < length; i++)
                if (array[i] === item)
                    return i;
            return -1;
        };
        _.lastIndexOf = function (array, item, from) {
            if (array == null)
                return -1;
            var i = from == null ? array.length : from;
            while (i--)
                if (array[i] === item)
                    return i;
            return -1;
        };
        _.range = function (start, stop, step) {
            if (arguments.length <= 1) {
                stop = start || 0;
                start = 0;
            }
            step = arguments[2] || 1;
            var length = Math.max(Math.ceil((stop - start) / step), 0);
            var idx = 0;
            var range = Array(length);
            while (idx < length) {
                range[idx++] = start;
                start += step;
            }
            return range;
        };
        var Ctor = function () {
        };
        _.bind = function (func, context) {
            var args, bound;
            if (nativeBind && func.bind === nativeBind)
                return nativeBind.apply(func, slice.call(arguments, 1));
            if (!_.isFunction(func))
                throw TypeError('Bind must be called on a function');
            args = slice.call(arguments, 2);
            bound = function () {
                if (!(this instanceof bound))
                    return func.apply(context, args.concat(slice.call(arguments)));
                Ctor.prototype = func.prototype;
                var self = new Ctor();
                Ctor.prototype = null;
                var result = func.apply(self, args.concat(slice.call(arguments)));
                if (Object(result) === result)
                    return result;
                return self;
            };
            return bound;
        };
        _.partial = function (func) {
            var boundArgs = slice.call(arguments, 1);
            return function () {
                var position = 0;
                var args = boundArgs.slice();
                for (var i = 0, length = args.length; i < length; i++) {
                    if (args[i] === _)
                        args[i] = arguments[position++];
                }
                while (position < arguments.length)
                    args.push(arguments[position++]);
                return func.apply(this, args);
            };
        };
        _.bindAll = function (obj) {
            var i = 1, length = arguments.length, key;
            if (length <= 1)
                throw Error('bindAll must be passed function names');
            for (; i < length; i++) {
                key = arguments[i];
                obj[key] = createCallback(obj[key], obj, Infinity);
            }
            return obj;
        };
        _.memoize = function (func, hasher) {
            var memoize = function (key) {
                var cache = memoize.cache;
                var address = hasher ? hasher.apply(this, arguments) : key;
                if (!_.has(cache, address))
                    cache[address] = func.apply(this, arguments);
                return cache[key];
            };
            memoize.cache = {};
            return memoize;
        };
        _.delay = function (func, wait) {
            var args = slice.call(arguments, 2);
            return setTimeout(function () {
                return func.apply(null, args);
            }, wait);
        };
        _.defer = function (func) {
            return _.delay.apply(_, [
                func,
                1
            ].concat(slice.call(arguments, 1)));
        };
        _.throttle = function (func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            if (!options)
                options = {};
            var later = function () {
                previous = options.leading === false ? 0 : _.now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout)
                    context = args = null;
            };
            return function () {
                var now = _.now();
                if (!previous && options.leading === false)
                    previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout)
                        context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        };
        _.debounce = function (func, wait, immediate) {
            var timeout, args, context, timestamp, result;
            var later = function () {
                var last = _.now() - timestamp;
                if (last < wait && last > 0) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (!immediate) {
                        result = func.apply(context, args);
                        if (!timeout)
                            context = args = null;
                    }
                }
            };
            return function () {
                context = this;
                args = arguments;
                timestamp = _.now();
                var callNow = immediate && !timeout;
                if (!timeout)
                    timeout = setTimeout(later, wait);
                if (callNow) {
                    result = func.apply(context, args);
                    context = args = null;
                }
                return result;
            };
        };
        _.once = function (func) {
            var ran = false, memo;
            return function () {
                if (ran)
                    return memo;
                ran = true;
                memo = func.apply(this, arguments);
                func = null;
                return memo;
            };
        };
        _.wrap = function (func, wrapper) {
            return _.partial(wrapper, func);
        };
        _.negate = function (predicate) {
            return function () {
                return !predicate.apply(this, arguments);
            };
        };
        _.compose = function () {
            var funcs = arguments;
            return function () {
                var args = arguments;
                for (var i = funcs.length - 1; i >= 0; i--) {
                    args = [funcs[i].apply(this, args)];
                }
                return args[0];
            };
        };
        _.after = function (times, func) {
            return function () {
                if (--times < 1) {
                    return func.apply(this, arguments);
                }
            };
        };
        _.keys = function (obj) {
            if (!_.isObject(obj))
                return [];
            if (nativeKeys)
                return nativeKeys(obj);
            var keys = [];
            for (var key in obj)
                if (_.has(obj, key))
                    keys.push(key);
            return keys;
        };
        _.values = function (obj) {
            var keys = _.keys(obj);
            var length = keys.length;
            var values = Array(length);
            for (var i = 0; i < length; i++) {
                values[i] = obj[keys[i]];
            }
            return values;
        };
        _.pairs = function (obj) {
            var keys = _.keys(obj);
            var length = keys.length;
            var pairs = Array(length);
            for (var i = 0; i < length; i++) {
                pairs[i] = [
                    keys[i],
                    obj[keys[i]]
                ];
            }
            return pairs;
        };
        _.invert = function (obj) {
            var result = {};
            var keys = _.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                result[obj[keys[i]]] = keys[i];
            }
            return result;
        };
        _.functions = _.methods = function (obj) {
            var names = [];
            for (var key in obj) {
                if (_.isFunction(obj[key]))
                    names.push(key);
            }
            return names.sort();
        };
        _.extend = function (obj) {
            if (!_.isObject(obj))
                return obj;
            var source, prop;
            for (var i = 1, length = arguments.length; i < length; i++) {
                source = arguments[i];
                for (prop in source) {
                    obj[prop] = source[prop];
                }
            }
            return obj;
        };
        _.pick = function (obj, iterator, context) {
            var result = {}, key;
            if (_.isFunction(iterator)) {
                for (key in obj) {
                    var value = obj[key];
                    if (iterator.call(context, value, key, obj))
                        result[key] = value;
                }
            } else {
                var keys = concat.apply([], slice.call(arguments, 1));
                for (var i = 0, length = keys.length; i < length; i++) {
                    key = keys[i];
                    if (key in obj)
                        result[key] = obj[key];
                }
            }
            return result;
        };
        _.omit = function (obj, iterator, context) {
            if (_.isFunction(iterator)) {
                iterator = _.negate(iterator);
            } else {
                var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
                iterator = function (value, key) {
                    return !_.contains(keys, key);
                };
            }
            return _.pick(obj, iterator, context);
        };
        _.defaults = function (obj) {
            if (!_.isObject(obj))
                return obj;
            for (var i = 1, length = arguments.length; i < length; i++) {
                var source = arguments[i];
                for (var prop in source) {
                    if (obj[prop] === void 0)
                        obj[prop] = source[prop];
                }
            }
            return obj;
        };
        _.clone = function (obj) {
            if (!_.isObject(obj))
                return obj;
            return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
        };
        _.tap = function (obj, interceptor) {
            interceptor(obj);
            return obj;
        };
        var eq = function (a, b, aStack, bStack) {
            if (a === b)
                return a !== 0 || 1 / a === 1 / b;
            if (a == null || b == null)
                return a === b;
            if (a instanceof _)
                a = a._wrapped;
            if (b instanceof _)
                b = b._wrapped;
            var className = toString.call(a);
            if (className !== toString.call(b))
                return false;
            switch (className) {
            case '[object RegExp]':
            case '[object String]':
                return '' + a === '' + b;
            case '[object Number]':
                if (a != +a)
                    return b != +b;
                return a == 0 ? 1 / a == 1 / b : a == +b;
            case '[object Date]':
            case '[object Boolean]':
                return +a === +b;
            }
            if (typeof a != 'object' || typeof b != 'object')
                return false;
            var length = aStack.length;
            while (length--) {
                if (aStack[length] === a)
                    return bStack[length] === b;
            }
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && 'constructor' in a && 'constructor' in b && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor)) {
                return false;
            }
            aStack.push(a);
            bStack.push(b);
            var size, result;
            if (className === '[object Array]') {
                size = a.length;
                result = size === b.length;
                if (result) {
                    while (size--) {
                        if (!(result = eq(a[size], b[size], aStack, bStack)))
                            break;
                    }
                }
            } else {
                var keys = _.keys(a), key;
                size = keys.length;
                result = _.keys(b).length == size;
                if (result) {
                    while (size--) {
                        key = keys[size];
                        if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack)))
                            break;
                    }
                }
            }
            aStack.pop();
            bStack.pop();
            return result;
        };
        _.isEqual = function (a, b) {
            return eq(a, b, [], []);
        };
        _.isEmpty = function (obj) {
            if (obj == null)
                return true;
            if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))
                return obj.length === 0;
            for (var key in obj)
                if (_.has(obj, key))
                    return false;
            return true;
        };
        _.isElement = function (obj) {
            return !!(obj && obj.nodeType === 1);
        };
        _.isArray = nativeIsArray || function (obj) {
            return toString.call(obj) === '[object Array]';
        };
        _.isObject = function (obj) {
            return obj === Object(obj);
        };
        _.each([
            'Arguments',
            'Function',
            'String',
            'Number',
            'Date',
            'RegExp'
        ], function (name) {
            _['is' + name] = function (obj) {
                return toString.call(obj) === '[object ' + name + ']';
            };
        });
        if (!_.isArguments(arguments)) {
            _.isArguments = function (obj) {
                return _.has(obj, 'callee');
            };
        }
        if (typeof /./ !== 'function') {
            _.isFunction = function (obj) {
                return typeof obj === 'function';
            };
        }
        _.isFinite = function (obj) {
            return isFinite(obj) && !isNaN(parseFloat(obj));
        };
        _.isNaN = function (obj) {
            return _.isNumber(obj) && obj !== +obj;
        };
        _.isBoolean = function (obj) {
            return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
        };
        _.isNull = function (obj) {
            return obj === null;
        };
        _.isUndefined = function (obj) {
            return obj === void 0;
        };
        _.has = function (obj, key) {
            return obj != null && hasOwnProperty.call(obj, key);
        };
        _.noConflict = function () {
            root._ = previousUnderscore;
            return this;
        };
        _.identity = function (value) {
            return value;
        };
        _.constant = function (value) {
            return function () {
                return value;
            };
        };
        _.noop = function () {
        };
        _.property = function (key) {
            return function (obj) {
                return obj[key];
            };
        };
        _.matches = function (attrs) {
            return function (obj) {
                if (obj == null)
                    return _.isEmpty(attrs);
                if (obj === attrs)
                    return true;
                for (var key in attrs)
                    if (attrs[key] !== obj[key])
                        return false;
                return true;
            };
        };
        _.times = function (n, iterator, context) {
            var accum = Array(Math.max(0, n));
            iterator = createCallback(iterator, context, 1);
            for (var i = 0; i < n; i++)
                accum[i] = iterator(i);
            return accum;
        };
        _.random = function (min, max) {
            if (max == null) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        };
        _.now = Date.now || function () {
            return new Date().getTime();
        };
        var entityMap = {
                escape: {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    '\'': '&#x27;'
                }
            };
        entityMap.unescape = _.invert(entityMap.escape);
        var entityRegexes = {
                escape: RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
                unescape: RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
            };
        _.each([
            'escape',
            'unescape'
        ], function (method) {
            _[method] = function (string) {
                if (string == null)
                    return '';
                return ('' + string).replace(entityRegexes[method], function (match) {
                    return entityMap[method][match];
                });
            };
        });
        _.result = function (object, property) {
            if (object == null)
                return void 0;
            var value = object[property];
            return _.isFunction(value) ? object[property]() : value;
        };
        var idCounter = 0;
        _.uniqueId = function (prefix) {
            var id = ++idCounter + '';
            return prefix ? prefix + id : id;
        };
        _.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g
        };
        var noMatch = /(.)^/;
        var escapes = {
                '\'': '\'',
                '\\': '\\',
                '\r': 'r',
                '\n': 'n',
                '\u2028': 'u2028',
                '\u2029': 'u2029'
            };
        var escaper = /\\|'|\r|\n|\u2028|\u2029/g;
        var escapeChar = function (match) {
            return '\\' + escapes[match];
        };
        _.template = function (text, data, settings) {
            settings = _.defaults({}, settings, _.templateSettings);
            var matcher = RegExp([
                    (settings.escape || noMatch).source,
                    (settings.interpolate || noMatch).source,
                    (settings.evaluate || noMatch).source
                ].join('|') + '|$', 'g');
            var index = 0;
            var source = '__p+=\'';
            text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
                source += text.slice(index, offset).replace(escaper, escapeChar);
                index = offset + match.length;
                if (escape) {
                    source += '\'+\n((__t=(' + escape + '))==null?\'\':_.escape(__t))+\n\'';
                } else if (interpolate) {
                    source += '\'+\n((__t=(' + interpolate + '))==null?\'\':__t)+\n\'';
                } else if (evaluate) {
                    source += '\';\n' + evaluate + '\n__p+=\'';
                }
                return match;
            });
            source += '\';\n';
            if (!settings.variable)
                source = 'with(obj||{}){\n' + source + '}\n';
            source = 'var __t,__p=\'\',__j=Array.prototype.join,' + 'print=function(){__p+=__j.call(arguments,\'\');};\n' + source + 'return __p;\n';
            try {
                var render = Function(settings.variable || 'obj', '_', source);
            } catch (e) {
                e.source = source;
                throw e;
            }
            if (data)
                return render(data, _);
            var template = function (data) {
                return render.call(this, data, _);
            };
            var argument = settings.variable || 'obj';
            template.source = 'function(' + argument + '){\n' + source + '}';
            return template;
        };
        _.chain = function (obj) {
            var instance = _(obj);
            instance._chain = true;
            return instance;
        };
        var result = function (obj) {
            return this._chain ? _(obj).chain() : obj;
        };
        _.mixin = function (obj) {
            _.each(_.functions(obj), function (name) {
                var func = _[name] = obj[name];
                _.prototype[name] = function () {
                    var args = [this._wrapped];
                    push.apply(args, arguments);
                    return result.call(this, func.apply(_, args));
                };
            });
        };
        _.mixin(_);
        _.each([
            'pop',
            'push',
            'reverse',
            'shift',
            'sort',
            'splice',
            'unshift'
        ], function (name) {
            var method = ArrayProto[name];
            _.prototype[name] = function () {
                var obj = this._wrapped;
                method.apply(obj, arguments);
                if ((name === 'shift' || name === 'splice') && obj.length === 0)
                    delete obj[0];
                return result.call(this, obj);
            };
        });
        _.each([
            'concat',
            'join',
            'slice'
        ], function (name) {
            var method = ArrayProto[name];
            _.prototype[name] = function () {
                return result.call(this, method.apply(this._wrapped, arguments));
            };
        });
        _.prototype.value = function () {
            return this._wrapped;
        };
    }.call(this));
});

define('underscore', ['underscore/underscore'], function ( main ) { return main; });

void function (define) {
    define('promise/setImmediate', ['require'], function (require) {
        var global = function () {
                return this;
            }();
        var callbackPool = {};
        var cursor = 1;
        function registerCallback(callback) {
            callbackPool[cursor] = callback;
            return cursor++;
        }
        function runCallback(tick) {
            var callback = callbackPool[tick];
            if (callback) {
                delete callbackPool[tick];
                callback();
            }
        }
        if (typeof global.setImmediate === 'function') {
            return global.setImmediate;
        }
        if (typeof global.nextTick === 'function') {
            return global.nextTick;
        }
        if (global.MutationObserver || global.webKitMutationObserver) {
            var ATTRIBUTE_NAME = 'data-promise-tick';
            var MutationObserver = global.MutationObserver || global.webKitMutationObserver;
            var ensureElementMutation = function (mutations, observer) {
                var item = mutations[0];
                if (item.attributeName === ATTRIBUTE_NAME) {
                    var tick = item.target.getAttribute(ATTRIBUTE_NAME);
                    runCallback(tick);
                    observer.disconnect(item.target);
                }
            };
            return function (callback) {
                var element = document.createElement('div');
                var observer = new MutationObserver(ensureElementMutation);
                observer.observe(element, { attributes: true });
                var tick = registerCallback(callback);
                element.setAttribute(ATTRIBUTE_NAME, tick);
            };
        }
        if (typeof postMessage === 'function' && typeof global.importScript !== 'function') {
            var isPostMessageAsync = true;
            var oldListener = global.onmessage;
            global.onmessage = function () {
                isPostMessageAsync = false;
            };
            global.postMessage('', '*');
            global.onmessage = oldListener;
            if (isPostMessageAsync) {
                var MESSAGE_PREFIX = 'promise-tick-';
                var ensureMessage = function (e) {
                    if (e.source === global && typeof e.data === 'string' && e.data.indexOf(MESSAGE_PREFIX) === 0) {
                        var tick = e.data.substring(MESSAGE_PREFIX.length);
                        runCallback(tick);
                    }
                };
                if (global.addEventListener) {
                    global.addEventListener('message', ensureMessage, false);
                } else {
                    global.attachEvent('onmessage', ensureMessage);
                }
                return function (callback) {
                    var tick = registerCallback(callback);
                    global.postMessage(MESSAGE_PREFIX + tick, '*');
                };
            }
        }
        if (global.MessageChannel) {
            var channel = new MessageChannel();
            channel.port1.onmessage = function (e) {
                var tick = e.data;
                runCallback(tick);
            };
            return function (callback) {
                var tick = registerCallback(callback);
                channel.port2.postMessage(tick);
            };
        }
        if ('onreadystatechange' in document.createElement('script')) {
            var documentElement = document.documentElement;
            return function (callback) {
                var script = document.createElement('script');
                script.onreadystatechange = function () {
                    callback();
                    script.onreadystatechange = null;
                    documentElement.removeChild(script);
                    script = null;
                };
                documentElement.appendChild(script);
            };
        }
        return function (callback) {
            setTimeout(callback, 0);
        };
    });
}(typeof define === 'function' && define.amd ? define : function (factory) {
    module.exports = factory(require);
}, this);

define('fc-core/aop', ['require'], function (require) {
    'use strict';
    var aop = {};
    aop.before = function (context, methodName, aspectMethod) {
        if (!aspectMethod) {
            return;
        }
        var original = context[methodName];
        context[methodName] = function () {
            try {
                aspectMethod.apply(this, arguments);
            } finally {
                return original.apply(this, arguments);
            }
        };
    };
    aop.beforeReject = function (context, methodName, aspectMethod) {
        if (!aspectMethod) {
            return;
        }
        var original = context[methodName];
        context[methodName] = function () {
            if (aspectMethod.apply(this, arguments)) {
                return original.apply(this, arguments);
            }
        };
    };
    aop.after = function (context, methodName, aspectMethod) {
        if (!aspectMethod) {
            return;
        }
        var original = context[methodName];
        context[methodName] = function () {
            var result = original.apply(this, arguments);
            try {
                aspectMethod.apply(this, arguments);
            } finally {
                return result;
            }
        };
    };
    aop.around = function (context, methodName, beforeMethod, afterMethod) {
        aop.before(context, methodName, beforeMethod);
        aop.after(context, methodName, afterMethod);
    };
    return aop;
});

define('fc-core/assert', ['require'], function (require) {
    'use strict';
    if (window.DEBUG) {
        var assert = function (condition, message) {
            if (!condition) {
                throw new Error(message);
            }
        };
        assert.has = function (obj, message) {
            assert(obj != null, message);
        };
        assert.equals = function (x, y, message) {
            assert(x === y, message);
        };
        assert.hasProperty = function (obj, propertyName, message) {
            assert(obj[propertyName] != null, message);
        };
        assert.lessThan = function (value, max, message) {
            assert(value < max, message);
        };
        assert.greaterThan = function (value, min, message) {
            assert(value > min, message);
        };
        assert.lessThanOrEquals = function (value, max, message) {
            assert(value <= max, message);
        };
        assert.greaterThanOrEquals = function (value, min, message) {
            assert(value >= min, message);
        };
        return assert;
    } else {
        var assert = function () {
        };
        assert.has = assert;
        assert.equals = assert;
        assert.hasProperty = assert;
        assert.lessThan = assert;
        assert.greaterThan = assert;
        assert.lessThanOrEquals = assert;
        assert.greaterThanOrEquals = assert;
        return assert;
    }
});

void function (define) {
    define('eoo/oo', [], function () {
        var Empty = function () {
        };
        var NAME_PROPERTY_NAME = '__eooName__';
        var OWNER_PROPERTY_NAME = '__eooOwner__';
        function Class() {
            return Class.create.apply(Class, arguments);
        }
        Class.create = function (BaseClass, overrides) {
            overrides = overrides || {};
            BaseClass = BaseClass || Class;
            if (typeof BaseClass === 'object') {
                overrides = BaseClass;
                BaseClass = Class;
            }
            var kclass = inherit(BaseClass);
            var proto = kclass.prototype;
            eachObject(overrides, function (value, key) {
                if (typeof value === 'function') {
                    value[NAME_PROPERTY_NAME] = key;
                    value[OWNER_PROPERTY_NAME] = kclass;
                }
                proto[key] = value;
            });
            kclass.toString = toString;
            return kclass;
        };
        Class.static = typeof Object.create === 'function' ? Object.create : function (o) {
            if (arguments.length > 1) {
                throw new Error('Second argument not supported');
            }
            if (typeof o != 'object') {
                throw new TypeError('Argument must be an object');
            }
            Empty.prototype = o;
            return new Empty();
        };
        Class.toString = function () {
            return 'function Class() { [native code] }';
        };
        Class.prototype = {
            constructor: function () {
            },
            $self: Class,
            $superClass: Object,
            $super: function (args) {
                var method = this.$super.caller;
                var name = method[NAME_PROPERTY_NAME];
                var superClass = method[OWNER_PROPERTY_NAME].$superClass;
                var superMethod = superClass.prototype[name];
                if (typeof superMethod !== 'function') {
                    throw new TypeError('Call the super class\'s ' + name + ', but it is not a function!');
                }
                return superMethod.apply(this, args);
            }
        };
        function inherit(BaseClass) {
            var kclass = function () {
                return kclass.prototype.constructor.apply(this, arguments);
            };
            Empty.prototype = BaseClass.prototype;
            var proto = kclass.prototype = new Empty();
            proto.$self = kclass;
            if (!('$super' in proto)) {
                proto.$super = Class.prototype.$super;
            }
            kclass.$superClass = BaseClass;
            return kclass;
        }
        var hasEnumBug = !{ toString: 1 }.propertyIsEnumerable('toString');
        var enumProperties = [
                'constructor',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'toString',
                'toLocaleString',
                'valueOf'
            ];
        function hasOwnProperty(obj, key) {
            return Object.prototype.hasOwnProperty.call(obj, key);
        }
        function eachObject(obj, fn) {
            for (var k in obj) {
                hasOwnProperty(obj, k) && fn(obj[k], k, obj);
            }
            if (hasEnumBug) {
                for (var i = enumProperties.length - 1; i > -1; --i) {
                    var key = enumProperties[i];
                    hasOwnProperty(obj, key) && fn(obj[key], key, obj);
                }
            }
        }
        function toString() {
            return this.prototype.constructor.toString();
        }
        return Class;
    });
}(typeof define === 'function' && define.amd ? define : function (factory) {
    module.exports = factory(require);
});

void function (define, undefined) {
    define('eoo/defineAccessor', ['require'], function (require) {
        var MEMBERS = '__eooPrivateMembers__';
        function simpleGetter(name) {
            var body = 'return typeof this.' + MEMBERS + ' === \'object\' ? this.' + MEMBERS + '[\'' + name + '\'] : undefined;';
            return new Function(body);
        }
        function simpleSetter(name) {
            var body = 'this.' + MEMBERS + ' = this.' + MEMBERS + ' || {};\n' + 'this.' + MEMBERS + '[\'' + name + '\'] = value;';
            return new Function('value', body);
        }
        return function (obj, name, accessor) {
            var upperName = name.charAt(0).toUpperCase() + name.slice(1);
            var getter = 'get' + upperName;
            var setter = 'set' + upperName;
            if (!accessor) {
                obj[getter] = !accessor || typeof accessor.get !== 'function' ? simpleGetter(name) : accessor.get;
                obj[setter] = !accessor || typeof accessor.set !== 'function' ? simpleSetter(name) : accessor.set;
            } else {
                typeof accessor.get === 'function' && (obj[getter] = accessor.get);
                typeof accessor.set === 'function' && (obj[setter] = accessor.set);
            }
        };
    });
}(typeof define === 'function' && define.amd ? define : function (factory) {
    module.exports = factory(require);
});

void function (define) {
    define('eoo/main', [
        'require',
        './oo',
        './defineAccessor'
    ], function (require) {
        var oo = require('./oo');
        oo.defineAccessor = require('./defineAccessor');
        return oo;
    });
}(typeof define === 'function' && define.amd ? define : function (factory) {
    module.exports = factory(require);
});

define('eoo', ['eoo/main'], function ( main ) { return main; });

define('fc-core/oo', [
    'require',
    'underscore',
    './assert',
    'eoo'
], function (require) {
    'use strict';
    var _ = require('underscore');
    var assert = require('./assert');
    var oo = require('eoo');
    var exports = {};
    exports.create = function (overrides) {
        return oo.create(overrides);
    };
    exports.derive = function (superClass, overrides) {
        assert.has(superClass, 'fc.oo.derive\u4F7F\u7528\u65F6\u5FC5\u987B\u6307\u5B9A`superClass`\u53C2\u6570\uFF01');
        assert.equals(_.isObject(overrides) || overrides === undefined, true, '\u9519\u8BEF\u7684fc.oo.derive\u53C2\u6570\uFF0C\u4F20\u5165\u7684`overrides`\u5FC5\u987B\u662F\u4E00\u4E2AObject');
        return oo.create(superClass, overrides);
    };
    return exports;
});

(function (root) {
    function extend(target, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
        return target;
    }
    function Stack() {
        this.raw = [];
        this.length = 0;
    }
    Stack.prototype = {
        push: function (elem) {
            this.raw[this.length++] = elem;
        },
        pop: function () {
            if (this.length > 0) {
                var elem = this.raw[--this.length];
                this.raw.length = this.length;
                return elem;
            }
        },
        top: function () {
            return this.raw[this.length - 1];
        },
        bottom: function () {
            return this.raw[0];
        },
        find: function (condition) {
            var index = this.length;
            while (index--) {
                var item = this.raw[index];
                if (condition(item)) {
                    return item;
                }
            }
        }
    };
    var guidIndex = 178245;
    function generateGUID() {
        return '___' + guidIndex++;
    }
    function inherits(subClass, superClass) {
        var F = new Function();
        F.prototype = superClass.prototype;
        subClass.prototype = new F();
        subClass.prototype.constructor = subClass;
    }
    var HTML_ENTITY = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#39;'
        };
    function htmlFilterReplacer(c) {
        return HTML_ENTITY[c];
    }
    var DEFAULT_FILTERS = {
            html: function (source) {
                return source.replace(/[&<>"']/g, htmlFilterReplacer);
            },
            url: encodeURIComponent,
            raw: function (source) {
                return source;
            }
        };
    function stringLiteralize(source) {
        return '"' + source.replace(/\x5C/g, '\\\\').replace(/"/g, '\\"').replace(/\x0A/g, '\\n').replace(/\x09/g, '\\t').replace(/\x0D/g, '\\r') + '"';
    }
    function regexpLiteral(source) {
        return source.replace(/[\^\[\]\$\(\)\{\}\?\*\.\+]/g, function (c) {
            return '\\' + c;
        });
    }
    function stringFormat(source) {
        var args = arguments;
        return source.replace(/\{([0-9]+)\}/g, function (match, index) {
            return args[index - 0 + 1];
        });
    }
    var RENDER_STRING_DECLATION = 'var r="";';
    var RENDER_STRING_ADD_START = 'r+=';
    var RENDER_STRING_ADD_END = ';';
    var RENDER_STRING_RETURN = 'return r;';
    if (typeof navigator !== 'undefined' && /msie\s*([0-9]+)/i.test(navigator.userAgent) && RegExp.$1 - 0 < 8) {
        RENDER_STRING_DECLATION = 'var r=[],ri=0;';
        RENDER_STRING_ADD_START = 'r[ri++]=';
        RENDER_STRING_RETURN = 'return r.join("");';
    }
    function toGetVariableLiteral(name) {
        name = name.replace(/^\s*\*/, '');
        return stringFormat('gv({0},["{1}"])', stringLiteralize(name), name.replace(/\[['"]?([^'"]+)['"]?\]/g, function (match, name) {
            return '.' + name;
        }).split('.').join('","'));
    }
    function parseTextBlock(source, open, close, greedy, onInBlock, onOutBlock) {
        var closeLen = close.length;
        var texts = source.split(open);
        var level = 0;
        var buf = [];
        for (var i = 0, len = texts.length; i < len; i++) {
            var text = texts[i];
            if (i) {
                var openBegin = 1;
                level++;
                while (1) {
                    var closeIndex = text.indexOf(close);
                    if (closeIndex < 0) {
                        buf.push(level > 1 && openBegin ? open : '', text);
                        break;
                    }
                    level = greedy ? level - 1 : 0;
                    buf.push(level > 0 && openBegin ? open : '', text.slice(0, closeIndex), level > 0 ? close : '');
                    text = text.slice(closeIndex + closeLen);
                    openBegin = 0;
                    if (level === 0) {
                        break;
                    }
                }
                if (level === 0) {
                    onInBlock(buf.join(''));
                    onOutBlock(text);
                    buf = [];
                }
            } else {
                text && onOutBlock(text);
            }
        }
        if (level > 0 && buf.length > 0) {
            onOutBlock(open);
            onOutBlock(buf.join(''));
        }
    }
    function compileVariable(source, engine, forText) {
        var code = [];
        var options = engine.options;
        var toStringHead = '';
        var toStringFoot = '';
        var wrapHead = '';
        var wrapFoot = '';
        var defaultFilter;
        if (forText) {
            toStringHead = 'ts(';
            toStringFoot = ')';
            wrapHead = RENDER_STRING_ADD_START;
            wrapFoot = RENDER_STRING_ADD_END;
            defaultFilter = options.defaultFilter;
        }
        parseTextBlock(source, options.variableOpen, options.variableClose, 1, function (text) {
            if (forText && text.indexOf('|') < 0 && defaultFilter) {
                text += '|' + defaultFilter;
            }
            var filterCharIndex = text.indexOf('|');
            var variableName = (filterCharIndex > 0 ? text.slice(0, filterCharIndex) : text).replace(/^\s+/, '').replace(/\s+$/, '');
            var filterSource = filterCharIndex > 0 ? text.slice(filterCharIndex + 1) : '';
            var variableRawValue = variableName.indexOf('*') === 0;
            var variableCode = [
                    variableRawValue ? '' : toStringHead,
                    toGetVariableLiteral(variableName),
                    variableRawValue ? '' : toStringFoot
                ];
            if (filterSource) {
                filterSource = compileVariable(filterSource, engine);
                var filterSegs = filterSource.split('|');
                for (var i = 0, len = filterSegs.length; i < len; i++) {
                    var seg = filterSegs[i];
                    if (/^\s*([a-z0-9_-]+)(\((.*)\))?\s*$/i.test(seg)) {
                        variableCode.unshift('fs["' + RegExp.$1 + '"](');
                        if (RegExp.$3) {
                            variableCode.push(',', RegExp.$3);
                        }
                        variableCode.push(')');
                    }
                }
            }
            code.push(wrapHead, variableCode.join(''), wrapFoot);
        }, function (text) {
            code.push(wrapHead, forText ? stringLiteralize(text) : text, wrapFoot);
        });
        return code.join('');
    }
    function TextNode(value, engine) {
        this.value = value;
        this.engine = engine;
    }
    TextNode.prototype = {
        getRendererBody: function () {
            var value = this.value;
            var options = this.engine.options;
            if (!value || options.strip && /^\s*$/.test(value)) {
                return '';
            }
            return compileVariable(value, this.engine, 1);
        },
        clone: function () {
            return this;
        }
    };
    function Command(value, engine) {
        this.value = value;
        this.engine = engine;
        this.children = [];
        this.cloneProps = [];
    }
    Command.prototype = {
        addChild: function (node) {
            this.children.push(node);
        },
        open: function (context) {
            var parent = context.stack.top();
            parent && parent.addChild(this);
            context.stack.push(this);
        },
        close: function (context) {
            if (context.stack.top() === this) {
                context.stack.pop();
            }
        },
        getRendererBody: function () {
            var buf = [];
            var children = this.children;
            for (var i = 0; i < children.length; i++) {
                buf.push(children[i].getRendererBody());
            }
            return buf.join('');
        },
        clone: function () {
            var node = new this.constructor(this.value, this.engine);
            for (var i = 0, l = this.children.length; i < l; i++) {
                node.addChild(this.children[i].clone());
            }
            for (var i = 0, l = this.cloneProps.length; i < l; i++) {
                var prop = this.cloneProps[i];
                node[prop] = this[prop];
            }
            return node;
        }
    };
    function autoCloseCommand(context, CommandType) {
        var stack = context.stack;
        var closeEnd = CommandType ? stack.find(function (item) {
                return item instanceof CommandType;
            }) : stack.bottom();
        if (closeEnd) {
            var node;
            while ((node = stack.top()) !== closeEnd) {
                if (!node.autoClose) {
                    throw new Error(node.type + ' must be closed manually: ' + node.value);
                }
                node.autoClose(context);
            }
            closeEnd.close(context);
        }
        return closeEnd;
    }
    var RENDERER_BODY_START = '' + 'data=data||{};' + 'var v={},fs=engine.filters,hg=typeof data.get=="function",' + 'gv=function(n,ps){' + 'var p=ps[0],d=v[p];' + 'if(d==null){' + 'if(hg){return data.get(n);}' + 'd=data[p];' + '}' + 'for(var i=1,l=ps.length;i<l;i++)if(d!=null)d = d[ps[i]];' + 'return d;' + '},' + 'ts=function(s){' + 'if(typeof s==="string"){return s;}' + 'if(s==null){s="";}' + 'return ""+s;' + '};';
    ;
    function TargetCommand(value, engine) {
        if (!/^\s*([a-z0-9\/_-]+)\s*(\(\s*master\s*=\s*([a-z0-9\/_-]+)\s*\))?\s*/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.master = RegExp.$3;
        this.name = RegExp.$1;
        Command.call(this, value, engine);
        this.blocks = {};
    }
    inherits(TargetCommand, Command);
    function BlockCommand(value, engine) {
        if (!/^\s*([a-z0-9\/_-]+)\s*$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.name = RegExp.$1;
        Command.call(this, value, engine);
        this.cloneProps = ['name'];
    }
    inherits(BlockCommand, Command);
    function ImportCommand(value, engine) {
        if (!/^\s*([a-z0-9\/_-]+)\s*$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.name = RegExp.$1;
        Command.call(this, value, engine);
        this.cloneProps = [
            'name',
            'state',
            'blocks'
        ];
        this.blocks = {};
    }
    inherits(ImportCommand, Command);
    function VarCommand(value, engine) {
        if (!/^\s*([a-z0-9_]+)\s*=([\s\S]*)$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.name = RegExp.$1;
        this.expr = RegExp.$2;
        Command.call(this, value, engine);
        this.cloneProps = [
            'name',
            'expr'
        ];
    }
    inherits(VarCommand, Command);
    function FilterCommand(value, engine) {
        if (!/^\s*([a-z0-9_-]+)\s*(\(([\s\S]*)\))?\s*$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.name = RegExp.$1;
        this.args = RegExp.$3;
        Command.call(this, value, engine);
        this.cloneProps = [
            'name',
            'args'
        ];
    }
    inherits(FilterCommand, Command);
    function UseCommand(value, engine) {
        if (!/^\s*([a-z0-9\/_-]+)\s*(\(([\s\S]*)\))?\s*$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.name = RegExp.$1;
        this.args = RegExp.$3;
        Command.call(this, value, engine);
        this.cloneProps = [
            'name',
            'args'
        ];
    }
    inherits(UseCommand, Command);
    function ForCommand(value, engine) {
        var rule = new RegExp(stringFormat('^\\s*({0}[\\s\\S]+{1})\\s+as\\s+{0}([0-9a-z_]+){1}\\s*(,\\s*{0}([0-9a-z_]+){1})?\\s*$', regexpLiteral(engine.options.variableOpen), regexpLiteral(engine.options.variableClose)), 'i');
        if (!rule.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.list = RegExp.$1;
        this.item = RegExp.$2;
        this.index = RegExp.$4;
        Command.call(this, value, engine);
        this.cloneProps = [
            'list',
            'item',
            'index'
        ];
    }
    inherits(ForCommand, Command);
    function IfCommand(value, engine) {
        Command.call(this, value, engine);
    }
    inherits(IfCommand, Command);
    function ElifCommand(value, engine) {
        IfCommand.call(this, value, engine);
    }
    inherits(ElifCommand, IfCommand);
    function ElseCommand(value, engine) {
        Command.call(this, value, engine);
    }
    inherits(ElseCommand, IfCommand);
    var TargetState = {
            READING: 1,
            READED: 2,
            APPLIED: 3,
            READY: 4
        };
    ImportCommand.prototype.applyMaster = TargetCommand.prototype.applyMaster = function (masterName) {
        if (this.state >= TargetState.APPLIED) {
            return 1;
        }
        var blocks = this.blocks;
        function replaceBlock(node) {
            var children = node.children;
            if (children instanceof Array) {
                for (var i = 0, len = children.length; i < len; i++) {
                    var child = children[i];
                    if (child instanceof BlockCommand && blocks[child.name]) {
                        child = children[i] = blocks[child.name];
                    }
                    replaceBlock(child);
                }
            }
        }
        var master = this.engine.targets[masterName];
        if (master && master.applyMaster(master.master)) {
            this.children = master.clone().children;
            replaceBlock(this);
            this.state = TargetState.APPLIED;
            return 1;
        }
    };
    TargetCommand.prototype.isReady = function () {
        if (this.state >= TargetState.READY) {
            return 1;
        }
        var engine = this.engine;
        var readyState = 1;
        function checkReadyState(node) {
            for (var i = 0, len = node.children.length; i < len; i++) {
                var child = node.children[i];
                if (child instanceof ImportCommand) {
                    var target = engine.targets[child.name];
                    readyState = readyState && target && target.isReady(engine);
                } else if (child instanceof Command) {
                    checkReadyState(child);
                }
            }
        }
        if (this.applyMaster(this.master)) {
            checkReadyState(this);
            readyState && (this.state = TargetState.READY);
            return readyState;
        }
    };
    TargetCommand.prototype.getRenderer = function () {
        if (this.renderer) {
            return this.renderer;
        }
        if (this.isReady()) {
            var realRenderer = new Function('data', 'engine', [
                    RENDERER_BODY_START,
                    RENDER_STRING_DECLATION,
                    this.getRendererBody(),
                    RENDER_STRING_RETURN
                ].join('\n'));
            var engine = this.engine;
            this.renderer = function (data) {
                return realRenderer(data, engine);
            };
            return this.renderer;
        }
        return null;
    };
    function addTargetToContext(target, context) {
        context.target = target;
        var engine = context.engine;
        var name = target.name;
        if (engine.targets[name]) {
            switch (engine.options.namingConflict) {
            case 'override':
                engine.targets[name] = target;
                context.targets.push(name);
            case 'ignore':
                break;
            default:
                throw new Error('Target exists: ' + name);
            }
        } else {
            engine.targets[name] = target;
            context.targets.push(name);
        }
    }
    TargetCommand.prototype.open = function (context) {
        autoCloseCommand(context);
        Command.prototype.open.call(this, context);
        this.state = TargetState.READING;
        addTargetToContext(this, context);
    };
    VarCommand.prototype.open = UseCommand.prototype.open = function (context) {
        context.stack.top().addChild(this);
    };
    BlockCommand.prototype.open = function (context) {
        Command.prototype.open.call(this, context);
        (context.imp || context.target).blocks[this.name] = this;
    };
    ElifCommand.prototype.open = function (context) {
        var elseCommand = new ElseCommand();
        elseCommand.open(context);
        var ifCommand = autoCloseCommand(context, IfCommand);
        ifCommand.addChild(this);
        context.stack.push(this);
    };
    ElseCommand.prototype.open = function (context) {
        var ifCommand = autoCloseCommand(context, IfCommand);
        ifCommand.addChild(this);
        context.stack.push(this);
    };
    ImportCommand.prototype.open = function (context) {
        this.parent = context.stack.top();
        this.target = context.target;
        Command.prototype.open.call(this, context);
        this.state = TargetState.READING;
        context.imp = this;
    };
    UseCommand.prototype.close = VarCommand.prototype.close = function () {
    };
    ImportCommand.prototype.close = function (context) {
        Command.prototype.close.call(this, context);
        this.state = TargetState.READED;
        context.imp = null;
    };
    TargetCommand.prototype.close = function (context) {
        Command.prototype.close.call(this, context);
        this.state = this.master ? TargetState.READED : TargetState.APPLIED;
        context.target = null;
    };
    ImportCommand.prototype.autoClose = function (context) {
        var parentChildren = this.parent.children;
        parentChildren.push.apply(parentChildren, this.children);
        this.children.length = 0;
        for (var key in this.blocks) {
            this.target.blocks[key] = this.blocks[key];
        }
        this.blocks = {};
        this.close(context);
    };
    UseCommand.prototype.beforeOpen = ImportCommand.prototype.beforeOpen = VarCommand.prototype.beforeOpen = ForCommand.prototype.beforeOpen = FilterCommand.prototype.beforeOpen = BlockCommand.prototype.beforeOpen = IfCommand.prototype.beforeOpen = TextNode.prototype.beforeAdd = function (context) {
        if (context.stack.bottom()) {
            return;
        }
        var target = new TargetCommand(generateGUID(), context.engine);
        target.open(context);
    };
    ImportCommand.prototype.getRendererBody = function () {
        this.applyMaster(this.name);
        return Command.prototype.getRendererBody.call(this);
    };
    UseCommand.prototype.getRendererBody = function () {
        return stringFormat('{0}engine.render({2},{{3}}){1}', RENDER_STRING_ADD_START, RENDER_STRING_ADD_END, stringLiteralize(this.name), compileVariable(this.args, this.engine).replace(/(^|,)\s*([a-z0-9_]+)\s*=/gi, function (match, start, argName) {
            return (start || '') + stringLiteralize(argName) + ':';
        }));
    };
    VarCommand.prototype.getRendererBody = function () {
        if (this.expr) {
            return stringFormat('v[{0}]={1};', stringLiteralize(this.name), compileVariable(this.expr, this.engine));
        }
        return '';
    };
    IfCommand.prototype.getRendererBody = function () {
        return stringFormat('if({0}){{1}}', compileVariable(this.value, this.engine), Command.prototype.getRendererBody.call(this));
    };
    ElseCommand.prototype.getRendererBody = function () {
        return stringFormat('}else{{0}', Command.prototype.getRendererBody.call(this));
    };
    ForCommand.prototype.getRendererBody = function () {
        return stringFormat('' + 'var {0}={1};' + 'if({0} instanceof Array)' + 'for (var {4}=0,{5}={0}.length;{4}<{5};{4}++){v[{2}]={4};v[{3}]={0}[{4}];{6}}' + 'else if(typeof {0}==="object")' + 'for(var {4} in {0}){v[{2}]={4};v[{3}]={0}[{4}];{6}}', generateGUID(), compileVariable(this.list, this.engine), stringLiteralize(this.index || generateGUID()), stringLiteralize(this.item), generateGUID(), generateGUID(), Command.prototype.getRendererBody.call(this));
    };
    FilterCommand.prototype.getRendererBody = function () {
        var args = this.args;
        return stringFormat('{2}fs[{5}]((function(){{0}{4}{1}})(){6}){3}', RENDER_STRING_DECLATION, RENDER_STRING_RETURN, RENDER_STRING_ADD_START, RENDER_STRING_ADD_END, Command.prototype.getRendererBody.call(this), stringLiteralize(this.name), args ? ',' + compileVariable(args, this.engine) : '');
    };
    var commandTypes = {};
    function addCommandType(name, Type) {
        commandTypes[name] = Type;
        Type.prototype.type = name;
    }
    addCommandType('target', TargetCommand);
    addCommandType('block', BlockCommand);
    addCommandType('import', ImportCommand);
    addCommandType('use', UseCommand);
    addCommandType('var', VarCommand);
    addCommandType('for', ForCommand);
    addCommandType('if', IfCommand);
    addCommandType('elif', ElifCommand);
    addCommandType('else', ElseCommand);
    addCommandType('filter', FilterCommand);
    function Engine(options) {
        this.options = {
            commandOpen: '<!--',
            commandClose: '-->',
            commandSyntax: /^\s*(\/)?([a-z]+)\s*(?::([\s\S]*))?$/,
            variableOpen: '${',
            variableClose: '}',
            defaultFilter: 'html'
        };
        this.config(options);
        this.targets = {};
        this.filters = extend({}, DEFAULT_FILTERS);
    }
    Engine.prototype.config = function (options) {
        extend(this.options, options);
    };
    Engine.prototype.compile = Engine.prototype.parse = function (source) {
        if (source) {
            var targetNames = parseSource(source, this);
            if (targetNames.length) {
                return this.targets[targetNames[0]].getRenderer();
            }
        }
        return new Function('return ""');
    };
    Engine.prototype.getRenderer = function (name) {
        var target = this.targets[name];
        if (target) {
            return target.getRenderer();
        }
    };
    Engine.prototype.render = function (name, data) {
        var renderer = this.getRenderer(name);
        if (renderer) {
            return renderer(data);
        }
        return '';
    };
    Engine.prototype.addFilter = function (name, filter) {
        if (typeof filter === 'function') {
            this.filters[name] = filter;
        }
    };
    function parseSource(source, engine) {
        var commandOpen = engine.options.commandOpen;
        var commandClose = engine.options.commandClose;
        var commandSyntax = engine.options.commandSyntax;
        var stack = new Stack();
        var analyseContext = {
                engine: engine,
                targets: [],
                stack: stack,
                target: null
            };
        var textBuf = [];
        function flushTextBuf() {
            var text;
            if (textBuf.length > 0 && (text = textBuf.join(''))) {
                var textNode = new TextNode(text, engine);
                textNode.beforeAdd(analyseContext);
                stack.top().addChild(textNode);
                textBuf = [];
                if (engine.options.strip && analyseContext.current instanceof Command) {
                    textNode.value = text.replace(/^[\x20\t\r]*\n/, '');
                }
                analyseContext.current = textNode;
            }
        }
        var NodeType;
        parseTextBlock(source, commandOpen, commandClose, 0, function (text) {
            var match = commandSyntax.exec(text);
            if (match && (NodeType = commandTypes[match[2].toLowerCase()]) && typeof NodeType === 'function') {
                flushTextBuf();
                var currentNode = analyseContext.current;
                if (engine.options.strip && currentNode instanceof TextNode) {
                    currentNode.value = currentNode.value.replace(/\r?\n[\x20\t]*$/, '\n');
                }
                if (match[1]) {
                    currentNode = autoCloseCommand(analyseContext, NodeType);
                } else {
                    currentNode = new NodeType(match[3], engine);
                    if (typeof currentNode.beforeOpen === 'function') {
                        currentNode.beforeOpen(analyseContext);
                    }
                    currentNode.open(analyseContext);
                }
                analyseContext.current = currentNode;
            } else if (!/^\s*\/\//.test(text)) {
                textBuf.push(commandOpen, text, commandClose);
            }
            NodeType = null;
        }, function (text) {
            textBuf.push(text);
        });
        flushTextBuf();
        autoCloseCommand(analyseContext);
        return analyseContext.targets;
    }
    var etpl = new Engine();
    etpl.Engine = Engine;
    if (typeof exports === 'object' && typeof module === 'object') {
        exports = module.exports = etpl;
    } else if (typeof define === 'function' && define.amd) {
        define('etpl/main', [], etpl);
    } else {
        root.etpl = etpl;
    }
}(this));

define('etpl', ['etpl/main'], function ( main ) { return main; });

define('mini-event/lib', ['require'], function (require) {
    var lib = {};
    lib.extend = function (source) {
        for (var i = 1; i < arguments.length; i++) {
            var addition = arguments[i];
            if (!addition) {
                continue;
            }
            for (var key in addition) {
                if (addition.hasOwnProperty(key)) {
                    source[key] = addition[key];
                }
            }
        }
        return source;
    };
    return lib;
});

define('mini-event/Event', [
    'require',
    './lib'
], function (require) {
    var lib = require('./lib');
    function returnTrue() {
        return true;
    }
    function returnFalse() {
        return false;
    }
    function isObject(target) {
        return Object.prototype.toString.call(target) === '[object Object]';
    }
    function Event(type, args) {
        if (typeof type === 'object') {
            args = type;
            type = args.type;
        }
        if (isObject(args)) {
            lib.extend(this, args);
        } else if (args) {
            this.data = args;
        }
        if (type) {
            this.type = type;
        }
    }
    Event.prototype.isDefaultPrevented = returnFalse;
    Event.prototype.preventDefault = function () {
        this.isDefaultPrevented = returnTrue;
    };
    Event.prototype.isPropagationStopped = returnFalse;
    Event.prototype.stopPropagation = function () {
        this.isPropagationStopped = returnTrue;
    };
    Event.prototype.isImmediatePropagationStopped = returnFalse;
    Event.prototype.stopImmediatePropagation = function () {
        this.isImmediatePropagationStopped = returnTrue;
        this.stopPropagation();
    };
    var globalWindow = function () {
            return this;
        }();
    Event.fromDOMEvent = function (domEvent, type, args) {
        domEvent = domEvent || globalWindow.event;
        var event = new Event(type, args);
        event.preventDefault = function () {
            if (domEvent.preventDefault) {
                domEvent.preventDefault();
            } else {
                domEvent.returnValue = false;
            }
            Event.prototype.preventDefault.call(this);
        };
        event.stopPropagation = function () {
            if (domEvent.stopPropagation) {
                domEvent.stopPropagation();
            } else {
                domEvent.cancelBubble = true;
            }
            Event.prototype.stopPropagation.call(this);
        };
        event.stopImmediatePropagation = function () {
            if (domEvent.stopImmediatePropagation) {
                domEvent.stopImmediatePropagation();
            }
            Event.prototype.stopImmediatePropagation.call(this);
        };
        return event;
    };
    var EVENT_PROPERTY_BLACK_LIST = {
            type: true,
            target: true,
            preventDefault: true,
            isDefaultPrevented: true,
            stopPropagation: true,
            isPropagationStopped: true,
            stopImmediatePropagation: true,
            isImmediatePropagationStopped: true
        };
    Event.fromEvent = function (originalEvent, options) {
        var defaults = {
                type: originalEvent.type,
                preserveData: false,
                syncState: false
            };
        options = lib.extend(defaults, options);
        var newEvent = new Event(options.type);
        if (options.preserveData) {
            for (var key in originalEvent) {
                if (originalEvent.hasOwnProperty(key) && !EVENT_PROPERTY_BLACK_LIST.hasOwnProperty(key)) {
                    newEvent[key] = originalEvent[key];
                }
            }
        }
        if (options.extend) {
            lib.extend(newEvent, options.extend);
        }
        if (options.syncState) {
            newEvent.preventDefault = function () {
                originalEvent.preventDefault();
                Event.prototype.preventDefault.call(this);
            };
            newEvent.stopPropagation = function () {
                originalEvent.stopPropagation();
                Event.prototype.stopPropagation.call(this);
            };
            newEvent.stopImmediatePropagation = function () {
                originalEvent.stopImmediatePropagation();
                Event.prototype.stopImmediatePropagation.call(this);
            };
        }
        return newEvent;
    };
    Event.delegate = function (from, fromType, to, toType, options) {
        var useDifferentType = typeof fromType === 'string';
        var source = {
                object: from,
                type: useDifferentType ? fromType : to
            };
        var target = {
                object: useDifferentType ? to : fromType,
                type: useDifferentType ? toType : to
            };
        var config = useDifferentType ? options : toType;
        config = lib.extend({ preserveData: false }, config);
        if (typeof source.object.on !== 'function' || typeof target.object.on !== 'function' || typeof target.object.fire !== 'function') {
            return;
        }
        var delegator = function (originalEvent) {
            var event = Event.fromEvent(originalEvent, config);
            event.type = target.type;
            event.target = target.object;
            target.object.fire(target.type, event);
        };
        source.object.on(source.type, delegator);
    };
    return Event;
});

define('fc-core/util', [
    'require',
    'underscore',
    './assert',
    'mini-event/Event',
    'etpl'
], function (require) {
    'use strict';
    var _ = require('underscore');
    var assert = require('./assert');
    var util = {};
    function rand16Num(len) {
        len = len || 0;
        var result = [];
        for (var i = 0; i < len; i++) {
            result.push('0123456789abcdef'.charAt(Math.floor(Math.random() * 16)));
        }
        return result.join('');
    }
    util.guid = function () {
        var curr = new Date().valueOf().toString();
        return [
            '4b534c46',
            rand16Num(4),
            '4' + rand16Num(3),
            rand16Num(4),
            curr.substring(0, 12)
        ].join('-');
    };
    util.uid = function () {
        return [
            new Date().valueOf().toString(),
            rand16Num(4)
        ].join('');
    };
    util.processError = function (ex) {
        if (ex instanceof Error) {
            window.console.error(ex.stack);
        } else if (ex.error instanceof Error || _.isArray(ex.error)) {
            util.processError(ex.error);
        } else if (_.isArray(ex)) {
            _.each(ex, util.processError);
        } else if (ex instanceof require('mini-event/Event') && ex.type === 'error') {
            window.console.error(ex.error.failType, ex.error.reason, ex);
        } else {
            window.console.error(ex);
        }
    };
    var toString = Object.prototype.toString;
    function deepExtend(target) {
        var length = arguments.length;
        if (length < 2) {
            return target;
        }
        for (var i = 1; i < length; i++) {
            simpleDeepExtend(arguments[0], arguments[i]);
        }
        return arguments[0];
    }
    function simpleDeepExtend(target, source) {
        for (var k in source) {
            if (!source.hasOwnProperty(k)) {
                continue;
            }
            var targetType = toString.call(target[k]);
            var sourceType = toString.call(source[k]);
            switch (sourceType) {
            case '[object Object]':
                if (targetType !== sourceType) {
                    target[k] = clone(source[k]);
                } else {
                    if (!target[k]) {
                        target[k] = clone(source[k]);
                    }
                    deepExtend(target[k], source[k]);
                }
                break;
            case '[object Array]':
                target[k] = clone(source[k]);
                break;
            default:
                target[k] = source[k];
            }
        }
        return target;
    }
    util.deepExtend = deepExtend;
    var simpleType = {
            '[object String]': 1,
            '[object Number]': 1,
            '[object Boolean]': 1,
            '[object Null]': 1,
            '[object Undefined]': 1,
            '[object Function]': 1,
            '[object RegExp]': 1,
            '[object Date]': 1,
            '[object Error]': 1
        };
    function clone(target) {
        var strType = toString.call(target);
        if (simpleType[strType]) {
            return target;
        }
        switch (strType) {
        case '[object Object]':
            if (!target) {
                return target;
            }
            var newObj = {};
            for (var k in target) {
                if (target.hasOwnProperty(k)) {
                    newObj[k] = clone(target[k]);
                }
            }
            return newObj;
        case '[object Array]':
            var newArr = [];
            for (var i = 0, l = target.length; i < l; i++) {
                newArr.push(clone(target[i]));
            }
            return newArr;
        default:
            return target;
        }
    }
    util.clone = clone;
    function mixWith(conf, data) {
        return JSON.parse(require('etpl').compile(JSON.stringify(conf))(data));
    }
    util.mixWith = mixWith;
    util.customData = function (data) {
        return { data: data };
    };
    util.parseJSON = function (text) {
        if (!text) {
            return undefined;
        }
        if (window.JSON && typeof JSON.parse === 'function') {
            return JSON.parse(text);
        } else {
            return new Function('return (' + text + ');')();
        }
    };
    return util;
});

define('fc-core/main', [
    'require',
    'promise/setImmediate',
    './aop',
    './assert',
    './oo',
    'etpl',
    './util'
], function (require) {
    'use strict';
    var fc = {
            version: '0.0.1.alpha.2',
            setImmediate: require('promise/setImmediate'),
            aop: require('./aop'),
            assert: require('./assert'),
            oo: require('./oo'),
            tpl: require('etpl'),
            util: require('./util')
        };
    return fc;
});

define('fc-core', ['fc-core/main'], function ( main ) { return main; });

define('fc-ajax/hooks', ['require'], function (require) {
    var noop = function () {
    };
    function serializeArray(prefix, array) {
        var encodedKey = prefix ? encodeURIComponent(prefix) : '';
        var encoded = [];
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            encoded[i] = this.serializeData('', item);
        }
        return encodedKey ? encodedKey + '=' + encoded.join(',') : encoded.join(',');
    }
    function serializeData(prefix, data) {
        if (arguments.length === 1) {
            data = prefix;
            prefix = '';
        }
        if (data == null) {
            data = '';
        }
        var getKey = this.serializeData.getKey;
        var encodedKey = prefix ? encodeURIComponent(prefix) : '';
        var type = Object.prototype.toString.call(data);
        switch (type) {
        case '[object Array]':
            return this.serializeArray(prefix, data);
        case '[object Object]':
            var result = [];
            for (var name in data) {
                var propertyKey = getKey(name, prefix);
                var propertyValue = this.serializeData(propertyKey, data[name]);
                result.push(propertyValue);
            }
            return result.join('&');
        default:
            return encodedKey ? encodedKey + '=' + encodeURIComponent(data) : encodeURIComponent(data);
        }
    }
    serializeData.getKey = function (propertyName, parentKey) {
        return parentKey ? parentKey + '.' + propertyName : propertyName;
    };
    var hooks = {
            serializeData: serializeData,
            serializeArray: serializeArray,
            beforeEachRequest: noop,
            afterEachRequest: noop,
            eachSuccess: noop,
            eachFailure: noop
        };
    return hooks;
});

define('fc-ajax/globalData', ['require'], function (require) {
    return {};
});

define('fc-ajax/config', ['require'], function (require) {
    var config = {
            method: 'POST',
            data: {},
            cache: false,
            timeout: 0,
            charset: '',
            dataType: 'json'
        };
    return config;
});

define('er/assert', [], function () {
    if (window.DEBUG) {
        var assert = function (condition, message) {
            if (!condition) {
                throw new Error(message);
            }
        };
        assert.has = function (obj, message) {
            assert(obj != null, message);
        };
        assert.equals = function (x, y, message) {
            assert(x === y, message);
        };
        assert.hasProperty = function (obj, propertyName, message) {
            assert(obj[propertyName] != null, message);
        };
        assert.lessThan = function (value, max, message) {
            assert(value < max, message);
        };
        assert.greaterThan = function (value, min, message) {
            assert(value > min, message);
        };
        assert.lessThanOrEquals = function (value, max, message) {
            assert(value <= max, message);
        };
        assert.greaterThanOrEquals = function (value, min, message) {
            assert(value >= min, message);
        };
        return assert;
    } else {
        var assert = function () {
        };
        assert.has = assert;
        assert.equals = assert;
        assert.hasProperty = assert;
        assert.lessThan = assert;
        assert.greaterThan = assert;
        assert.lessThanOrEquals = assert;
        assert.greaterThanOrEquals = assert;
        return assert;
    }
});

define('er/util', [], function () {
    var now = +new Date();
    var util = {};
    util.guid = function () {
        return 'er' + now++;
    };
    util.mix = function (source) {
        for (var i = 1; i < arguments.length; i++) {
            var destination = arguments[i];
            if (!destination) {
                continue;
            }
            for (var key in destination) {
                if (destination.hasOwnProperty(key)) {
                    source[key] = destination[key];
                }
            }
        }
        return source;
    };
    var nativeBind = Function.prototype.bind;
    util.bind = nativeBind ? function (fn) {
        return nativeBind.apply(fn, [].slice.call(arguments, 1));
    } : function (fn, context) {
        var extraArgs = [].slice.call(arguments, 2);
        return function () {
            var args = extraArgs.concat([].slice.call(arguments));
            return fn.apply(context, args);
        };
    };
    util.noop = function () {
    };
    var dontEnumBug = !{ toString: 1 }.propertyIsEnumerable('toString');
    util.inherits = function (type, superType) {
        var Empty = function () {
        };
        Empty.prototype = superType.prototype;
        var proto = new Empty();
        var originalPrototype = type.prototype;
        type.prototype = proto;
        for (var key in originalPrototype) {
            proto[key] = originalPrototype[key];
        }
        if (dontEnumBug) {
            if (originalPrototype.hasOwnProperty('toString')) {
                proto.toString = originalPrototype.toString;
            }
            if (originalPrototype.hasOwnProperty('valueOf')) {
                proto.valueOf = originalPrototype.valueOf;
            }
        }
        type.prototype.constructor = type;
        return type;
    };
    util.parseJSON = function (text) {
        if (!text) {
            return undefined;
        }
        if (window.JSON && typeof JSON.parse === 'function') {
            return JSON.parse(text);
        } else {
            return new Function('return (' + text + ');')();
        }
    };
    var whitespace = /(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g;
    util.trim = function (source) {
        return source.replace(whitespace, '');
    };
    util.encodeHTML = function (source) {
        source = source + '';
        return source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };
    util.getElement = function (element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        return element;
    };
    return util;
});

define('mini-event/EventQueue', [
    'require',
    './lib'
], function (require) {
    var lib = require('./lib');
    function isContextIdentical(context, handler, thisObject) {
        return context && context.handler === handler && context.thisObject == thisObject;
    }
    function EventQueue() {
        this.queue = [];
    }
    EventQueue.prototype.add = function (handler, options) {
        if (handler !== false && typeof handler !== 'function') {
            throw new Error('event handler must be a function or const false');
        }
        var wrapper = { handler: handler };
        lib.extend(wrapper, options);
        for (var i = 0; i < this.queue.length; i++) {
            var context = this.queue[i];
            if (isContextIdentical(context, handler, wrapper.thisObject)) {
                return;
            }
        }
        this.queue.push(wrapper);
    };
    EventQueue.prototype.remove = function (handler, thisObject) {
        if (!handler) {
            this.clear();
            return;
        }
        for (var i = 0; i < this.queue.length; i++) {
            var context = this.queue[i];
            if (isContextIdentical(context, handler, thisObject)) {
                this.queue[i] = null;
                return;
            }
        }
    };
    EventQueue.prototype.clear = function () {
        this.queue.length = 0;
    };
    EventQueue.prototype.execute = function (event, thisObject) {
        var queue = this.queue;
        for (var i = 0; i < queue.length; i++) {
            if (typeof event.isImmediatePropagationStopped === 'function' && event.isImmediatePropagationStopped()) {
                return;
            }
            var context = queue[i];
            if (!context) {
                continue;
            }
            var handler = context.handler;
            if (handler === false) {
                if (typeof event.preventDefault === 'function') {
                    event.preventDefault();
                }
                if (typeof event.stopPropagation === 'function') {
                    event.stopPropagation();
                }
            } else {
                handler.call(context.thisObject || thisObject, event);
            }
            if (context.once) {
                this.remove(context.handler, context.thisObject);
            }
        }
    };
    EventQueue.prototype.getLength = function () {
        var count = 0;
        for (var i = 0; i < this.queue.length; i++) {
            if (this.queue[i]) {
                count++;
            }
        }
        return count;
    };
    EventQueue.prototype.length = EventQueue.prototype.getLength;
    EventQueue.prototype.dispose = function () {
        this.clear();
        this.queue = null;
    };
    return EventQueue;
});

define('mini-event/EventTarget', [
    'require',
    './lib',
    './Event',
    './EventQueue'
], function (require) {
    var lib = require('./lib');
    var Event = require('./Event');
    var EventQueue = require('./EventQueue');
    function EventTarget() {
    }
    EventTarget.prototype.on = function (type, fn, thisObject, options) {
        if (!this.miniEventPool) {
            this.miniEventPool = {};
        }
        if (!this.miniEventPool.hasOwnProperty(type)) {
            this.miniEventPool[type] = new EventQueue();
        }
        var queue = this.miniEventPool[type];
        options = lib.extend({}, options);
        if (thisObject) {
            options.thisObject = thisObject;
        }
        queue.add(fn, options);
    };
    EventTarget.prototype.once = function (type, fn, thisObject, options) {
        options = lib.extend({}, options);
        options.once = true;
        this.on(type, fn, thisObject, options);
    };
    EventTarget.prototype.un = function (type, handler, thisObject) {
        if (!this.miniEventPool || !this.miniEventPool.hasOwnProperty(type)) {
            return;
        }
        var queue = this.miniEventPool[type];
        queue.remove(handler, thisObject);
    };
    EventTarget.prototype.fire = function (type, args) {
        if (arguments.length === 1 && typeof type === 'object') {
            args = type;
            type = args.type;
        }
        if (!type) {
            throw new Error('No event type specified');
        }
        if (type === '*') {
            throw new Error('Cannot fire global event');
        }
        var event = args instanceof Event ? args : new Event(type, args);
        event.target = this;
        var inlineHandler = this['on' + type];
        if (typeof inlineHandler === 'function') {
            inlineHandler.call(this, event);
        }
        if (this.miniEventPool && this.miniEventPool.hasOwnProperty(type)) {
            var queue = this.miniEventPool[type];
            queue.execute(event, this);
        }
        if (this.miniEventPool && this.miniEventPool.hasOwnProperty('*')) {
            var globalQueue = this.miniEventPool['*'];
            globalQueue.execute(event, this);
        }
        return event;
    };
    EventTarget.prototype.destroyEvents = function () {
        if (!this.miniEventPool) {
            return;
        }
        for (var name in this.miniEventPool) {
            if (this.miniEventPool.hasOwnProperty(name)) {
                this.miniEventPool[name].dispose();
            }
        }
        this.miniEventPool = null;
    };
    EventTarget.enable = function (target) {
        target.miniEventPool = {};
        lib.extend(target, EventTarget.prototype);
    };
    return EventTarget;
});

define('er/Deferred', [
    'require',
    './util',
    './assert',
    'eoo',
    'mini-event/EventTarget'
], function (require) {
    var util = require('./util');
    var assert = require('./assert');
    var setImmediate = typeof window.setImmediate === 'function' ? function (fn) {
            window.setImmediate(fn);
        } : function (fn) {
            window.setTimeout(fn, 0);
        };
    function tryFlush(deferred) {
        if (deferred.state === 'pending') {
            return;
        }
        var callbacks = deferred.state === 'resolved' ? deferred._doneCallbacks.slice() : deferred._failCallbacks.slice();
        function flush() {
            for (var i = 0; i < callbacks.length; i++) {
                var callback = callbacks[i];
                try {
                    callback.apply(deferred.promise, deferred._args);
                } catch (ex) {
                }
            }
        }
        if (deferred.syncModeEnabled) {
            flush();
        } else {
            setImmediate(flush);
        }
        deferred._doneCallbacks = [];
        deferred._failCallbacks = [];
    }
    function pipe(original, deferred, callback, actionType) {
        return function () {
            if (typeof callback === 'function') {
                var resolver = deferred.resolver;
                try {
                    var returnValue = callback.apply(original.promise, arguments);
                    if (Deferred.isPromise(returnValue)) {
                        returnValue.then(resolver.resolve, resolver.reject);
                    } else {
                        resolver.resolve(returnValue);
                    }
                } catch (error) {
                    Deferred.fire('exception', {
                        deferred: original,
                        args: [error],
                        reason: error
                    });
                    resolver.reject(error);
                }
            } else {
                deferred[actionType].apply(deferred, original._args);
            }
        };
    }
    var exports = {};
    exports.constructor = function () {
        this.state = 'pending';
        this._args = null;
        this._doneCallbacks = [];
        this._failCallbacks = [];
        this.promise = {
            done: util.bind(this.done, this),
            fail: util.bind(this.fail, this),
            ensure: util.bind(this.ensure, this),
            then: util.bind(this.then, this)
        };
        this.promise.promise = this.promise;
        this.resolver = {
            resolve: util.bind(this.resolve, this),
            reject: util.bind(this.reject, this)
        };
    };
    exports.syncModeEnabled = false;
    exports.resolve = function () {
        if (this.state !== 'pending') {
            return;
        }
        this.state = 'resolved';
        this._args = [].slice.call(arguments);
        Deferred.fire('resolve', {
            deferred: this,
            args: this._args,
            reason: this._args[0]
        });
        tryFlush(this);
    };
    exports.reject = function () {
        if (this.state !== 'pending') {
            return;
        }
        this.state = 'rejected';
        this._args = [].slice.call(arguments);
        Deferred.fire('reject', {
            deferred: this,
            args: this._args,
            reason: this._args[0]
        });
        tryFlush(this);
    };
    exports.done = function (callback) {
        return this.then(callback);
    };
    exports.fail = function (callback) {
        return this.then(null, callback);
    };
    exports.ensure = function (callback) {
        return this.then(callback, callback);
    };
    exports.then = function (done, fail) {
        var deferred = new Deferred();
        deferred.syncModeEnabled = this.syncModeEnabled;
        this._doneCallbacks.push(pipe(this, deferred, done, 'resolve'));
        this._failCallbacks.push(pipe(this, deferred, fail, 'reject'));
        tryFlush(this);
        return deferred.promise;
    };
    var Deferred = require('eoo').create(exports);
    require('mini-event/EventTarget').enable(Deferred);
    Deferred.isPromise = function (value) {
        return value && typeof value.then === 'function';
    };
    Deferred.all = function () {
        var workingUnits = [].concat.apply([], arguments);
        var workingCount = workingUnits.length;
        if (!workingCount) {
            return Deferred.resolved();
        }
        var actionType = 'resolve';
        var result = [];
        var jointDeferred = new Deferred();
        function resolveOne(whichToFill) {
            workingCount--;
            assert.greaterThanOrEquals(workingCount, 0, 'workingCount should be positive');
            var unitResult = [].slice.call(arguments, 1);
            if (unitResult.length <= 1) {
                unitResult = unitResult[0];
            }
            result[whichToFill] = unitResult;
            if (workingCount === 0) {
                jointDeferred[actionType].apply(jointDeferred, result);
            }
        }
        function rejectOne() {
            actionType = 'reject';
            resolveOne.apply(this, arguments);
        }
        for (var i = 0; i < workingUnits.length; i++) {
            var unit = workingUnits[i];
            unit.then(util.bind(resolveOne, unit, i), util.bind(rejectOne, unit, i));
        }
        return jointDeferred.promise;
    };
    Deferred.resolved = function () {
        var deferred = new Deferred();
        deferred.resolve.apply(deferred, arguments);
        return deferred.promise;
    };
    Deferred.rejected = function () {
        var deferred = new Deferred();
        deferred.reject.apply(deferred, arguments);
        return deferred.promise;
    };
    Deferred.when = function (value) {
        if (Deferred.isPromise(value)) {
            return value;
        }
        var deferred = new Deferred();
        deferred.syncModeEnabled = true;
        deferred.resolve(value);
        return deferred.promise;
    };
    Deferred.require = function (modules) {
        var deferred = new Deferred();
        window.require(modules, deferred.resolver.resolve);
        deferred.promise.abort = deferred.resolver.reject;
        return deferred.promise;
    };
    return Deferred;
});

define('er/ajax', [
    'require',
    './assert',
    './util',
    './Deferred',
    'eoo',
    'mini-event/EventTarget'
], function (require) {
    var TIMESTAMP_PARAM_KEY = '_';
    function serializeArray(prefix, array) {
        var encodedKey = prefix ? encodeURIComponent(prefix) : '';
        var encoded = [];
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            encoded[i] = this.serializeData('', item);
        }
        return encodedKey ? encodedKey + '=' + encoded.join(',') : encoded.join(',');
    }
    function serializeData(prefix, data) {
        if (arguments.length === 1) {
            data = prefix;
            prefix = '';
        }
        if (data == null) {
            data = '';
        }
        var getKey = this.serializeData.getKey;
        var encodedKey = prefix ? encodeURIComponent(prefix) : '';
        var type = Object.prototype.toString.call(data);
        switch (type) {
        case '[object Array]':
            return this.serializeArray(prefix, data);
        case '[object Object]':
            var result = [];
            for (var name in data) {
                var propertyKey = getKey(name, prefix);
                var propertyValue = this.serializeData(propertyKey, data[name]);
                result.push(propertyValue);
            }
            return result.join('&');
        default:
            return encodedKey ? encodedKey + '=' + encodeURIComponent(data) : encodeURIComponent(data);
        }
    }
    serializeData.getKey = function (propertyName, parentKey) {
        return parentKey ? parentKey + '.' + propertyName : propertyName;
    };
    var exports = {};
    exports.constructor = function () {
        this.hooks = {
            serializeData: serializeData,
            serializeArray: serializeArray
        };
        this.config = {
            cache: false,
            timeout: 0,
            charset: ''
        };
    };
    exports.request = function (options) {
        if (typeof this.hooks.beforeExecute === 'function') {
            this.hooks.beforeExecute(options);
        }
        var assert = require('./assert');
        assert.hasProperty(options, 'url', 'url property is required');
        var defaults = {
                method: 'POST',
                data: {},
                cache: this.config.cache,
                timeout: this.config.timeout,
                charset: this.config.charset
            };
        var util = require('./util');
        options = util.mix(defaults, options);
        var Deferred = require('./Deferred');
        var requesting = new Deferred();
        if (typeof this.hooks.beforeCreate === 'function') {
            var canceled = this.hooks.beforeCreate(options, requesting);
            if (canceled === true) {
                var fakeXHR = requesting.promise;
                fakeXHR.abort = function () {
                };
                fakeXHR.setRequestHeader = function () {
                };
                return fakeXHR;
            }
        }
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new window.ActiveXObject('Microsoft.XMLHTTP');
        util.mix(xhr, options.xhrFields);
        var fakeXHR = requesting.promise;
        var xhrWrapper = {
                abort: function () {
                    xhr.onreadystatechange = null;
                    try {
                        xhr.abort();
                    } catch (ex) {
                    }
                    if (!fakeXHR.status) {
                        fakeXHR.status = 0;
                    }
                    fakeXHR.readyState = xhr.readyState;
                    fakeXHR.responseText = '';
                    fakeXHR.responseXML = '';
                    requesting.reject(fakeXHR);
                },
                setRequestHeader: function (name, value) {
                    xhr.setRequestHeader(name, value);
                },
                getAllResponseHeaders: function () {
                    return xhr.getAllResponseHeaders();
                },
                getResponseHeader: function (name) {
                    return xhr.getResponseHeader(name);
                },
                getRequestOption: function (name) {
                    return options[name];
                }
            };
        util.mix(fakeXHR, xhrWrapper);
        var eventObject = {
                xhr: fakeXHR,
                options: options
            };
        fakeXHR.then(util.bind(this.fire, this, 'done', eventObject), util.bind(this.fire, this, 'fail', eventObject));
        var processRequestStatus = function () {
            if (xhr.readyState === 4) {
                var status = fakeXHR.status || xhr.status;
                if (status === 1223) {
                    status = 204;
                }
                fakeXHR.status = fakeXHR.status || status;
                fakeXHR.readyState = xhr.readyState;
                fakeXHR.responseText = xhr.responseText;
                fakeXHR.responseXML = xhr.responseXML;
                if (typeof this.hooks.afterReceive === 'function') {
                    this.hooks.afterReceive(fakeXHR, options);
                }
                if (status < 200 || status >= 300 && status !== 304) {
                    requesting.reject(fakeXHR);
                    return;
                }
                var data = xhr.responseText;
                if (options.dataType === 'json') {
                    try {
                        data = util.parseJSON(data);
                    } catch (ex) {
                        fakeXHR.error = ex;
                        requesting.reject(fakeXHR);
                        return;
                    }
                }
                if (typeof this.hooks.afterParse === 'function') {
                    try {
                        data = this.hooks.afterParse(data, fakeXHR, options);
                    } catch (ex) {
                        fakeXHR.error = ex;
                        requesting.reject(fakeXHR);
                        return;
                    }
                }
                requesting.resolve(data);
            }
        };
        xhr.onreadystatechange = util.bind(processRequestStatus, this);
        var method = options.method.toUpperCase();
        var data = {};
        if (method === 'GET') {
            util.mix(data, options.data);
        }
        if (options.cache === false) {
            data[TIMESTAMP_PARAM_KEY] = +new Date();
        }
        var query = this.hooks.serializeData('', data, 'application/x-www-form-urlencoded');
        var url = options.url;
        if (query) {
            var delimiter = url.indexOf('?') >= 0 ? '&' : '?';
            url += delimiter + query;
        }
        xhr.open(method, url, true);
        if (typeof this.hooks.beforeSend === 'function') {
            this.hooks.beforeSend(fakeXHR, options);
        }
        if (method === 'GET') {
            xhr.send();
        } else {
            var contentType = options.contentType || 'application/x-www-form-urlencoded';
            var query = this.hooks.serializeData('', options.data, contentType, fakeXHR);
            if (options.charset) {
                contentType += ';charset=' + options.charset;
            }
            xhr.setRequestHeader('Content-Type', contentType);
            xhr.send(query);
        }
        if (options.timeout > 0) {
            var notifyTimeout = function () {
                this.fire('timeout', {
                    xhr: fakeXHR,
                    options: options
                });
                fakeXHR.status = 408;
                fakeXHR.abort();
            };
            var tick = setTimeout(util.bind(notifyTimeout, this), options.timeout);
            fakeXHR.ensure(function () {
                clearTimeout(tick);
            });
        }
        return fakeXHR;
    };
    exports.get = function (url, data, cache) {
        var options = {
                method: 'GET',
                url: url,
                data: data,
                cache: cache || this.config.cache
            };
        return this.request(options);
    };
    exports.getJSON = function (url, data, cache) {
        var options = {
                method: 'GET',
                url: url,
                data: data,
                dataType: 'json',
                cache: cache || this.config.cache
            };
        return this.request(options);
    };
    exports.post = function (url, data, dataType) {
        var options = {
                method: 'POST',
                url: url,
                data: data,
                dataType: dataType || 'json'
            };
        return this.request(options);
    };
    exports.log = function (url, data) {
        var img = new Image();
        var pool = window.ER_LOG_POOL || (window.ER_LOG_POOL = {});
        var id = +new Date();
        pool[id] = img;
        img.onload = img.onerror = img.onabort = function () {
            img.onload = img.onerror = img.onabort = null;
            pool[id] = null;
            img = null;
        };
        var query = this.hooks.serializeData('', data, 'application/x-www-form-urlencoded');
        if (query) {
            var delimiter = url.indexOf('?') >= 0 ? ':' : '?';
            url += delimiter + query;
        }
        img.src = url;
    };
    var Ajax = require('eoo').create(require('mini-event/EventTarget'), exports);
    var instance = new Ajax();
    instance.Ajax = Ajax;
    return instance;
});

void function (define) {
    define('promise/util', ['require'], function (require) {
        var util = {};
        var nativeBind = Function.prototype.bind;
        if (typeof nativeBind === 'function') {
            util.bind = function (fn) {
                return nativeBind.apply(fn, [].slice.call(arguments, 1));
            };
        } else {
            util.bind = function (fn, thisObject) {
                var extraArgs = [].slice.call(arguments, 2);
                return function () {
                    var args = extraArgs.concat([].slice.call(arguments));
                    return fn.apply(thisObject, args);
                };
            };
        }
        util.isArray = function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        };
        util.getThen = function (promise) {
            return promise && (typeof promise === 'object' || typeof promise === 'function') && promise.then;
        };
        return util;
    });
}(typeof define === 'function' && define.amd ? define : function (factory) {
    module.exports = factory(require);
}, this);

void function (define) {
    define('promise/PromiseCapacity', [
        'require',
        './util',
        './setImmediate'
    ], function (require) {
        var u = require('./util');
        var PENDING = 'pending';
        var FULFILLED = 'fulfilled';
        var REJECTED = 'rejected';
        var setImmediate = require('./setImmediate');
        var syncInvoke = function (fn) {
            fn();
        };
        function PromiseCapacity(promise) {
            this.promise = promise;
            this.status = PENDING;
            this.isResolved = false;
            this.result = undefined;
            this.fulfilledCallbacks = [];
            this.rejectedCallbacks = [];
            this.syncModeEnabled = false;
            this.invoke = setImmediate;
        }
        PromiseCapacity.prototype = {
            constructor: PromiseCapacity,
            resolve: function (value) {
                if (this.status !== PENDING || this.isResolved) {
                    return;
                }
                if (value === this.promise) {
                    this.reject(new TypeError('Chaining cycle detected for promise #<Promise>'));
                    return;
                }
                try {
                    var then = u.getThen(value);
                    if (typeof then === 'function') {
                        chain(u.bind(then, value), this);
                        return;
                    }
                } catch (e) {
                    this.status === PENDING && this.reject(e);
                    return;
                }
                this.result = value;
                this.status = FULFILLED;
                exec(this);
            },
            reject: function (obj) {
                if (this.status !== PENDING || this.isResolved) {
                    return;
                }
                this.result = obj;
                this.status = REJECTED;
                exec(this);
            },
            then: function (onFulfilled, onRejected) {
                var capacity = this;
                this.syncModeEnabled = this.promise.syncModeEnabled;
                this.invoke = this.syncModeEnabled ? syncInvoke : setImmediate;
                var promise = new this.promise.constructor(function (resolve, reject) {
                        capacity.fulfilledCallbacks.push(createCallback(resolve, onFulfilled, resolve, reject));
                        capacity.rejectedCallbacks.push(createCallback(reject, onRejected, resolve, reject));
                    });
                promise.syncModeEnabled = this.syncModeEnabled;
                exec(this);
                return promise;
            }
        };
        function createCallback(method, callback, resolve, reject) {
            return function (value) {
                try {
                    if (typeof callback === 'function') {
                        value = callback(value);
                        method = resolve;
                    }
                    method(value);
                } catch (e) {
                    reject(e);
                }
            };
        }
        function chain(then, capacity) {
            capacity.isResolved = true;
            var chainedPromise = new capacity.promise.constructor(function (resolve, reject) {
                    var called = false;
                    try {
                        then(function (v) {
                            resolve(v);
                            called = true;
                        }, function (v) {
                            reject(v);
                            called = true;
                        });
                    } catch (e) {
                        !called && reject(e);
                    }
                });
            chainedPromise.then(function (v) {
                capacity.isResolved = false;
                capacity.resolve(v);
            }, function (v) {
                capacity.isResolved = false;
                capacity.reject(v);
            });
        }
        function exec(capacity) {
            if (capacity.status === PENDING) {
                return;
            }
            var callbacks = null;
            if (capacity.status === FULFILLED) {
                capacity.rejectedCallbacks = [];
                callbacks = capacity.fulfilledCallbacks;
            } else {
                capacity.fulfilledCallbacks = [];
                callbacks = capacity.rejectedCallbacks;
            }
            capacity.invoke(function () {
                var callback;
                var val = capacity.result;
                while (callback = callbacks.shift()) {
                    callback(val);
                }
            });
        }
        return PromiseCapacity;
    });
}(typeof define === 'function' && define.amd ? define : function (factory) {
    module.exports = factory(require);
}, this);

void function (define, global, undefined) {
    define('promise/Promise', [
        'require',
        './util',
        './PromiseCapacity'
    ], function (require) {
        var u = require('./util');
        var PromiseCapacity = require('./PromiseCapacity');
        function Promise(executor) {
            if (typeof executor !== 'function') {
                throw new TypeError('Promise resolver undefined is not a function');
            }
            if (!(this instanceof Promise)) {
                throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, ' + 'this object constructor cannot be called as a function.');
            }
            var capacity = new PromiseCapacity(this);
            this.then = u.bind(capacity.then, capacity);
            executor(u.bind(capacity.resolve, capacity), u.bind(capacity.reject, capacity));
        }
        Promise.prototype.then = function (onFulfilled, onReject) {
        };
        Promise.prototype['catch'] = function (onRejected) {
            return this.then(null, onRejected);
        };
        Promise.resolve = function (value) {
            return new Promise(function (resolve) {
                resolve(value);
            });
        };
        Promise.reject = function (obj) {
            return new Promise(function (resolve, reject) {
                reject(obj);
            });
        };
        Promise.all = function (promises) {
            var Promise = this;
            if (!u.isArray(promises)) {
                throw new TypeError('You must pass an array to all.');
            }
            return new Promise(function (resolve, reject) {
                var results = [];
                var remaining = promises.length;
                var promise = null;
                if (remaining === 0) {
                    resolve([]);
                }
                function resolver(index) {
                    return function (value) {
                        resolveAll(index, value);
                    };
                }
                function resolveAll(index, value) {
                    results[index] = value;
                    if (--remaining === 0) {
                        resolve(results);
                    }
                }
                for (var i = 0, len = promises.length; i < len; i++) {
                    promise = promises[i];
                    var then = u.getThen(promise);
                    if (typeof then === 'function') {
                        promise.then(resolver(i), reject);
                    } else {
                        resolveAll(i, promise);
                    }
                }
            });
        };
        Promise.race = function (promises) {
            var Promise = this;
            if (!u.isArray(promises)) {
                throw new TypeError('You must pass an array to race.');
            }
            return new Promise(function (resolve, reject) {
                for (var i = 0, len = promises.length; i < len; i++) {
                    var promise = promises[i];
                    var then = u.getThen(promise);
                    if (typeof then === 'function') {
                        then.call(promise, resolve, reject);
                    } else {
                        resolve(promise);
                    }
                }
            });
        };
        Promise.cast = function (value) {
            if (value && typeof value === 'object' && value.constructor === this) {
                return value;
            }
            return new Promise(function (resolve) {
                resolve(value);
            });
        };
        return typeof global.Promise === 'function' ? global.Promise : Promise;
    });
}(typeof define === 'function' && define.amd ? define : function (factory) {
    module.exports = factory(require);
}, this);

void function (define, global) {
    define('promise/enchance', [
        'require',
        './util'
    ], function (require) {
        var u = require('./util');
        function isPromise(obj) {
            return typeof u.getThen(obj) === 'function';
        }
        function promiseRequire(modules) {
            var promise = new this(function (resolve, reject) {
                    global.require(modules, resolve);
                    promise.abort = reject;
                });
            return promise;
        }
        function ensure(callback) {
            return this.then(callback, callback);
        }
        return function (Promise) {
            Promise.isPromise = isPromise;
            Promise.require = promiseRequire;
            Promise.prototype.ensure = ensure;
            return Promise;
        };
    });
}(typeof define === 'function' && define.amd ? define : function (factory) {
    module.exports = factory(require);
}, this);

define('promise/main', [
    'require',
    './Promise',
    './enchance'
], function (require) {
    var Promise = require('./Promise');
    var enchance = require('./enchance');
    return enchance(Promise);
});

define('promise', ['promise/main'], function ( main ) { return main; });

define('fc-core/Promise', [
    'require',
    'promise'
], function (require) {
    'use strict';
    return require('promise');
});

define('fc-core/EventTarget', [
    'require',
    'mini-event/EventTarget'
], function (require) {
    'use strict';
    return require('mini-event/EventTarget');
});

define('fc-ajax/status', ['require'], function (require) {
    var REQ_STATUS_CODE = {
            INITIALIZE: 0,
            SUCCESS: 200,
            PARTFAIL: 300,
            REDIRECT: 302,
            FAIL: 400,
            SERVER_ERROR: 500,
            PARAMETER_ERROR: 600,
            NOAUTH: 700,
            SERVER_EXCEEDED: 800,
            TIMEOUT: 900,
            CLIENT_SIDE_EXCEPTION: 910,
            REQUEST_ERROR: 920,
            UNRECOGNIZED_STATUS: 930
        };
    var REQ_STATUS_DESC = {
            INITIALIZE: 'ajax-initialize',
            SUCCESS: 'ajax-success',
            PARTFAIL: 'ajax-some-failed',
            REDIRECT: 'ajax-redirect',
            FAIL: 'ajax-fail',
            SERVER_ERROR: 'ajax-server-error',
            PARAMETER_ERROR: 'ajax-parameter-error',
            NOAUTH: 'ajax-noauth',
            SERVER_EXCEEDED: 'ajax-server-exceeded',
            TIMEOUT: 'ajax-timeout',
            CLIENT_SIDE_EXCEPTION: 'ajax-client-side-exception',
            REQUEST_ERROR: 'ajax-request-error',
            UNRECOGNIZED_STATUS: 'ajax-unrecognized-status'
        };
    for (var key in REQ_STATUS_CODE) {
        if (REQ_STATUS_CODE.hasOwnProperty(key)) {
            REQ_STATUS_DESC[REQ_STATUS_CODE[key]] = REQ_STATUS_DESC[key];
        }
    }
    return {
        REQ_CODE: REQ_STATUS_CODE,
        REQ_CODE_DESC: REQ_STATUS_DESC
    };
});

define('fc-ajax/ajax', [
    'require',
    'fc-core',
    './hooks',
    './config',
    'fc-core/Promise',
    'mini-event/EventTarget'
], function (require) {
    'use strict';
    var fc = require('fc-core');
    var hooks = require('./hooks');
    var config = require('./config');
    var Promise = require('fc-core/Promise');
    var REQID_PARAM_KEY = '_';
    var proto = {};
    proto.constructor = function () {
        this.config = config;
        this.hooks = hooks;
    };
    proto.request = function (options) {
        var me = this;
        if (typeof me.hooks.beforeExecute === 'function') {
            me.hooks.beforeExecute(options);
        }
        fc.assert.hasProperty(options, 'url', 'url property is required');
        options = fc.util.deepExtend({}, me.config, options);
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new window.ActiveXObject('Microsoft.XMLHTTP');
        var xhrWrapper = {
                setRequestHeader: function (name, value) {
                    xhr.setRequestHeader(name, value);
                },
                getAllResponseHeaders: function () {
                    return xhr.getAllResponseHeaders();
                },
                getResponseHeader: function (name) {
                    return xhr.getResponseHeader(name);
                },
                getRequestOption: function (name) {
                    return options[name];
                }
            };
        var timeoutTic = null;
        var racingPromise = new Promise(function (resolve, reject) {
                xhrWrapper.abort = function () {
                    xhr.onreadystatechange = null;
                    try {
                        xhr.abort();
                    } catch (ex) {
                    }
                    if (!fakeXHR.status) {
                        fakeXHR.status = 0;
                    }
                    fakeXHR.readyState = xhr.readyState;
                    fakeXHR.responseText = '';
                    fakeXHR.responseXML = '';
                    reject(fakeXHR);
                };
                if (options.timeout > 0) {
                    timeoutTic = setTimeout(function () {
                        fakeXHR.status = 408;
                        fakeXHR.abort();
                    }, options.timeout);
                }
            });
        var xhrPromise = new Promise(function (resolve, reject) {
                if (typeof me.hooks.beforeCreate === 'function') {
                    var canceled = me.hooks.beforeCreate(options, resolve, reject);
                    if (canceled === true) {
                        return;
                    }
                }
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        var status = fakeXHR.status || xhr.status;
                        if (status === 1223) {
                            status = 204;
                        }
                        fakeXHR.status = fakeXHR.status || status;
                        fakeXHR.readyState = xhr.readyState;
                        fakeXHR.responseText = xhr.responseText;
                        fakeXHR.responseXML = xhr.responseXML;
                        if (typeof me.hooks.afterReceive === 'function') {
                            me.hooks.afterReceive(fakeXHR, options);
                        }
                        if (status < 200 || status >= 300 && status !== 304) {
                            reject(fakeXHR);
                            return;
                        }
                        var data = xhr.responseText;
                        if (options.dataType === 'json') {
                            try {
                                data = fc.util.parseJSON(data);
                            } catch (ex) {
                                fakeXHR.error = ex;
                                reject(fakeXHR);
                                return;
                            }
                        }
                        if (typeof me.hooks.afterParse === 'function') {
                            try {
                                data = me.hooks.afterParse(data, fakeXHR, options);
                            } catch (ex) {
                                fakeXHR.error = ex;
                                reject(fakeXHR);
                                return;
                            }
                        }
                        resolve(data);
                    }
                };
                var method = options.method.toUpperCase();
                var data = fc.util.deepExtend({}, options.urlParam);
                if (method === 'GET') {
                    fc.util.deepExtend(data, options.data);
                }
                if (options.cache === false) {
                    data[REQID_PARAM_KEY] = fc.util.uid();
                }
                var query = me.hooks.serializeData('', data, 'application/x-www-form-urlencoded');
                var url = options.url;
                if (query) {
                    var delimiter = url.indexOf('?') >= 0 ? '&' : '?';
                    url += delimiter + query;
                }
                xhr.open(method, url, true);
                if (typeof me.hooks.beforeSend === 'function') {
                    me.hooks.beforeSend(xhrWrapper, options);
                }
                if (method === 'GET') {
                    xhr.send();
                } else {
                    var contentType = options.contentType || 'application/x-www-form-urlencoded';
                    var query = me.hooks.serializeData('', options.data, contentType, xhrWrapper);
                    if (options.charset) {
                        contentType += ';charset=' + options.charset;
                    }
                    xhr.setRequestHeader('Content-Type', contentType);
                    xhr.send(query);
                }
            });
        var fakeXHR = Promise.race([
                xhrPromise,
                racingPromise
            ]);
        fc.util.deepExtend(fakeXHR, xhrWrapper);
        fakeXHR.ensure(function () {
            clearTimeout(timeoutTic);
        });
        return fakeXHR;
    };
    proto.get = function (url, data, cache) {
        var options = {
                method: 'GET',
                url: url,
                data: data,
                cache: cache || this.config.cache
            };
        return this.request(options);
    };
    proto.getJSON = function (url, data, cache) {
        var options = {
                method: 'GET',
                url: url,
                data: data,
                dataType: 'json',
                cache: cache || this.config.cache
            };
        return this.request(options);
    };
    proto.post = function (url, data, dataType) {
        var options = {
                method: 'POST',
                url: url,
                data: data,
                dataType: dataType || 'json'
            };
        return this.request(options);
    };
    var Ajax = fc.oo.derive(require('mini-event/EventTarget'), proto);
    var instance = new Ajax();
    instance.Ajax = Ajax;
    return instance;
});

define('fc-ajax/AjaxRequest', [
    'require',
    'underscore',
    'fc-core',
    'er/ajax',
    'fc-core/Promise',
    'fc-core/EventTarget',
    './hooks',
    './status',
    './ajax'
], function (require) {
    var _ = require('underscore');
    var fc = require('fc-core');
    var ajax = require('er/ajax');
    var Promise = require('fc-core/Promise');
    var EventTarget = require('fc-core/EventTarget');
    var hooks = require('./hooks');
    var status = require('./status');
    var proto = {};
    proto.constructor = function (option) {
        fc.assert.has(option);
        var me = this;
        me.option = option;
    };
    proto.request = function () {
        var me = this;
        hooks.beforeEachRequest.call(me);
        me.promise = new Promise(function (resolve, reject) {
            me.resolve = resolve;
            me.reject = reject;
            var requesting = require('./ajax').request(me.option);
            requesting.then(_.bind(me.processXhrSuccess, me), _.bind(me.processXhrFailure, me)).catch(_.bind(me.processXhrException, me)).ensure(_.bind(hooks.afterEachRequest, me));
        });
        return me.promise;
    };
    proto.processXhrSuccess = function (result) {
        var me = this;
        try {
            if (_.isFunction(hooks.businessCheck)) {
                result = hooks.businessCheck.call(me, result);
            }
            if (Promise.isPromise(result)) {
                return result.then(function (response) {
                    hooks.eachSuccess.call(me, response);
                    me.resolve(response);
                }, function (response) {
                    return Promise.reject(response);
                });
            }
            hooks.eachSuccess.call(me, result);
            me.resolve(result);
        } catch (e) {
            return Promise.reject({
                status: status.REQ_CODE.CLIENT_SIDE_EXCEPTION,
                error: e,
                response: result
            });
        }
    };
    proto.processXhrFailure = function (result) {
        if (result.status == 408) {
            return Promise.reject({
                status: status.REQ_CODE.TIMEOUT,
                desc: status.REQ_CODE_DESC.TIMEOUT,
                response: null
            });
        }
        return Promise.reject({
            httpStatus: result.status,
            status: status.REQ_CODE.REQUEST_ERROR,
            desc: status.REQ_CODE_DESC.REQUEST_ERROR,
            response: null
        });
    };
    proto.processXhrException = function (result) {
        if (result && result.error instanceof Error) {
            this.fire('error', result);
        }
        hooks.eachFailure.call(this, result);
        if (result.status) {
            this.reject(result);
            return;
        }
        this.reject({
            status: status.REQ_CODE.CLIENT_SIDE_EXCEPTION,
            desc: status.REQ_CODE_DESC.CLIENT_SIDE_EXCEPTION,
            response: result
        });
    };
    var AjaxRequest = fc.oo.derive(EventTarget, proto);
    return AjaxRequest;
});

define('fc-ajax/request', [
    'require',
    'underscore',
    'fc-core',
    './hooks',
    './globalData',
    './config',
    './AjaxRequest'
], function (require) {
    var _ = require('underscore');
    var fc = require('fc-core');
    var hooks = require('./hooks');
    var globalData = require('./globalData');
    var config = require('./config');
    var AjaxRequest = require('./AjaxRequest');
    function request(path, data, options) {
        var ajaxOption = adjustOption.apply(this, arguments);
        var req = new AjaxRequest(ajaxOption);
        req.on('error', fc.util.processError);
        return req.request();
    }
    function adjustOption(path, data, options) {
        if (_.isObject(path)) {
            options = data;
            data = path;
            path = data.path;
            delete data.path;
        }
        var ajaxOption = {
                url: config.url,
                urlParam: { path: path }
            };
        _.extend(ajaxOption, options);
        ajaxOption.cache = true;
        var reqId = fc.util.uid();
        ajaxOption.urlParam.reqId = reqId;
        ajaxOption.data = fc.util.deepExtend({}, globalData, {
            reqId: reqId,
            path: path
        });
        if (!ajaxOption.data.eventId) {
            ajaxOption.data.eventId = fc.util.guid();
        }
        ajaxOption.data.params = JSON.stringify(data);
        return ajaxOption;
    }
    return request;
});

define('fc-ajax/main', [
    'require',
    './request'
], function (require) {
    'use strict';
    var ajax = {
            version: '0.0.1-alpha.2',
            request: require('./request')
        };
    return ajax;
});

define('fc-ajax', ['fc-ajax/main'], function ( main ) { return main; });

define('er/URL', [
    'require',
    './util',
    'eoo'
], function (require) {
    var util = require('./util');
    var exports = {};
    exports.constructor = function (path, search, searchSeparator) {
        path = path || '/';
        search = search || '';
        searchSeparator = searchSeparator || '~';
        this.toString = function () {
            return search ? path + searchSeparator + search : path;
        };
        this.getPath = function () {
            return path;
        };
        this.getSearch = function () {
            return search;
        };
        var query = null;
        this.getQuery = function (key) {
            if (!query) {
                query = URL.parseQuery(search);
            }
            return key ? query[key] : util.mix({}, query);
        };
    };
    exports.compare = function (another) {
        if (typeof another === 'string') {
            another = URL.parse(another);
        }
        var result = {};
        var thisPath = this.getPath();
        var anotherPath = another.getPath();
        if (thisPath === anotherPath) {
            result.path = false;
        } else {
            result.path = {
                key: 'path',
                self: thisPath,
                other: anotherPath
            };
        }
        var thisQuery = this.getQuery();
        var anotherQuery = another.getQuery();
        var queryDifferenceIndex = {};
        var queryDifference = [];
        var hasQueryDifference = false;
        for (var key in thisQuery) {
            if (thisQuery.hasOwnProperty(key)) {
                var thisValue = thisQuery[key];
                var anotherValue = anotherQuery[key];
                if (thisValue !== anotherValue) {
                    hasQueryDifference = true;
                    var diff = {
                            key: key,
                            self: thisValue,
                            other: anotherValue
                        };
                    queryDifference.push(diff);
                    queryDifferenceIndex[key] = diff;
                }
            }
        }
        for (var key in anotherQuery) {
            if (anotherQuery.hasOwnProperty(key) && !thisQuery.hasOwnProperty(key)) {
                hasQueryDifference = true;
                var diff = {
                        key: key,
                        self: undefined,
                        other: anotherQuery[key]
                    };
                queryDifference.push(diff);
                queryDifferenceIndex[key] = diff;
            }
        }
        result.queryDifference = queryDifference;
        result.query = hasQueryDifference ? queryDifferenceIndex : false;
        return result;
    };
    var URL = require('eoo').create(exports);
    URL.parse = function (url, options) {
        var defaults = { querySeparator: '~' };
        options = util.mix(defaults, options);
        var querySeparatorIndex = url.indexOf(options.querySeparator);
        if (querySeparatorIndex >= 0) {
            return new URL(url.slice(0, querySeparatorIndex), url.slice(querySeparatorIndex + 1), options.querySeparator);
        } else {
            return new URL(url, '', options.querySeparator);
        }
    };
    URL.withQuery = function (path, query, options) {
        path = path + '';
        var defaults = { querySeparator: '~' };
        options = util.mix(defaults, options);
        var separator = path.indexOf(options.querySeparator) < 0 ? options.querySeparator : '&';
        var search = URL.serialize(query);
        var url = path + separator + search;
        return URL.parse(url, options);
    };
    URL.parseQuery = function (str) {
        var pairs = str.split('&');
        var query = {};
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            if (!pair) {
                continue;
            }
            var index = pair.indexOf('=');
            var key = index < 0 ? decodeURIComponent(pair) : decodeURIComponent(pair.slice(0, index));
            var value = index < 0 ? true : decodeURIComponent(pair.slice(index + 1));
            if (query.hasOwnProperty(key)) {
                if (value !== true) {
                    query[key] = [].concat(query[key], value);
                }
            } else {
                query[key] = value;
            }
        }
        return query;
    };
    URL.serialize = function (query) {
        if (!query) {
            return '';
        }
        var search = '';
        for (var key in query) {
            if (query.hasOwnProperty(key)) {
                var value = query[key];
                search += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
            }
        }
        return search.slice(1);
    };
    URL.empty = new URL();
    return URL;
});

define('er/config', [], {
    mainElement: 'main',
    indexURL: '/',
    systemName: '',
    noAuthorityLocation: '/401',
    notFoundLocation: '/404'
});

define('er/events', [
    'require',
    'eoo',
    'mini-event/EventTarget'
], function (require) {
    var exports = {};
    exports.notifyError = function (error) {
        if (typeof error === 'string') {
            error = new Error(error);
        }
        this.fire('error', { error: error });
        return error;
    };
    var EventBus = require('eoo').create(require('mini-event/EventTarget'), exports);
    var instance = new EventBus();
    instance.EventBus = EventBus;
    return instance;
});

define('er/locator', [
    'require',
    './config',
    './events',
    'mini-event/EventTarget'
], function (require) {
    var locator = {};
    var currentLocation = '';
    function getLocation() {
        var index = location.href.indexOf('#');
        var url = index === -1 ? '' : location.href.slice(index);
        return url;
    }
    function forwardHash() {
        var url = getLocation();
        locator.redirect(url);
    }
    var rollTimer = 0;
    var startupTimer = 1;
    function start(firstTime) {
        if (window.addEventListener) {
            window.addEventListener('hashchange', forwardHash, false);
        } else if ('onhashchange' in window && document.documentMode > 7) {
            window.attachEvent('onhashchange', forwardHash);
        } else {
            rollTimer = setInterval(forwardHash, 100);
        }
        if (firstTime) {
            startupTimer = setTimeout(forwardHash, 0);
        }
    }
    function stop() {
        if (rollTimer) {
            clearInterval(rollTimer);
            rollTimer = null;
        }
        if (startupTimer) {
            clearTimeout(startupTimer);
            startupTimer = null;
        }
        if (window.removeEventListener) {
            window.removeEventListener('hashchange', forwardHash, false);
        } else if ('onhashchange' in window && document.documentMode > 7) {
            window.detachEvent('onhashchange', forwardHash);
        }
    }
    function updateURL(url, options) {
        var changed = currentLocation !== url;
        if (changed && getLocation() !== url) {
            if (options.silent) {
                stop();
                location.hash = url;
                start(false);
            } else {
                location.hash = url;
            }
        }
        currentLocation = url;
        return changed;
    }
    locator.start = function () {
        start(true);
    };
    locator.stop = stop;
    locator.resolveURL = function (url) {
        url = url + '';
        if (url.indexOf('#') === 0) {
            url = url.slice(1);
        }
        if (!url || url === '/') {
            url = require('./config').indexURL;
        }
        return url;
    };
    locator.redirect = function (url, options) {
        options = options || {};
        url = locator.resolveURL(url);
        var referrer = currentLocation;
        var isLocationChanged = updateURL(url, options);
        var shouldPerformRedirect = isLocationChanged || options.force;
        if (shouldPerformRedirect) {
            if (!options.silent) {
                locator.fire('redirect', {
                    url: url,
                    referrer: referrer
                });
            }
            require('./events').fire('redirect', {
                url: url,
                referrer: referrer
            });
        }
        return shouldPerformRedirect;
    };
    locator.reload = function () {
        if (currentLocation) {
            locator.redirect(currentLocation, { force: true });
        }
    };
    require('mini-event/EventTarget').enable(locator);
    return locator;
});

define('er/router', [
    'require',
    './URL',
    'eoo',
    'mini-event/EventTarget',
    './locator',
    './events'
], function (require) {
    var exports = {};
    exports.constructor = function () {
        this.routes = [];
        this.backup = null;
    };
    function executeRoute(e) {
        var url = require('./URL').parse(e.url);
        var path = url.getPath();
        for (var i = 0; i < this.routes.length; i++) {
            var route = this.routes[i];
            if (route.rule instanceof RegExp && route.rule.test(path) || route.rule === path) {
                route.handler.call(this, url);
                return;
            }
        }
        if (this.backup) {
            this.backup(url);
        }
        this.getEventBus().fire('route', {
            url: url,
            router: this
        });
    }
    exports.add = function (rule, handler) {
        this.routes.push({
            rule: rule,
            handler: handler
        });
    };
    exports.setBackup = function (handler) {
        this.backup = handler;
    };
    exports.getLocator = function () {
        return this.locator;
    };
    exports.setLocator = function (locator) {
        this.locator = locator;
    };
    exports.getEventBus = function () {
        return this.eventBus;
    };
    exports.setEventBus = function (eventBus) {
        this.eventBus = eventBus;
    };
    exports.start = function () {
        this.getLocator().on('redirect', executeRoute, this);
    };
    var Router = require('eoo').create(require('mini-event/EventTarget'), exports);
    var instance = new Router();
    instance.setLocator(require('./locator'));
    instance.setEventBus(require('./events'));
    instance.Router = Router;
    return instance;
});

define('er/permission', [], function () {
    var authorities = {};
    var permssion = {
            add: function (data) {
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        var value = data[key];
                        if (typeof value === 'object') {
                            this.add(value);
                        } else {
                            authorities[key] = value;
                        }
                    }
                }
            },
            isAllow: function (name) {
                return !!authorities[name];
            }
        };
    return permssion;
});

define('er/controller', [
    'require',
    './Deferred',
    './URL',
    './config',
    './util',
    './assert',
    'mini-event/EventTarget',
    'eoo',
    './locator',
    './router',
    './events',
    './permission'
], function (require) {
    var Deferred = require('./Deferred');
    var URL = require('./URL');
    var config = require('./config');
    var util = require('./util');
    var assert = require('./assert');
    var exports = {};
    exports.constructor = function () {
        this.actionPathMapping = {};
        this.childActionMapping = {};
        this.currentURL = null;
        this.currentAction = null;
        this.globalActionLoader = null;
        this.childActionLoaders = {};
    };
    exports.registerAction = function (actionConfigs) {
        if (!actionConfigs.hasOwnProperty('length')) {
            actionConfigs = [actionConfigs];
        }
        for (var i = 0; i < actionConfigs.length; i++) {
            var actionConfig = actionConfigs[i];
            assert.hasProperty(actionConfig, 'path', 'action config should contains a "path" property');
            this.actionPathMapping[actionConfig.path] = actionConfig;
        }
    };
    exports.getDefaultTitle = function () {
        return this.defaultTitle;
    };
    exports.setDefaultTitle = function (title) {
        this.defaultTitle = title;
    };
    exports.getRouter = function () {
        return this.router;
    };
    exports.setRouter = function (router) {
        this.router = router;
    };
    exports.getLocator = function () {
        return this.locator;
    };
    exports.setLocator = function (locator) {
        this.locator = locator;
    };
    exports.getEventBus = function () {
        return this.eventBus;
    };
    exports.setEventBus = function (eventBus) {
        this.eventBus = eventBus;
    };
    exports.getPermissionProvider = function () {
        return this.permissionProvider;
    };
    exports.setPermissionProvider = function (permissionProvider) {
        this.permissionProvider = permissionProvider;
    };
    exports.getMainContainer = function () {
        return this.mainContainer || config.mainElement;
    };
    exports.setMainContainer = function (mainContainer) {
        this.mainContainer = mainContainer;
    };
    exports.getNoAuthorityLocation = function () {
        return this.noAuthorityLocation || config.noAuthorityLocation;
    };
    exports.setNoAuthorityLocation = function (noAuthorityLocation) {
        this.noAuthorityLocation = noAuthorityLocation;
    };
    exports.getNotFoundLocation = function () {
        return this.notFoundLocation || config.notFoundLocation;
    };
    exports.setNotFoundLocation = function (notFoundLocation) {
        this.notFoundLocation = notFoundLocation;
    };
    exports.start = function () {
        if (!this.getDefaultTitle()) {
            this.setDefaultTitle(config.systemName || document.title);
        }
        this.getRouter().setBackup(util.bind(this.renderAction, this));
    };
    exports.findActionConfig = function (actionContext) {
        var path = actionContext.url.getPath();
        var actionConfig = this.actionPathMapping[path];
        return actionConfig;
    };
    exports.resolveActionConfig = function (actionConfig, actionContext) {
        return actionConfig;
    };
    exports.checkAuthority = function (actionConfig, actionContext) {
        var authority = actionConfig.authority;
        if (!authority) {
            return true;
        }
        var permissionProvider = this.getPermissionProvider();
        if (typeof authority === 'function') {
            return authority(actionContext, actionConfig, permissionProvider);
        }
        if (typeof authority === 'string') {
            authority = authority.split('|');
        }
        for (var i = 0; i < authority.length; i++) {
            if (permissionProvider.isAllow(util.trim(authority[i]))) {
                return true;
            }
        }
        return false;
    };
    exports.findEligibleActionConfig = function (actionContext) {
        var actionConfig = this.findActionConfig(actionContext);
        if (actionConfig && actionConfig.movedTo) {
            this.getEventBus().fire('actionmoved', {
                controller: this,
                url: actionContext.url,
                config: actionConfig,
                movedTo: actionConfig.movedTo
            });
            actionContext.originalURL = actionContext.url;
            actionContext.url = URL.parse(actionConfig.movedTo);
            return this.findEligibleActionConfig(actionContext);
        }
        if (actionConfig && (actionConfig.childActionOnly && !actionContext.isChildAction)) {
            actionConfig = null;
        }
        if (!actionConfig) {
            this.getEventBus().fire('actionnotfound', util.mix({
                controller: this,
                failType: 'NotFound',
                reason: 'Not found'
            }, actionContext));
            actionContext.originalURL = actionContext.url;
            actionContext.url = URL.parse(this.getNotFoundLocation());
            if (!this.actionPathMapping[actionContext.url.getPath()]) {
                return null;
            }
            return this.findEligibleActionConfig(actionContext);
        }
        var hasAuthority = this.checkAuthority(actionConfig, actionContext);
        if (!hasAuthority) {
            this.getEventBus().fire('permissiondenied', util.mix({
                controller: this,
                failType: 'PermissionDenied',
                reason: 'Permission denied',
                config: actionConfig
            }, actionContext));
            var location = actionConfig.noAuthorityLocation || this.getNoAuthorityLocation();
            actionContext.originalURL = actionContext.url;
            actionContext.url = URL.parse(location);
            return this.findEligibleActionConfig(actionContext);
        }
        return actionConfig;
    };
    exports.loadAction = function (actionContext) {
        var actionConfig = this.findEligibleActionConfig(actionContext);
        actionConfig = this.resolveActionConfig(actionConfig, actionContext);
        if (!actionConfig) {
            var failed = new Deferred();
            failed.syncModeEnabled = false;
            failed.reject('no action configured for url ' + actionContext.url.getPath());
            return failed.promise;
        }
        if (actionConfig.title) {
            actionContext.title = actionConfig.title;
            actionContext.args.title = actionConfig.title;
        }
        if (actionConfig.documentTitle) {
            actionContext.documentTitle = actionConfig.documentTitle;
            actionContext.args.documentTitle = actionConfig.documentTitle;
        }
        if (actionConfig.args) {
            for (var name in actionConfig.args) {
                if (actionConfig.args.hasOwnProperty(name)) {
                    if (!actionContext.args.hasOwnProperty(name)) {
                        actionContext.args[name] = actionConfig.args[name];
                    }
                    if (!actionContext.hasOwnProperty(name)) {
                        actionContext[name] = actionConfig.args[name];
                    }
                }
            }
        }
        var loading = new Deferred();
        loading.syncModeEnabled = false;
        var loader = loading.promise;
        var aborted = false;
        var abort = function () {
            if (!aborted) {
                aborted = true;
                this.getEventBus().fire('actionabort', util.mix({ controller: this }, actionContext));
            }
        };
        loader.abort = util.bind(abort, this);
        if (!actionContext.isChildAction) {
            this.currentURL = actionContext.url;
        }
        var callback = function (SpecificAction) {
            if (aborted) {
                return;
            }
            if (!SpecificAction) {
                var reason = 'No action implement for ' + actionConfig.type;
                var error = util.mix({
                        controller: this,
                        failType: 'NoModule',
                        config: actionConfig,
                        reason: reason
                    }, actionContext);
                this.getEventBus().fire('actionfail', error);
                this.getEventBus().notifyError(error);
                loading.reject(reason);
                return;
            }
            this.getEventBus().fire('actionloaded', {
                controller: this,
                url: actionContext.url,
                config: actionConfig,
                action: SpecificAction
            });
            if (typeof SpecificAction === 'function') {
                loading.resolve(new SpecificAction(), actionContext);
            } else if (typeof SpecificAction.createRuntimeAction === 'function') {
                var resolveActionInstance = function (action) {
                    if (!action) {
                        var reason = 'Action factory returns non-action';
                        var error = util.mix({
                                controller: this,
                                failType: 'InvalidFactory',
                                config: actionConfig,
                                reason: reason,
                                action: action
                            }, actionContext);
                        this.getEventBus().fire('actionfail', error);
                        this.getEventBus().notifyError(error);
                        loading.reject(reason);
                    } else {
                        loading.resolve(action, actionContext);
                    }
                };
                resolveActionInstance = util.bind(resolveActionInstance, this);
                var actionFactoryProduct = SpecificAction.createRuntimeAction(actionContext);
                Deferred.when(actionFactoryProduct).then(resolveActionInstance);
            } else {
                loading.resolve(SpecificAction, actionContext);
            }
        };
        callback = util.bind(callback, this);
        if (typeof actionConfig.type === 'string') {
            window.require([actionConfig.type], callback);
        } else {
            callback(actionConfig.type);
        }
        return loader;
    };
    exports.enterAction = function (action, actionContext) {
        if (!actionContext.isChildAction) {
            if (actionContext.url !== this.currentURL) {
                return;
            }
            if (this.currentAction) {
                this.getEventBus().fire('leaveaction', {
                    controller: this,
                    action: this.currentAction,
                    to: util.mix({}, actionContext)
                });
                if (typeof this.currentAction.leave === 'function') {
                    this.currentAction.leave();
                }
            }
            this.currentAction = action;
            document.title = actionContext.title || actionContext.documentTitle || this.getDefaultTitle();
        }
        this.getEventBus().fire('enteraction', util.mix({
            controller: this,
            action: action
        }, actionContext));
        var notifyEnterComplete = function () {
            this.getEventBus().fire('enteractioncomplete', util.mix({
                controller: this,
                action: action
            }, actionContext));
        };
        notifyEnterComplete = util.bind(notifyEnterComplete, this);
        var notifyEnterFail = function (reason) {
            var message = '';
            if (!reason) {
                message = 'Invoke action.enter() causes error';
            } else if (reason.message) {
                message = reason.message;
                if (reason.stack) {
                    message += '\n' + reason.stack;
                }
            } else if (window.JSON && typeof JSON.stringify === 'function') {
                try {
                    message = JSON.stringify(reason);
                } catch (parseJSONError) {
                    message = reason;
                }
            } else {
                message = reason;
            }
            var error = util.mix({
                    failType: 'EnterFail',
                    reason: message
                }, actionContext);
            this.getEventBus().fire('enteractionfail', error);
            this.getEventBus().notifyError(error);
        };
        notifyEnterFail = util.bind(notifyEnterFail, this);
        var entering = action.enter(actionContext);
        entering.then(notifyEnterComplete, notifyEnterFail);
        return entering;
    };
    exports.forward = function (url, container, options, isChildAction) {
        var actionContext = {
                url: url,
                container: container,
                isChildAction: !!isChildAction
            };
        if (isChildAction) {
            var referrerInfo = this.childActionMapping[container];
            actionContext.referrer = referrerInfo ? referrerInfo.url : null;
        } else {
            actionContext.referrer = this.currentURL;
        }
        util.mix(actionContext, options);
        actionContext.args = util.mix({}, actionContext);
        util.mix(actionContext.args, url.getQuery());
        this.getEventBus().fire('forwardaction', util.mix({ controller: this }, actionContext));
        var loader = this.loadAction(actionContext);
        assert.has(loader, 'loadAction should always return a Promise');
        return loader;
    };
    exports.renderAction = function (url) {
        if (typeof url === 'string') {
            url = URL.parse(url);
        }
        if (this.globalActionLoader && typeof this.globalActionLoader.abort === 'function') {
            this.globalActionLoader.abort();
        }
        if (this.currentAction && typeof this.currentAction.filterRedirect === 'function' && this.currentAction.filterRedirect(url) === false) {
            return Deferred.rejected('Redirect aborted by previous action');
        }
        this.globalActionLoader = this.forward(url, this.getMainContainer(), null, false);
        var events = this.getEventBus();
        return this.globalActionLoader.then(util.bind(this.enterAction, this)).fail(util.bind(events.notifyError, events));
    };
    function removeChildAction(controller, container, targetContext) {
        var info = controller.childActionMapping[container.id];
        if (!info) {
            return;
        }
        controller.childActionMapping[container.id] = undefined;
        if (info.hijack) {
            if (container.removeEventListener) {
                container.removeEventListener('click', info.hijack, false);
            } else {
                container.detachEvent('onclick', info.hijack);
            }
        }
        if (info.action) {
            if (!targetContext) {
                targetContext = {
                    url: null,
                    referrer: info.url,
                    container: container.id,
                    isChildAction: true
                };
            }
            controller.getEventBus().fire('leaveaction', {
                controller: controller,
                action: info.action,
                to: targetContext
            });
            if (typeof info.action.leave === 'function') {
                info.action.leave();
            }
        }
    }
    function addChildAction(controller, container, action, hijack, context) {
        removeChildAction(controller, container, context);
        if (container.addEventListener) {
            container.addEventListener('click', hijack, false);
        } else {
            container.attachEvent('onclick', hijack);
        }
        var info = {
                url: context.url,
                container: container.id,
                action: action,
                hijack: hijack
            };
        controller.childActionMapping[container.id] = info;
        var EventTarget = require('mini-event/EventTarget');
        if (action instanceof EventTarget) {
            action.on('leave', function () {
                removeChildAction(controller, container);
            });
        }
    }
    exports.enterChildAction = function (action, actionContext) {
        this.childActionLoaders[actionContext.container] = null;
        var container = document.getElementById(actionContext.container);
        if (!container) {
            return;
        }
        var locator = this.getLocator();
        var currentController = this;
        function redirect(url, options, extra) {
            options = options || {};
            var url = locator.resolveURL(url, options);
            if (options.global) {
                var container = document.getElementById(actionContext.container);
                var globalRedirectPerformed = locator.redirect(url, options);
                if (globalRedirectPerformed && container) {
                    removeChildAction(currentController, container);
                }
                return globalRedirectPerformed;
            }
            var childActionInfo = currentController.childActionMapping[actionContext.container];
            var changed = url.toString() !== childActionInfo.url.toString();
            var shouldPerformRedirect = changed || options.force;
            if (shouldPerformRedirect) {
                if (options.silent) {
                    childActionInfo.url = url;
                } else {
                    currentController.renderChildAction(url, childActionInfo.container, extra);
                }
            }
            return shouldPerformRedirect;
        }
        function isChildActionRedirected(e) {
            if (e.isChildActionRedirected) {
                return true;
            }
            var innermostContainer = e.target || e.srcElement;
            while (innermostContainer) {
                if (innermostContainer.id && currentController.childActionMapping[innermostContainer.id]) {
                    break;
                }
                innermostContainer = innermostContainer.parentNode;
            }
            if (innermostContainer.id !== actionContext.container) {
                e.isChildActionRedirected = true;
                return true;
            }
            return false;
        }
        function hijack(e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (target.nodeName.toLowerCase() !== 'a') {
                return;
            }
            var href = target.getAttribute('href', 2) || '';
            if (href.charAt(0) !== '#') {
                return;
            }
            if (isChildActionRedirected(e)) {
                return;
            }
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            var url = href.substring(1);
            var redirectAttributes = (target.getAttribute('data-redirect') || '').split(/[,\s]/);
            var redirectOptions = {};
            for (var i = 0; i < redirectAttributes.length; i++) {
                var redirectAttributeName = util.trim(redirectAttributes[i]);
                redirectOptions[redirectAttributeName] = true;
            }
            redirect(url, redirectOptions);
        }
        action.redirect = redirect;
        action.reload = function (extra) {
            this.redirect(actionContext.url, { force: true }, extra);
        };
        action.back = function (defaultURL, extra) {
            var referrer = this.context && this.context.referrer;
            var url = referrer || defaultURL;
            this.redirect(url, null, extra);
        };
        addChildAction(this, container, action, hijack, actionContext);
        return this.enterAction(action, actionContext);
    };
    exports.renderChildAction = function (url, container, options) {
        assert.has(container);
        if (typeof url === 'string') {
            url = URL.parse(url);
        }
        var previousLoader = this.childActionLoaders[container];
        if (previousLoader && typeof previousLoader.abort === 'function') {
            previousLoader.abort();
        }
        var actionInfo = this.childActionMapping[container];
        var previousAction = actionInfo && actionInfo.action;
        if (previousAction && typeof previousAction.filterRedirect === 'function' && previousAction.filterRedirect(url) === false) {
            return Deferred.rejected('Redirect aborted by previous action');
        }
        var loader = this.forward(url, container, options, true);
        var events = this.getEventBus();
        var loadingChildAction = loader.then(util.bind(this.enterChildAction, this)).fail(util.bind(events.notifyError, events));
        loadingChildAction.abort = loader.abort;
        this.childActionLoaders[container] = loadingChildAction;
        return loadingChildAction;
    };
    var Controller = require('eoo').create(require('mini-event/EventTarget'), exports);
    var instance = new Controller();
    instance.setLocator(require('./locator'));
    instance.setRouter(require('./router'));
    instance.setEventBus(require('./events'));
    instance.setPermissionProvider(require('./permission'));
    instance.Controller = Controller;
    return instance;
});

define('er/main', [
    'require',
    './controller',
    './router',
    './locator'
], function (require) {
    var main = {
            version: '3.1.0-beta.5',
            start: function () {
                require('./controller').start();
                require('./router').start();
                require('./locator').start();
            }
        };
    return main;
});

define('er', ['er/main'], function ( main ) { return main; });

define('entry/index/actionConf', ['require'], function (require) {
    var confList = [{
                path: '/entry/index',
                type: 'entry/index/Action'
            }];
    return confList;
});

define('entry/actionConf', [
    'require',
    './index/actionConf'
], function (require) {
    var list = [require('./index/actionConf')];
    return list;
});

define('module/materialList/actionConf', ['require'], function (require) {
    var confList = [{
                path: '/module/materialList',
                type: 'module/materialList/Action'
            }];
    return confList;
});

define('module/actionConf', [
    'require',
    './materialList/actionConf'
], function (require) {
    var list = [require('./materialList/actionConf')];
    return list;
});

define('actionConf', [
    'require',
    'entry/actionConf',
    'module/actionConf'
], function (require) {
    var list = [
            require('entry/actionConf'),
            require('module/actionConf')
        ];
    return list;
});

define('fc-core/browser', ['require'], function (require) {
    var clientInfo = {};
    var UNKNOWN = 'other';
    var browserData = {};
    function parseUserAgent(rawUa) {
        var version = rawUa.match(/(IE|Firefox|Opera|Chrome|Safari)[ \/](\d+(\.\d+)?)/i);
        if (version && version[0]) {
            return version[0];
        }
        return UNKNOWN;
    }
    function isIe(rawUa) {
        return rawUa.indexOf('IE') !== -1;
    }
    function parseIeShell(rawUa) {
        if (isIe(rawUa)) {
            var shell = rawUa.slice(rawUa.lastIndexOf(';') + 2, rawUa.length - 1);
            return /Trident|Windows NT|\.NET/.test(shell) ? 'IE' : shell;
        }
        return 'null';
    }
    function parseOs(rawUa) {
        var result = rawUa.match(/(windows nt|macintosh|solaris|linux)/i);
        return result ? result[1] : UNKNOWN;
    }
    function parseClientResolution() {
        var format = function (w, h) {
            return w + ',' + h;
        };
        if (window.innerHeight) {
            return format(window.innerWidth, window.innerHeight);
        } else if (document.documentElement && document.documentElement.clientHeight) {
            return format(document.documentElement.clientWidth, document.documentElement.clientHeight);
        }
        return format(document.documentElement.clientWidth, document.documentElement.clientHeight);
    }
    function parseFlashVersion(navigator) {
        var f = 'ShockwaveFlash.ShockwaveFlash';
        var fla;
        if (navigator.plugins && navigator.mimeTypes.length) {
            fla = navigator.plugins['Shockwave Flash'];
            if (fla && fla.description) {
                return +fla.description.replace(/[^\d\.]/g, '').split('.')[0];
            }
        } else if (navigator.userAgent.toLowerCase().indexOf('ie') >= 0) {
            var A = ActiveXObject;
            fla = null;
            try {
                fla = new A(f + '.7');
            } catch (e) {
                try {
                    fla = new A(f + '.6');
                    fla.AllowScriptAccess = 'always';
                    return 6;
                } catch (ex) {
                }
                try {
                    fla = new A(f);
                } catch (ex) {
                }
            }
            if (fla) {
                try {
                    var toReturn = fla.GetVariable;
                    toReturn = toReturn('$version').split(' ')[1].split(',')[0];
                    return toReturn;
                } catch (e) {
                }
            }
        }
        return 0;
    }
    function initBrowserData(navigator, screen, history) {
        var rawUa = navigator.userAgent;
        var key = clientInfo.KEY;
        browserData[key.USER_AGENT] = parseUserAgent(rawUa);
        browserData[key.IE_SHELL] = parseIeShell(rawUa);
        browserData[key.OS] = parseOs(rawUa);
        browserData[key.PLATFORM] = navigator.platform;
        browserData[key.SCREEN_RESOLUTION] = screen.width + ',' + screen.height;
        browserData[key.CLIENT_RESOLUTION] = parseClientResolution();
        browserData[key.COLOR_DEPTH] = screen.colorDepth;
        browserData[key.FLASH] = parseFlashVersion(navigator);
        browserData[key.HISTORY_DEPTH] = history.length;
        browserData[key.PLUGIN_COUNT] = navigator.plugins.length;
        browserData[key.MIME_TYPE_COUNT] = navigator.mimeTypes.length;
        browserData[key.COOKIE_ENABLED] = navigator.cookieEnabled;
        browserData[key.LANGUAGE] = navigator.systemLanguage || navigator.language;
        browserData[key.BROWSER] = browserData[key.USER_AGENT].split(/[ /]/)[0];
        browserData[key.BROWSER_VERSION] = +browserData[key.USER_AGENT].split(/[ /]/)[1];
    }
    clientInfo.KEY = {
        USER_AGENT: 'nav',
        IE_SHELL: 'ies',
        OS: 'sys',
        PLATFORM: 'plt',
        SCREEN_RESOLUTION: 'swh',
        CLIENT_RESOLUTION: 'uwh',
        COLOR_DEPTH: 'scd',
        FLASH: 'flv',
        HISTORY_DEPTH: 'hil',
        PLUGIN_COUNT: 'pil',
        MIME_TYPE_COUNT: 'mil',
        COOKIE_ENABLED: 'coe',
        LANGUAGE: 'osl',
        BROWSER: 'bwr',
        BROWSER_VERSION: 'bwv'
    };
    clientInfo.getUserAgent = function () {
        return browserData[clientInfo.KEY.USER_AGENT];
    };
    clientInfo.isFlashSupported = function () {
        return browserData[clientInfo.KEY.FLASH] > 0;
    };
    clientInfo.getBrowserData = function () {
        return browserData;
    };
    clientInfo.getBrowserDataByKey = function (key) {
        return browserData[key];
    };
    clientInfo.getBrowser = function () {
        return browserData[clientInfo.KEY.BROWSER];
    };
    clientInfo.getBrowserVersion = function () {
        return browserData[clientInfo.KEY.BROWSER_VERSION];
    };
    clientInfo.resetForTest = initBrowserData;
    initBrowserData(window.navigator, window.screen, window.history);
    return clientInfo;
});

define('fc-view/main', ['require'], function (require) {
    'use strict';
    var view = { version: '0.0.1-alpha.2' };
    return view;
});

define('fc-view', ['fc-view/main'], function ( main ) { return main; });

define('er/Action', [
    'require',
    './util',
    './Deferred',
    './events',
    './locator',
    'eoo',
    'mini-event/EventTarget'
], function (require) {
    var util = require('./util');
    function reportErrors() {
        var errors = [];
        for (var i = 0; i < arguments.length; i++) {
            var result = arguments[i];
            if (!result.success) {
                errors.push(result);
            }
        }
        return this.handleError(errors);
    }
    var exports = {};
    exports.constructor = function () {
        this.disposed = false;
        this.initialize();
    };
    exports.initialize = util.noop;
    exports.context = null;
    exports.modelType = null;
    exports.viewType = null;
    exports.enter = function (actionContext) {
        this.context = actionContext || {};
        this.fire('enter');
        var args = util.mix({}, actionContext && actionContext.args);
        if (this.model) {
            this.model.fill(args);
        } else {
            this.model = this.createModel(args);
        }
        this.fire('beforemodelload');
        if (this.model && typeof this.model.load === 'function') {
            var loadingModel = this.model.load();
            return loadingModel.then(util.bind(this.forwardToView, this), util.bind(reportErrors, this));
        } else {
            this.forwardToView();
            return require('./Deferred').resolved(this);
        }
    };
    exports.handleError = function (errors) {
        throw errors;
    };
    exports.createModel = function (context) {
        if (this.modelType) {
            var model = new this.modelType(context);
            return model;
        } else {
            return {};
        }
    };
    exports.forwardToView = function () {
        if (this.disposed) {
            return this;
        }
        this.fire('modelloaded');
        if (!this.view) {
            this.view = this.createView();
        }
        if (this.view) {
            this.view.model = this.model;
            if (!this.view.container) {
                this.view.container = this.context.container;
            }
            this.fire('beforerender');
            this.view.render();
            this.fire('rendered');
            this.initBehavior();
            this.fire('entercomplete');
        } else {
            var events = require('./events');
            events.notifyError('No view attached to this action');
        }
        return this;
    };
    exports.createView = function () {
        return this.viewType ? new this.viewType() : null;
    };
    exports.initBehavior = util.noop;
    exports.filterRedirect = util.noop;
    exports.leave = function () {
        if (this.disposed) {
            return this;
        }
        this.disposed = true;
        this.fire('beforeleave');
        if (this.model) {
            if (typeof this.model.dispose === 'function') {
                this.model.dispose();
            }
            this.model = null;
        }
        if (this.view) {
            if (typeof this.view.dispose === 'function') {
                this.view.dispose();
            }
            this.view = null;
        }
        this.fire('leave');
        this.destroyEvents();
    };
    exports.redirect = function (url, options) {
        var locator = require('./locator');
        locator.redirect(url, options);
    };
    exports.reload = function () {
        var locator = require('./locator');
        locator.reload();
    };
    exports.back = function (defaultURL) {
        var referrer = this.context && this.context.referrer;
        var url = referrer || defaultURL;
        if (url) {
            this.redirect(url);
        }
    };
    var Action = require('eoo').create(require('mini-event/EventTarget'), exports);
    return Action;
});

define('fc-view/mvc/BaseAction', [
    'require',
    'fc-core',
    'er/Action'
], function (require) {
    var fc = require('fc-core');
    var proto = {};
    proto.constructor = function () {
        this.$super(arguments);
    };
    var BaseAction = fc.oo.derive(require('er/Action'), proto);
    return BaseAction;
});

define('er/Model', [
    'require',
    './util',
    './Deferred',
    'eoo',
    'mini-event/EventTarget'
], function (require) {
    var util = require('./util');
    var Deferred = require('./Deferred');
    var SILENT = { silent: true };
    function loadData(model, options) {
        function addDataToModel(value) {
            if (options.dump) {
                model.fill(value, SILENT);
            } else {
                model.set(options.name, value, SILENT);
            }
            return {
                success: true,
                name: options.name,
                options: options,
                value: value
            };
        }
        function buildError(error) {
            return {
                success: false,
                name: options.name,
                options: options,
                error: error
            };
        }
        try {
            var value = options.retrieve(model, options);
            if (Deferred.isPromise(value)) {
                if (typeof value.abort === 'function') {
                    model.addPendingWorker(value);
                }
                return value.then(addDataToModel, function (error) {
                    error = buildError(error);
                    try {
                        var result = model.handleError(error);
                        return addDataToModel(result);
                    } catch (ex) {
                        if (ex.success === false) {
                            throw ex;
                        } else {
                            throw buildError(ex);
                        }
                    }
                });
            } else {
                var result = addDataToModel(value);
                return Deferred.resolved(result);
            }
        } catch (ex) {
            var error = buildError(ex);
            return Deferred.rejected(error);
        }
    }
    function loadSequence(model, datasource) {
        var loading = Deferred.resolved();
        for (var i = 0; i < datasource.length; i++) {
            var unit = datasource[i];
            var task = util.bind(load, null, model, unit);
            loading = loading.then(task);
        }
        return loading;
    }
    function loadParallel(model, datasource) {
        var workers = [];
        for (var name in datasource) {
            if (datasource.hasOwnProperty(name)) {
                var unit = datasource[name];
                if (typeof unit === 'function') {
                    unit = {
                        retrieve: unit,
                        name: name
                    };
                } else if (typeof unit.retrieve === 'function') {
                    unit = util.mix({ name: name }, unit);
                }
                workers.push(load(model, unit));
            }
        }
        return Deferred.all(workers);
    }
    function load(model, datasource) {
        if (!datasource) {
            return Deferred.resolved();
        }
        if (typeof datasource === 'function') {
            var options = {
                    retrieve: datasource,
                    dump: true
                };
            return loadData(model, options);
        }
        if (datasource instanceof Array) {
            return loadSequence(model, datasource);
        }
        if (typeof datasource.retrieve === 'function') {
            return loadData(model, datasource);
        }
        return loadParallel(model, datasource);
    }
    var exports = {};
    exports.constructor = function (context) {
        this.store = {};
        this.pendingWorkers = [];
        if (context) {
            this.fill(context, SILENT);
        }
        this.initialize();
    };
    exports.initialize = util.noop;
    function removePendingWorker(model, worker) {
        for (var i = 0; i < model.pendingWorkers.length; i++) {
            if (model.pendingWorkers[i] === worker) {
                model.pendingWorkers.splice(i, 1);
                return;
            }
        }
    }
    exports.addPendingWorker = function (worker) {
        this.pendingWorkers.push(worker);
        worker.ensure(util.bind(removePendingWorker, null, this, worker));
    };
    exports.datasource = null;
    exports.getDatasource = function () {
        return this.datasource;
    };
    function forwardToPrepare() {
        function processError(ex) {
            var error = {
                    success: false,
                    name: '$prepare',
                    options: {},
                    error: ex
                };
            throw error;
        }
        try {
            var preparing = this.prepare();
            if (Deferred.isPromise(preparing)) {
                return preparing.fail(processError);
            } else {
                return preparing;
            }
        } catch (ex) {
            processError(ex);
        }
    }
    exports.load = function () {
        try {
            var datasource = this.getDatasource();
            var loading = load(this, datasource);
            return loading.then(util.bind(forwardToPrepare, this));
        } catch (ex) {
            return Deferred.rejected(ex);
        }
    };
    exports.prepare = util.noop;
    exports.get = function (name) {
        return this.store[name];
    };
    function setProperty(model, name, value) {
        var type = model.store.hasOwnProperty(name) ? 'change' : 'add';
        var oldValue = model.store[name];
        model.store[name] = value;
        if (oldValue !== value) {
            return {
                type: type,
                name: name,
                oldValue: oldValue,
                newValue: value
            };
        }
        return null;
    }
    exports.set = function (name, value, options) {
        options = options || {};
        var record = setProperty(this, name, value);
        if (record && !options.silent) {
            var event = { changes: [record] };
            this.fire('change', event);
        }
        return value;
    };
    exports.fill = function (extension, options) {
        options = options || {};
        var changes = [];
        for (var name in extension) {
            if (extension.hasOwnProperty(name)) {
                var record = setProperty(this, name, extension[name]);
                if (record) {
                    changes.push(record);
                }
            }
        }
        if (changes.length && !options.silent) {
            var event = { changes: changes };
            this.fire('change', event);
        }
        return extension;
    };
    exports.remove = function (name, options) {
        if (!this.store.hasOwnProperty(name)) {
            return;
        }
        options = options || {};
        var value = this.store[name];
        delete this.store[name];
        if (!options.silent) {
            var event = {
                    changes: [{
                            type: 'remove',
                            name: name,
                            oldValue: value,
                            newValue: undefined
                        }]
                };
            this.fire('change', event);
        }
        return value;
    };
    exports.getAsModel = function (name) {
        var value = this.get(name);
        if (!value || {}.toString.call(value) !== '[object Object]') {
            return new Model();
        } else {
            return new Model(value);
        }
    };
    exports.dump = function () {
        return util.mix({}, this.store);
    };
    exports.has = function (name) {
        return this.store.hasOwnProperty(name);
    };
    exports.hasValue = function (name) {
        return this.has(name) && this.store[name] != null;
    };
    exports.hasReadableValue = function (name) {
        return this.hasValue(name) && this.store[name] !== '';
    };
    exports.valueOf = function () {
        return this.dump();
    };
    exports.clone = function () {
        return new Model(this.store);
    };
    exports.handleError = function (error) {
        throw error;
    };
    exports.dispose = function () {
        if (this.pendingWorkers) {
            for (var i = 0; i < this.pendingWorkers.length; i++) {
                var worker = this.pendingWorkers[i];
                if (typeof worker.abort === 'function') {
                    try {
                        worker.abort();
                    } catch (ex) {
                    }
                }
            }
            this.pendingWorkers = null;
        }
    };
    var Model = require('eoo').create(require('mini-event/EventTarget'), exports);
    return Model;
});

define('fc-view/mvc/formatter', ['require'], function (require) {
    function pad(s) {
        s = s + '';
        return s.length === 1 ? '0' + s : s;
    }
    var formatters = {
            date: function (date) {
                return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
            },
            dateRange: function (range) {
                return formatters.date(range.begin) + ',' + formatters.date(range.end);
            },
            time: function (time) {
                return formatters.date(time) + ' ' + pad(time.getHours()) + ':' + pad(time.getMinutes()) + ':' + pad(time.getSeconds());
            },
            timeRange: function (range) {
                return formatters.time(range.begin) + ',' + formatters.time(range.end);
            }
        };
    return formatters;
});

define('fc-view/mvc/BaseModel', [
    'require',
    'underscore',
    'fc-core',
    'er/Model',
    './formatter'
], function (require) {
    var _ = require('underscore');
    var fc = require('fc-core');
    var proto = {};
    proto.set = function (name, value, options) {
        if (!this.store) {
            throw new Error('This model is disposed');
        }
        if (!name) {
            throw new Error('Argument name is not provided');
        }
        if (arguments.length < 2) {
            throw new Error('Argument value is not provided');
        }
        options = options || [];
        var changeType = this.store.hasOwnProperty(name) ? 'change' : 'add';
        var oldValue = this.store[name];
        this.store[name] = value;
        if (oldValue !== value && !options.silent) {
            var event = {
                    name: name,
                    oldValue: oldValue,
                    newValue: value,
                    changeType: changeType
                };
            this.fire('change', event);
            this.fire('change:' + name, event);
        }
    };
    proto.fill = function (extension, options) {
        if (!this.store) {
            throw new Error('This model is disposed');
        }
        if (!extension) {
            throw new Error('Argument extension is not provided');
        }
        for (var name in extension) {
            if (extension.hasOwnProperty(name)) {
                this.set(name, extension[name], options);
            }
        }
    };
    proto.remove = function (name, options) {
        if (!this.store) {
            throw new Error('This model is disposed');
        }
        if (!name) {
            throw new Error('Argument name is not provided');
        }
        if (!this.store.hasOwnProperty(name)) {
            return undefined;
        }
        options = options || EMPTY;
        var oldValue = this.store[name];
        delete this.store[name];
        if (!options.silent) {
            var event = {
                    name: name,
                    changeType: 'remove',
                    oldValue: oldValue,
                    newValue: undefined
                };
            this.fire('change', event);
            this.fire('change:' + name, event);
        }
    };
    proto.dump = function () {
        var returnValue = {};
        fc.util.deepExtend(returnValue, this.store);
        return returnValue;
    };
    var BaseModel = fc.oo.derive(require('er/Model'), proto);
    BaseModel.formatter = require('./formatter');
    return BaseModel;
});

define('er/View', [
    'require',
    './util',
    './Model',
    'etpl',
    'eoo',
    'mini-event/EventTarget'
], function (require) {
    var util = require('./util');
    var exports = {};
    exports.constructor = function () {
        this.initialize();
    };
    exports.initialize = util.noop;
    exports.template = '';
    exports.getTemplateName = function () {
        return this.template || '';
    };
    exports.model = null;
    exports.container = '';
    exports.getContainerElement = function () {
        return util.getElement(this.container) || null;
    };
    exports.getTemplateData = function () {
        var model = this.model;
        if (model && typeof model.get !== 'function') {
            var Model = require('./Model');
            model = new Model(model);
        }
        var visit = function (propertyPath) {
            var path = propertyPath.replace(/\[(\d+)\]/g, '.$1').split('.');
            var propertyName = path.shift();
            var value = model.get(propertyName);
            while (value && (propertyName = path.shift())) {
                value = value[propertyName];
            }
            return value;
        };
        return {
            get: visit,
            relatedModel: model
        };
    };
    exports.render = function () {
        var container = this.getContainerElement();
        if (!container) {
            var url = this.model && typeof this.model.get === 'function' && this.model.get('url');
            throw new Error('Container not found when rendering ' + (url ? '"' + url + '"' : 'view'));
        }
        var template = require('etpl');
        var html = template.render(this.getTemplateName(), this.getTemplateData());
        container.innerHTML = html;
        this.enterDocument();
    };
    exports.enterDocument = require('./util').noop;
    exports.dispose = function () {
        var container = this.getContainerElement();
        container && (container.innerHTML = '');
    };
    var View = require('eoo').create(require('mini-event/EventTarget'), exports);
    return View;
});

define('fc-view/mvc/BaseView', [
    'require',
    'fc-core',
    'underscore',
    'er/View',
    'ef/UIView'
], function (require) {
    var fc = require('fc-core');
    var _ = require('underscore');
    require('er/View').prototype.dispose = function () {
    };
    var proto = {};
    proto.constructor = function () {
        this.$super(arguments);
    };
    proto.name = 'fc-view-mvc-BaseView';
    function bindEventToControl(view, id, eventName, handler) {
        if (typeof handler === 'string') {
            handler = view[handler];
        }
        if (typeof handler !== 'function') {
            return handler;
        }
        var control = view.get(id);
        if (control) {
            control.on(eventName, handler, view);
        }
        return handler;
    }
    proto.bindEvents = function () {
        var me = this;
        var events = me.getUIEvents();
        if (!events) {
            return;
        }
        for (var key in events) {
            if (!events.hasOwnProperty(key)) {
                continue;
            }
            var segments = key.split(':');
            if (segments.length > 1) {
                var id = segments[0];
                var type = segments[1];
                var handler = events[key];
                if (id.indexOf('@') === 0) {
                    var groupid = id.split('@')[1];
                    var group = me.getGroup(groupid);
                    group && group.each(function (item) {
                        bindEventToControl(me, item.id, type, handler);
                    });
                } else {
                    bindEventToControl(me, id, type, handler);
                }
            } else {
                var map = events[key];
                if (typeof map !== 'object') {
                    return;
                }
                for (var type in map) {
                    if (map.hasOwnProperty(type)) {
                        var handler = map[type];
                        if (key.indexOf('@') === 0) {
                            var groupid = key.split('@')[1];
                            var group = me.getGroup(groupid);
                            group && group.each(function (item) {
                                bindEventToControl(me, item.id, type, handler);
                            });
                        } else {
                            bindEventToControl(me, key, type, handler);
                        }
                    }
                }
            }
        }
    };
    proto.enterDocument = function () {
        this.$super(arguments);
        this.customDocument();
    };
    proto.customDocument = function () {
    };
    var BaseView = fc.oo.derive(require('ef/UIView'), proto);
    return BaseView;
});

define('fc-view/mvc/EntryAction', [
    'require',
    'underscore',
    'fc-core',
    'er/URL',
    './BaseAction'
], function (require) {
    var _ = require('underscore');
    var fc = require('fc-core');
    var proto = {};
    proto.reloadWithUpdatedModel = function () {
        var model = this.model;
        var url = this.context.url;
        var path = url.getPath();
        var args = model.dumpForQuery();
        var targetUrl = require('er/URL').withQuery(path, args).toString();
        this.redirect(targetUrl, { force: true });
    };
    proto.initBehavior = function () {
        this.model.on('change', _.bind(this.reloadWithUpdatedModel, this));
        this.customBehavior();
    };
    proto.customBehavior = function () {
    };
    var EntryAction = fc.oo.derive(require('./BaseAction'), proto);
    return EntryAction;
});

define('fc-view/mvc/EntryModel', [
    'require',
    'underscore',
    'fc-core',
    './BaseModel'
], function (require) {
    var _ = require('underscore');
    var fc = require('fc-core');
    var proto = {};
    proto.constructor = function (context) {
        var newContext = fc.util.deepExtend({}, this.getDefaultArgs(), context);
        this.$super([newContext]);
    };
    proto.defaultArgs = {};
    proto.getDefaultArgs = function () {
        return this.defaultArgs || {};
    };
    proto.dumpForQuery = function () {
        var dumpedModel = this.dump();
        var toExclude = {
                url: 1,
                container: 1,
                isChildAction: 1,
                referrer: 1,
                context: 1
            };
        var toReturn = {};
        for (var k in dumpedModel) {
            if (dumpedModel.hasOwnProperty(k) && !toExclude[k]) {
                if (!_.isObject(dumpedModel[k])) {
                    toReturn[k] = dumpedModel[k];
                }
            }
        }
        return toReturn;
    };
    return fc.oo.derive(require('./BaseModel'), proto);
});

define('mini-event/main', [
    'require',
    './Event'
], function (require) {
    var Event = require('./Event');
    return {
        version: '1.0.2',
        Event: Event,
        fromDOMEvent: Event.fromDOMEvent,
        fromEvent: Event.fromEvent,
        delegate: Event.delegate
    };
});

define('mini-event', ['mini-event/main'], function ( main ) { return main; });

define('esui/lib/string', [
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    var lib = {};
    var WHITESPACE = /^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g;
    lib.trim = function (source) {
        if (!source) {
            return '';
        }
        return String(source).replace(WHITESPACE, '');
    };
    lib.format = function (template, data) {
        if (!template) {
            return '';
        }
        if (data == null) {
            return template;
        }
        return template.replace(/\$\{(.+?)\}/g, function (match, key) {
            var replacer = data[key];
            if (typeof replacer === 'function') {
                replacer = replacer(key);
            }
            return replacer == null ? '' : replacer;
        });
    };
    lib.camelize = function (source) {
        if (!source) {
            return '';
        }
        return source.replace(/-([a-z])/g, function (alpha) {
            return alpha.toUpperCase();
        });
    };
    lib.pascalize = function (source) {
        if (!source) {
            return '';
        }
        return source.charAt(0).toUpperCase() + lib.camelize(source.slice(1));
    };
    lib.splitTokenList = function (input) {
        if (!input) {
            return [];
        }
        if (u.isArray(input)) {
            return;
        }
        return u.chain(input.split(/[,\s]/)).map(lib.trim).compact().value();
    };
    return lib;
});

define('esui/lib/dom', [
    'require',
    'underscore',
    './string'
], function (require) {
    var u = require('underscore');
    var string = require('./string');
    var lib = {};
    lib.g = function (id) {
        if (!id) {
            return null;
        }
        return typeof id === 'string' ? document.getElementById(id) : id;
    };
    lib.isInput = function (element) {
        var nodeName = element.nodeName.toLowerCase();
        return nodeName === 'input' || nodeName === 'select' || nodeName === 'textarea';
    };
    lib.removeNode = function (element) {
        if (typeof element === 'string') {
            element = lib.g(element);
        }
        if (!element) {
            return;
        }
        var parent = element.parentNode;
        if (parent) {
            parent.removeChild(element);
        }
    };
    lib.insertAfter = function (element, reference) {
        var parent = reference.parentNode;
        if (parent) {
            parent.insertBefore(element, reference.nextSibling);
        }
        return element;
    };
    lib.insertBefore = function (element, reference) {
        var parent = reference.parentNode;
        if (parent) {
            parent.insertBefore(element, reference);
        }
        return element;
    };
    lib.getChildren = function (element) {
        return u.filter(element.children, function (child) {
            return child.nodeType === 1;
        });
    };
    lib.getComputedStyle = function (element, key) {
        if (!element) {
            return '';
        }
        var doc = element.nodeType == 9 ? element : element.ownerDocument || element.document;
        if (doc.defaultView && doc.defaultView.getComputedStyle) {
            var styles = doc.defaultView.getComputedStyle(element, null);
            if (styles) {
                return styles[key] || styles.getPropertyValue(key);
            }
        } else if (element && element.currentStyle) {
            return element.currentStyle[key];
        }
        return '';
    };
    lib.getStyle = function (element, key) {
        key = string.camelize(key);
        return element.style[key] || (element.currentStyle ? element.currentStyle[key] : '') || lib.getComputedStyle(element, key);
    };
    lib.getOffset = function (element) {
        var rect = element.getBoundingClientRect();
        var offset = {
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top
            };
        var clientTop = document.documentElement.clientTop || document.body.clientTop || 0;
        var clientLeft = document.documentElement.clientLeft || document.body.clientLeft || 0;
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        offset.top = offset.top + scrollTop - clientTop;
        offset.bottom = offset.bottom + scrollTop - clientTop;
        offset.left = offset.left + scrollLeft - clientLeft;
        offset.right = offset.right + scrollLeft - clientLeft;
        return offset;
    };
    lib.getText = function (element) {
        var text = '';
        if (element.nodeType === 3 || element.nodeType === 4) {
            text += element.nodeValue;
        } else if (element.nodeType !== 8) {
            u.each(element.childNodes, function (child) {
                text += lib.getText(child);
            });
        }
        return text;
    };
    lib.dom = {};
    lib.dom.first = function (element) {
        element = lib.g(element);
        if (element.firstElementChild) {
            return element.firstElementChild;
        }
        var node = element.firstChild;
        for (; node; node = node.nextSibling) {
            if (node.nodeType == 1) {
                return node;
            }
        }
        return null;
    };
    lib.dom.last = function (element) {
        element = lib.g(element);
        if (element.lastElementChild) {
            return element.lastElementChild;
        }
        var node = element.lastChild;
        for (; node; node = node.previousSibling) {
            if (node.nodeType === 1) {
                return node;
            }
        }
        return null;
    };
    lib.dom.next = function (element) {
        element = lib.g(element);
        if (element.nextElementSibling) {
            return element.nextElementSibling;
        }
        var node = element.nextSibling;
        for (; node; node = node.nextSibling) {
            if (node.nodeType == 1) {
                return node;
            }
        }
        return null;
    };
    lib.dom.contains = function (container, contained) {
        container = lib.g(container);
        contained = lib.g(contained);
        return container.contains ? container != contained && container.contains(contained) : !!(container.compareDocumentPosition(contained) & 16);
    };
    return lib;
});

define('esui/lib/attribute', [
    'require',
    './dom'
], function (require) {
    var dom = require('./dom');
    var lib = {};
    lib.hasAttribute = function (element, name) {
        if (element.hasAttribute) {
            return element.hasAttribute(name);
        } else {
            return element.attributes && element.attributes[name] && element.attributes[name].specified;
        }
    };
    var ATTRIBUTE_NAME_MAPPING = function () {
            var result = {
                    cellpadding: 'cellPadding',
                    cellspacing: 'cellSpacing',
                    colspan: 'colSpan',
                    rowspan: 'rowSpan',
                    valign: 'vAlign',
                    usemap: 'useMap',
                    frameborder: 'frameBorder'
                };
            var div = document.createElement('div');
            div.innerHTML = '<label for="test" class="test"></label>';
            var label = div.getElementsByTagName('label')[0];
            if (label.getAttribute('className') === 'test') {
                result['class'] = 'className';
            } else {
                result.className = 'class';
            }
            if (label.getAttribute('for') === 'test') {
                result.htmlFor = 'for';
            } else {
                result['for'] = 'htmlFor';
            }
            return result;
        }();
    lib.setAttribute = function (element, key, value) {
        element = dom.g(element);
        if (key === 'style') {
            element.style.cssText = value;
        } else {
            key = ATTRIBUTE_NAME_MAPPING[key] || key;
            element.setAttribute(key, value);
        }
        return element;
    };
    lib.getAttribute = function (element, key) {
        element = dom.g(element);
        if (key === 'style') {
            return element.style.cssText;
        }
        key = ATTRIBUTE_NAME_MAPPING[key] || key;
        return element.getAttribute(key);
    };
    lib.removeAttribute = function (element, key) {
        element = dom.g(element);
        key = ATTRIBUTE_NAME_MAPPING[key] || key;
        element.removeAttribute(key);
    };
    return lib;
});

define('esui/lib/class', [
    'require',
    'underscore',
    './dom'
], function (require) {
    var u = require('underscore');
    var dom = require('./dom');
    var lib = {};
    function getClassList(element) {
        return element.className ? element.className.split(/\s+/) : [];
    }
    lib.hasClass = function (element, className) {
        element = dom.g(element);
        if (className === '') {
            throw new Error('className must not be empty');
        }
        if (!element || !className) {
            return false;
        }
        if (element.classList) {
            return element.classList.contains(className);
        }
        var classes = getClassList(element);
        return u.contains(classes, className);
    };
    lib.addClass = function (element, className) {
        element = dom.g(element);
        if (className === '') {
            throw new Error('className must not be empty');
        }
        if (!element || !className) {
            return element;
        }
        if (element.classList) {
            element.classList.add(className);
            return element;
        }
        var classes = getClassList(element);
        if (u.contains(classes, className)) {
            return element;
        }
        classes.push(className);
        element.className = classes.join(' ');
        return element;
    };
    lib.addClasses = function (element, classes) {
        element = dom.g(element);
        if (!element || !classes) {
            return element;
        }
        if (element.classList) {
            u.each(classes, function (className) {
                element.classList.add(className);
            });
            return element;
        }
        var originalClasses = getClassList(element);
        var newClasses = u.union(originalClasses, classes);
        if (newClasses.length > originalClasses.length) {
            element.className = newClasses.join(' ');
        }
        return element;
    };
    lib.removeClass = function (element, className) {
        element = dom.g(element);
        if (className === '') {
            throw new Error('className must not be empty');
        }
        if (!element || !className) {
            return element;
        }
        if (element.classList) {
            element.classList.remove(className);
            return element;
        }
        var classes = getClassList(element);
        var changed = false;
        for (var i = 0; i < classes.length; i++) {
            if (classes[i] === className) {
                classes.splice(i, 1);
                i--;
                changed = true;
            }
        }
        if (changed) {
            element.className = classes.join(' ');
        }
        return element;
    };
    lib.removeClasses = function (element, classes) {
        element = dom.g(element);
        if (!element || !classes) {
            return element;
        }
        if (element.classList) {
            u.each(classes, function (className) {
                element.classList.remove(className);
            });
            return element;
        }
        var originalClasses = getClassList(element);
        var newClasses = u.difference(originalClasses, classes);
        if (newClasses.length < originalClasses.length) {
            element.className = newClasses.join(' ');
        }
        return element;
    };
    lib.toggleClass = function (element, className) {
        element = dom.g(element);
        if (className === '') {
            throw new Error('className must not be empty');
        }
        if (!element || !className) {
            return element;
        }
        if (element.classList) {
            element.classList.toggle(className);
            return element;
        }
        var classes = getClassList(element);
        var containsClass = false;
        for (var i = 0; i < classes.length; i++) {
            if (classes[i] === className) {
                classes.splice(i, 1);
                containsClass = true;
                i--;
            }
        }
        if (!containsClass) {
            classes.push(className);
        }
        element.className = classes.join(' ');
        return element;
    };
    return lib;
});

define('moment/moment', [
    'require',
    'exports',
    'module'
], function (require, exports, module) {
    (function (undefined) {
        var moment, VERSION = '2.7.0', globalScope = typeof global !== 'undefined' ? global : this, oldGlobalMoment, round = Math.round, i, YEAR = 0, MONTH = 1, DATE = 2, HOUR = 3, MINUTE = 4, SECOND = 5, MILLISECOND = 6, languages = {}, momentProperties = {
                _isAMomentObject: null,
                _i: null,
                _f: null,
                _l: null,
                _strict: null,
                _tzm: null,
                _isUTC: null,
                _offset: null,
                _pf: null,
                _lang: null
            }, hasModule = typeof module !== 'undefined' && module.exports, aspNetJsonRegex = /^\/?Date\((\-?\d+)/i, aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/, isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/, formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, parseTokenOneOrTwoDigits = /\d\d?/, parseTokenOneToThreeDigits = /\d{1,3}/, parseTokenOneToFourDigits = /\d{1,4}/, parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, parseTokenDigits = /\d+/, parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, parseTokenT = /T/i, parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, parseTokenOrdinal = /\d{1,2}/, parseTokenOneDigit = /\d/, parseTokenTwoDigits = /\d\d/, parseTokenThreeDigits = /\d{3}/, parseTokenFourDigits = /\d{4}/, parseTokenSixDigits = /[+-]?\d{6}/, parseTokenSignedNumber = /[+-]?\d+/, isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, isoFormat = 'YYYY-MM-DDTHH:mm:ssZ', isoDates = [
                [
                    'YYYYYY-MM-DD',
                    /[+-]\d{6}-\d{2}-\d{2}/
                ],
                [
                    'YYYY-MM-DD',
                    /\d{4}-\d{2}-\d{2}/
                ],
                [
                    'GGGG-[W]WW-E',
                    /\d{4}-W\d{2}-\d/
                ],
                [
                    'GGGG-[W]WW',
                    /\d{4}-W\d{2}/
                ],
                [
                    'YYYY-DDD',
                    /\d{4}-\d{3}/
                ]
            ], isoTimes = [
                [
                    'HH:mm:ss.SSSS',
                    /(T| )\d\d:\d\d:\d\d\.\d+/
                ],
                [
                    'HH:mm:ss',
                    /(T| )\d\d:\d\d:\d\d/
                ],
                [
                    'HH:mm',
                    /(T| )\d\d:\d\d/
                ],
                [
                    'HH',
                    /(T| )\d\d/
                ]
            ], parseTimezoneChunker = /([\+\-]|\d\d)/gi, proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'), unitMillisecondFactors = {
                'Milliseconds': 1,
                'Seconds': 1000,
                'Minutes': 60000,
                'Hours': 3600000,
                'Days': 86400000,
                'Months': 2592000000,
                'Years': 31536000000
            }, unitAliases = {
                ms: 'millisecond',
                s: 'second',
                m: 'minute',
                h: 'hour',
                d: 'day',
                D: 'date',
                w: 'week',
                W: 'isoWeek',
                M: 'month',
                Q: 'quarter',
                y: 'year',
                DDD: 'dayOfYear',
                e: 'weekday',
                E: 'isoWeekday',
                gg: 'weekYear',
                GG: 'isoWeekYear'
            }, camelFunctions = {
                dayofyear: 'dayOfYear',
                isoweekday: 'isoWeekday',
                isoweek: 'isoWeek',
                weekyear: 'weekYear',
                isoweekyear: 'isoWeekYear'
            }, formatFunctions = {}, relativeTimeThresholds = {
                s: 45,
                m: 45,
                h: 22,
                dd: 25,
                dm: 45,
                dy: 345
            }, ordinalizeTokens = 'DDD w W M D d'.split(' '), paddedTokens = 'M D H h m s w W'.split(' '), formatTokenFunctions = {
                M: function () {
                    return this.month() + 1;
                },
                MMM: function (format) {
                    return this.lang().monthsShort(this, format);
                },
                MMMM: function (format) {
                    return this.lang().months(this, format);
                },
                D: function () {
                    return this.date();
                },
                DDD: function () {
                    return this.dayOfYear();
                },
                d: function () {
                    return this.day();
                },
                dd: function (format) {
                    return this.lang().weekdaysMin(this, format);
                },
                ddd: function (format) {
                    return this.lang().weekdaysShort(this, format);
                },
                dddd: function (format) {
                    return this.lang().weekdays(this, format);
                },
                w: function () {
                    return this.week();
                },
                W: function () {
                    return this.isoWeek();
                },
                YY: function () {
                    return leftZeroFill(this.year() % 100, 2);
                },
                YYYY: function () {
                    return leftZeroFill(this.year(), 4);
                },
                YYYYY: function () {
                    return leftZeroFill(this.year(), 5);
                },
                YYYYYY: function () {
                    var y = this.year(), sign = y >= 0 ? '+' : '-';
                    return sign + leftZeroFill(Math.abs(y), 6);
                },
                gg: function () {
                    return leftZeroFill(this.weekYear() % 100, 2);
                },
                gggg: function () {
                    return leftZeroFill(this.weekYear(), 4);
                },
                ggggg: function () {
                    return leftZeroFill(this.weekYear(), 5);
                },
                GG: function () {
                    return leftZeroFill(this.isoWeekYear() % 100, 2);
                },
                GGGG: function () {
                    return leftZeroFill(this.isoWeekYear(), 4);
                },
                GGGGG: function () {
                    return leftZeroFill(this.isoWeekYear(), 5);
                },
                e: function () {
                    return this.weekday();
                },
                E: function () {
                    return this.isoWeekday();
                },
                a: function () {
                    return this.lang().meridiem(this.hours(), this.minutes(), true);
                },
                A: function () {
                    return this.lang().meridiem(this.hours(), this.minutes(), false);
                },
                H: function () {
                    return this.hours();
                },
                h: function () {
                    return this.hours() % 12 || 12;
                },
                m: function () {
                    return this.minutes();
                },
                s: function () {
                    return this.seconds();
                },
                S: function () {
                    return toInt(this.milliseconds() / 100);
                },
                SS: function () {
                    return leftZeroFill(toInt(this.milliseconds() / 10), 2);
                },
                SSS: function () {
                    return leftZeroFill(this.milliseconds(), 3);
                },
                SSSS: function () {
                    return leftZeroFill(this.milliseconds(), 3);
                },
                Z: function () {
                    var a = -this.zone(), b = '+';
                    if (a < 0) {
                        a = -a;
                        b = '-';
                    }
                    return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
                },
                ZZ: function () {
                    var a = -this.zone(), b = '+';
                    if (a < 0) {
                        a = -a;
                        b = '-';
                    }
                    return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
                },
                z: function () {
                    return this.zoneAbbr();
                },
                zz: function () {
                    return this.zoneName();
                },
                X: function () {
                    return this.unix();
                },
                Q: function () {
                    return this.quarter();
                }
            }, lists = [
                'months',
                'monthsShort',
                'weekdays',
                'weekdaysShort',
                'weekdaysMin'
            ];
        function dfl(a, b, c) {
            switch (arguments.length) {
            case 2:
                return a != null ? a : b;
            case 3:
                return a != null ? a : b != null ? b : c;
            default:
                throw new Error('Implement me');
            }
        }
        function defaultParsingFlags() {
            return {
                empty: false,
                unusedTokens: [],
                unusedInput: [],
                overflow: -2,
                charsLeftOver: 0,
                nullInput: false,
                invalidMonth: null,
                invalidFormat: false,
                userInvalidated: false,
                iso: false
            };
        }
        function deprecate(msg, fn) {
            var firstTime = true;
            function printMsg() {
                if (moment.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
                    console.warn('Deprecation warning: ' + msg);
                }
            }
            return extend(function () {
                if (firstTime) {
                    printMsg();
                    firstTime = false;
                }
                return fn.apply(this, arguments);
            }, fn);
        }
        function padToken(func, count) {
            return function (a) {
                return leftZeroFill(func.call(this, a), count);
            };
        }
        function ordinalizeToken(func, period) {
            return function (a) {
                return this.lang().ordinal(func.call(this, a), period);
            };
        }
        while (ordinalizeTokens.length) {
            i = ordinalizeTokens.pop();
            formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
        }
        while (paddedTokens.length) {
            i = paddedTokens.pop();
            formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
        }
        formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
        function Language() {
        }
        function Moment(config) {
            checkOverflow(config);
            extend(this, config);
        }
        function Duration(duration) {
            var normalizedInput = normalizeObjectUnits(duration), years = normalizedInput.year || 0, quarters = normalizedInput.quarter || 0, months = normalizedInput.month || 0, weeks = normalizedInput.week || 0, days = normalizedInput.day || 0, hours = normalizedInput.hour || 0, minutes = normalizedInput.minute || 0, seconds = normalizedInput.second || 0, milliseconds = normalizedInput.millisecond || 0;
            this._milliseconds = +milliseconds + seconds * 1000 + minutes * 60000 + hours * 3600000;
            this._days = +days + weeks * 7;
            this._months = +months + quarters * 3 + years * 12;
            this._data = {};
            this._bubble();
        }
        function extend(a, b) {
            for (var i in b) {
                if (b.hasOwnProperty(i)) {
                    a[i] = b[i];
                }
            }
            if (b.hasOwnProperty('toString')) {
                a.toString = b.toString;
            }
            if (b.hasOwnProperty('valueOf')) {
                a.valueOf = b.valueOf;
            }
            return a;
        }
        function cloneMoment(m) {
            var result = {}, i;
            for (i in m) {
                if (m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i)) {
                    result[i] = m[i];
                }
            }
            return result;
        }
        function absRound(number) {
            if (number < 0) {
                return Math.ceil(number);
            } else {
                return Math.floor(number);
            }
        }
        function leftZeroFill(number, targetLength, forceSign) {
            var output = '' + Math.abs(number), sign = number >= 0;
            while (output.length < targetLength) {
                output = '0' + output;
            }
            return (sign ? forceSign ? '+' : '' : '-') + output;
        }
        function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
            var milliseconds = duration._milliseconds, days = duration._days, months = duration._months;
            updateOffset = updateOffset == null ? true : updateOffset;
            if (milliseconds) {
                mom._d.setTime(+mom._d + milliseconds * isAdding);
            }
            if (days) {
                rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
            }
            if (months) {
                rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
            }
            if (updateOffset) {
                moment.updateOffset(mom, days || months);
            }
        }
        function isArray(input) {
            return Object.prototype.toString.call(input) === '[object Array]';
        }
        function isDate(input) {
            return Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date;
        }
        function compareArrays(array1, array2, dontConvert) {
            var len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0, i;
            for (i = 0; i < len; i++) {
                if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
                    diffs++;
                }
            }
            return diffs + lengthDiff;
        }
        function normalizeUnits(units) {
            if (units) {
                var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
                units = unitAliases[units] || camelFunctions[lowered] || lowered;
            }
            return units;
        }
        function normalizeObjectUnits(inputObject) {
            var normalizedInput = {}, normalizedProp, prop;
            for (prop in inputObject) {
                if (inputObject.hasOwnProperty(prop)) {
                    normalizedProp = normalizeUnits(prop);
                    if (normalizedProp) {
                        normalizedInput[normalizedProp] = inputObject[prop];
                    }
                }
            }
            return normalizedInput;
        }
        function makeList(field) {
            var count, setter;
            if (field.indexOf('week') === 0) {
                count = 7;
                setter = 'day';
            } else if (field.indexOf('month') === 0) {
                count = 12;
                setter = 'month';
            } else {
                return;
            }
            moment[field] = function (format, index) {
                var i, getter, method = moment.fn._lang[field], results = [];
                if (typeof format === 'number') {
                    index = format;
                    format = undefined;
                }
                getter = function (i) {
                    var m = moment().utc().set(setter, i);
                    return method.call(moment.fn._lang, m, format || '');
                };
                if (index != null) {
                    return getter(index);
                } else {
                    for (i = 0; i < count; i++) {
                        results.push(getter(i));
                    }
                    return results;
                }
            };
        }
        function toInt(argumentForCoercion) {
            var coercedNumber = +argumentForCoercion, value = 0;
            if (coercedNumber !== 0 && isFinite(coercedNumber)) {
                if (coercedNumber >= 0) {
                    value = Math.floor(coercedNumber);
                } else {
                    value = Math.ceil(coercedNumber);
                }
            }
            return value;
        }
        function daysInMonth(year, month) {
            return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        }
        function weeksInYear(year, dow, doy) {
            return weekOfYear(moment([
                year,
                11,
                31 + dow - doy
            ]), dow, doy).week;
        }
        function daysInYear(year) {
            return isLeapYear(year) ? 366 : 365;
        }
        function isLeapYear(year) {
            return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
        }
        function checkOverflow(m) {
            var overflow;
            if (m._a && m._pf.overflow === -2) {
                overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;
                if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                    overflow = DATE;
                }
                m._pf.overflow = overflow;
            }
        }
        function isValid(m) {
            if (m._isValid == null) {
                m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;
                if (m._strict) {
                    m._isValid = m._isValid && m._pf.charsLeftOver === 0 && m._pf.unusedTokens.length === 0;
                }
            }
            return m._isValid;
        }
        function normalizeLanguage(key) {
            return key ? key.toLowerCase().replace('_', '-') : key;
        }
        function makeAs(input, model) {
            return model._isUTC ? moment(input).zone(model._offset || 0) : moment(input).local();
        }
        extend(Language.prototype, {
            set: function (config) {
                var prop, i;
                for (i in config) {
                    prop = config[i];
                    if (typeof prop === 'function') {
                        this[i] = prop;
                    } else {
                        this['_' + i] = prop;
                    }
                }
            },
            _months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
            months: function (m) {
                return this._months[m.month()];
            },
            _monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            monthsShort: function (m) {
                return this._monthsShort[m.month()];
            },
            monthsParse: function (monthName) {
                var i, mom, regex;
                if (!this._monthsParse) {
                    this._monthsParse = [];
                }
                for (i = 0; i < 12; i++) {
                    if (!this._monthsParse[i]) {
                        mom = moment.utc([
                            2000,
                            i
                        ]);
                        regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                        this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                    }
                    if (this._monthsParse[i].test(monthName)) {
                        return i;
                    }
                }
            },
            _weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
            weekdays: function (m) {
                return this._weekdays[m.day()];
            },
            _weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysShort: function (m) {
                return this._weekdaysShort[m.day()];
            },
            _weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            weekdaysMin: function (m) {
                return this._weekdaysMin[m.day()];
            },
            weekdaysParse: function (weekdayName) {
                var i, mom, regex;
                if (!this._weekdaysParse) {
                    this._weekdaysParse = [];
                }
                for (i = 0; i < 7; i++) {
                    if (!this._weekdaysParse[i]) {
                        mom = moment([
                            2000,
                            1
                        ]).day(i);
                        regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                        this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                    }
                    if (this._weekdaysParse[i].test(weekdayName)) {
                        return i;
                    }
                }
            },
            _longDateFormat: {
                LT: 'h:mm A',
                L: 'MM/DD/YYYY',
                LL: 'MMMM D YYYY',
                LLL: 'MMMM D YYYY LT',
                LLLL: 'dddd, MMMM D YYYY LT'
            },
            longDateFormat: function (key) {
                var output = this._longDateFormat[key];
                if (!output && this._longDateFormat[key.toUpperCase()]) {
                    output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                        return val.slice(1);
                    });
                    this._longDateFormat[key] = output;
                }
                return output;
            },
            isPM: function (input) {
                return (input + '').toLowerCase().charAt(0) === 'p';
            },
            _meridiemParse: /[ap]\.?m?\.?/i,
            meridiem: function (hours, minutes, isLower) {
                if (hours > 11) {
                    return isLower ? 'pm' : 'PM';
                } else {
                    return isLower ? 'am' : 'AM';
                }
            },
            _calendar: {
                sameDay: '[Today at] LT',
                nextDay: '[Tomorrow at] LT',
                nextWeek: 'dddd [at] LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[Last] dddd [at] LT',
                sameElse: 'L'
            },
            calendar: function (key, mom) {
                var output = this._calendar[key];
                return typeof output === 'function' ? output.apply(mom) : output;
            },
            _relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: 'a few seconds',
                m: 'a minute',
                mm: '%d minutes',
                h: 'an hour',
                hh: '%d hours',
                d: 'a day',
                dd: '%d days',
                M: 'a month',
                MM: '%d months',
                y: 'a year',
                yy: '%d years'
            },
            relativeTime: function (number, withoutSuffix, string, isFuture) {
                var output = this._relativeTime[string];
                return typeof output === 'function' ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
            },
            pastFuture: function (diff, output) {
                var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
                return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
            },
            ordinal: function (number) {
                return this._ordinal.replace('%d', number);
            },
            _ordinal: '%d',
            preparse: function (string) {
                return string;
            },
            postformat: function (string) {
                return string;
            },
            week: function (mom) {
                return weekOfYear(mom, this._week.dow, this._week.doy).week;
            },
            _week: {
                dow: 0,
                doy: 6
            },
            _invalidDate: 'Invalid date',
            invalidDate: function () {
                return this._invalidDate;
            }
        });
        function loadLang(key, values) {
            values.abbr = key;
            if (!languages[key]) {
                languages[key] = new Language();
            }
            languages[key].set(values);
            return languages[key];
        }
        function unloadLang(key) {
            delete languages[key];
        }
        function getLangDefinition(key) {
            var i = 0, j, lang, next, split, get = function (k) {
                    if (!languages[k] && hasModule) {
                        try {
                            require('./lang/' + k);
                        } catch (e) {
                        }
                    }
                    return languages[k];
                };
            if (!key) {
                return moment.fn._lang;
            }
            if (!isArray(key)) {
                lang = get(key);
                if (lang) {
                    return lang;
                }
                key = [key];
            }
            while (i < key.length) {
                split = normalizeLanguage(key[i]).split('-');
                j = split.length;
                next = normalizeLanguage(key[i + 1]);
                next = next ? next.split('-') : null;
                while (j > 0) {
                    lang = get(split.slice(0, j).join('-'));
                    if (lang) {
                        return lang;
                    }
                    if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                        break;
                    }
                    j--;
                }
                i++;
            }
            return moment.fn._lang;
        }
        function removeFormattingTokens(input) {
            if (input.match(/\[[\s\S]/)) {
                return input.replace(/^\[|\]$/g, '');
            }
            return input.replace(/\\/g, '');
        }
        function makeFormatFunction(format) {
            var array = format.match(formattingTokens), i, length;
            for (i = 0, length = array.length; i < length; i++) {
                if (formatTokenFunctions[array[i]]) {
                    array[i] = formatTokenFunctions[array[i]];
                } else {
                    array[i] = removeFormattingTokens(array[i]);
                }
            }
            return function (mom) {
                var output = '';
                for (i = 0; i < length; i++) {
                    output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
                }
                return output;
            };
        }
        function formatMoment(m, format) {
            if (!m.isValid()) {
                return m.lang().invalidDate();
            }
            format = expandFormat(format, m.lang());
            if (!formatFunctions[format]) {
                formatFunctions[format] = makeFormatFunction(format);
            }
            return formatFunctions[format](m);
        }
        function expandFormat(format, lang) {
            var i = 5;
            function replaceLongDateFormatTokens(input) {
                return lang.longDateFormat(input) || input;
            }
            localFormattingTokens.lastIndex = 0;
            while (i >= 0 && localFormattingTokens.test(format)) {
                format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
                localFormattingTokens.lastIndex = 0;
                i -= 1;
            }
            return format;
        }
        function getParseRegexForToken(token, config) {
            var a, strict = config._strict;
            switch (token) {
            case 'Q':
                return parseTokenOneDigit;
            case 'DDDD':
                return parseTokenThreeDigits;
            case 'YYYY':
            case 'GGGG':
            case 'gggg':
                return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
            case 'Y':
            case 'G':
            case 'g':
                return parseTokenSignedNumber;
            case 'YYYYYY':
            case 'YYYYY':
            case 'GGGGG':
            case 'ggggg':
                return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
            case 'S':
                if (strict) {
                    return parseTokenOneDigit;
                }
            case 'SS':
                if (strict) {
                    return parseTokenTwoDigits;
                }
            case 'SSS':
                if (strict) {
                    return parseTokenThreeDigits;
                }
            case 'DDD':
                return parseTokenOneToThreeDigits;
            case 'MMM':
            case 'MMMM':
            case 'dd':
            case 'ddd':
            case 'dddd':
                return parseTokenWord;
            case 'a':
            case 'A':
                return getLangDefinition(config._l)._meridiemParse;
            case 'X':
                return parseTokenTimestampMs;
            case 'Z':
            case 'ZZ':
                return parseTokenTimezone;
            case 'T':
                return parseTokenT;
            case 'SSSS':
                return parseTokenDigits;
            case 'MM':
            case 'DD':
            case 'YY':
            case 'GG':
            case 'gg':
            case 'HH':
            case 'hh':
            case 'mm':
            case 'ss':
            case 'ww':
            case 'WW':
                return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
            case 'M':
            case 'D':
            case 'd':
            case 'H':
            case 'h':
            case 'm':
            case 's':
            case 'w':
            case 'W':
            case 'e':
            case 'E':
                return parseTokenOneOrTwoDigits;
            case 'Do':
                return parseTokenOrdinal;
            default:
                a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
                return a;
            }
        }
        function timezoneMinutesFromString(string) {
            string = string || '';
            var possibleTzMatches = string.match(parseTokenTimezone) || [], tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [], parts = (tzChunk + '').match(parseTimezoneChunker) || [
                    '-',
                    0,
                    0
                ], minutes = +(parts[1] * 60) + toInt(parts[2]);
            return parts[0] === '+' ? -minutes : minutes;
        }
        function addTimeToArrayFromToken(token, input, config) {
            var a, datePartArray = config._a;
            switch (token) {
            case 'Q':
                if (input != null) {
                    datePartArray[MONTH] = (toInt(input) - 1) * 3;
                }
                break;
            case 'M':
            case 'MM':
                if (input != null) {
                    datePartArray[MONTH] = toInt(input) - 1;
                }
                break;
            case 'MMM':
            case 'MMMM':
                a = getLangDefinition(config._l).monthsParse(input);
                if (a != null) {
                    datePartArray[MONTH] = a;
                } else {
                    config._pf.invalidMonth = input;
                }
                break;
            case 'D':
            case 'DD':
                if (input != null) {
                    datePartArray[DATE] = toInt(input);
                }
                break;
            case 'Do':
                if (input != null) {
                    datePartArray[DATE] = toInt(parseInt(input, 10));
                }
                break;
            case 'DDD':
            case 'DDDD':
                if (input != null) {
                    config._dayOfYear = toInt(input);
                }
                break;
            case 'YY':
                datePartArray[YEAR] = moment.parseTwoDigitYear(input);
                break;
            case 'YYYY':
            case 'YYYYY':
            case 'YYYYYY':
                datePartArray[YEAR] = toInt(input);
                break;
            case 'a':
            case 'A':
                config._isPm = getLangDefinition(config._l).isPM(input);
                break;
            case 'H':
            case 'HH':
            case 'h':
            case 'hh':
                datePartArray[HOUR] = toInt(input);
                break;
            case 'm':
            case 'mm':
                datePartArray[MINUTE] = toInt(input);
                break;
            case 's':
            case 'ss':
                datePartArray[SECOND] = toInt(input);
                break;
            case 'S':
            case 'SS':
            case 'SSS':
            case 'SSSS':
                datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
                break;
            case 'X':
                config._d = new Date(parseFloat(input) * 1000);
                break;
            case 'Z':
            case 'ZZ':
                config._useUTC = true;
                config._tzm = timezoneMinutesFromString(input);
                break;
            case 'dd':
            case 'ddd':
            case 'dddd':
                a = getLangDefinition(config._l).weekdaysParse(input);
                if (a != null) {
                    config._w = config._w || {};
                    config._w['d'] = a;
                } else {
                    config._pf.invalidWeekday = input;
                }
                break;
            case 'w':
            case 'ww':
            case 'W':
            case 'WW':
            case 'd':
            case 'e':
            case 'E':
                token = token.substr(0, 1);
            case 'gggg':
            case 'GGGG':
            case 'GGGGG':
                token = token.substr(0, 2);
                if (input) {
                    config._w = config._w || {};
                    config._w[token] = toInt(input);
                }
                break;
            case 'gg':
            case 'GG':
                config._w = config._w || {};
                config._w[token] = moment.parseTwoDigitYear(input);
            }
        }
        function dayOfYearFromWeekInfo(config) {
            var w, weekYear, week, weekday, dow, doy, temp, lang;
            w = config._w;
            if (w.GG != null || w.W != null || w.E != null) {
                dow = 1;
                doy = 4;
                weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
                week = dfl(w.W, 1);
                weekday = dfl(w.E, 1);
            } else {
                lang = getLangDefinition(config._l);
                dow = lang._week.dow;
                doy = lang._week.doy;
                weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
                week = dfl(w.w, 1);
                if (w.d != null) {
                    weekday = w.d;
                    if (weekday < dow) {
                        ++week;
                    }
                } else if (w.e != null) {
                    weekday = w.e + dow;
                } else {
                    weekday = dow;
                }
            }
            temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
        function dateFromConfig(config) {
            var i, date, input = [], currentDate, yearToUse;
            if (config._d) {
                return;
            }
            currentDate = currentDateArray(config);
            if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
                dayOfYearFromWeekInfo(config);
            }
            if (config._dayOfYear) {
                yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);
                if (config._dayOfYear > daysInYear(yearToUse)) {
                    config._pf._overflowDayOfYear = true;
                }
                date = makeUTCDate(yearToUse, 0, config._dayOfYear);
                config._a[MONTH] = date.getUTCMonth();
                config._a[DATE] = date.getUTCDate();
            }
            for (i = 0; i < 3 && config._a[i] == null; ++i) {
                config._a[i] = input[i] = currentDate[i];
            }
            for (; i < 7; i++) {
                config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
            }
            config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
            if (config._tzm != null) {
                config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);
            }
        }
        function dateFromObject(config) {
            var normalizedInput;
            if (config._d) {
                return;
            }
            normalizedInput = normalizeObjectUnits(config._i);
            config._a = [
                normalizedInput.year,
                normalizedInput.month,
                normalizedInput.day,
                normalizedInput.hour,
                normalizedInput.minute,
                normalizedInput.second,
                normalizedInput.millisecond
            ];
            dateFromConfig(config);
        }
        function currentDateArray(config) {
            var now = new Date();
            if (config._useUTC) {
                return [
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate()
                ];
            } else {
                return [
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate()
                ];
            }
        }
        function makeDateFromStringAndFormat(config) {
            if (config._f === moment.ISO_8601) {
                parseISO(config);
                return;
            }
            config._a = [];
            config._pf.empty = true;
            var lang = getLangDefinition(config._l), string = '' + config._i, i, parsedInput, tokens, token, skipped, stringLength = string.length, totalParsedInputLength = 0;
            tokens = expandFormat(config._f, lang).match(formattingTokens) || [];
            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];
                parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
                if (parsedInput) {
                    skipped = string.substr(0, string.indexOf(parsedInput));
                    if (skipped.length > 0) {
                        config._pf.unusedInput.push(skipped);
                    }
                    string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                    totalParsedInputLength += parsedInput.length;
                }
                if (formatTokenFunctions[token]) {
                    if (parsedInput) {
                        config._pf.empty = false;
                    } else {
                        config._pf.unusedTokens.push(token);
                    }
                    addTimeToArrayFromToken(token, parsedInput, config);
                } else if (config._strict && !parsedInput) {
                    config._pf.unusedTokens.push(token);
                }
            }
            config._pf.charsLeftOver = stringLength - totalParsedInputLength;
            if (string.length > 0) {
                config._pf.unusedInput.push(string);
            }
            if (config._isPm && config._a[HOUR] < 12) {
                config._a[HOUR] += 12;
            }
            if (config._isPm === false && config._a[HOUR] === 12) {
                config._a[HOUR] = 0;
            }
            dateFromConfig(config);
            checkOverflow(config);
        }
        function unescapeFormat(s) {
            return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
                return p1 || p2 || p3 || p4;
            });
        }
        function regexpEscape(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }
        function makeDateFromStringAndArray(config) {
            var tempConfig, bestMoment, scoreToBeat, i, currentScore;
            if (config._f.length === 0) {
                config._pf.invalidFormat = true;
                config._d = new Date(NaN);
                return;
            }
            for (i = 0; i < config._f.length; i++) {
                currentScore = 0;
                tempConfig = extend({}, config);
                tempConfig._pf = defaultParsingFlags();
                tempConfig._f = config._f[i];
                makeDateFromStringAndFormat(tempConfig);
                if (!isValid(tempConfig)) {
                    continue;
                }
                currentScore += tempConfig._pf.charsLeftOver;
                currentScore += tempConfig._pf.unusedTokens.length * 10;
                tempConfig._pf.score = currentScore;
                if (scoreToBeat == null || currentScore < scoreToBeat) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                }
            }
            extend(config, bestMoment || tempConfig);
        }
        function parseISO(config) {
            var i, l, string = config._i, match = isoRegex.exec(string);
            if (match) {
                config._pf.iso = true;
                for (i = 0, l = isoDates.length; i < l; i++) {
                    if (isoDates[i][1].exec(string)) {
                        config._f = isoDates[i][0] + (match[6] || ' ');
                        break;
                    }
                }
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(string)) {
                        config._f += isoTimes[i][0];
                        break;
                    }
                }
                if (string.match(parseTokenTimezone)) {
                    config._f += 'Z';
                }
                makeDateFromStringAndFormat(config);
            } else {
                config._isValid = false;
            }
        }
        function makeDateFromString(config) {
            parseISO(config);
            if (config._isValid === false) {
                delete config._isValid;
                moment.createFromInputFallback(config);
            }
        }
        function makeDateFromInput(config) {
            var input = config._i, matched = aspNetJsonRegex.exec(input);
            if (input === undefined) {
                config._d = new Date();
            } else if (matched) {
                config._d = new Date(+matched[1]);
            } else if (typeof input === 'string') {
                makeDateFromString(config);
            } else if (isArray(input)) {
                config._a = input.slice(0);
                dateFromConfig(config);
            } else if (isDate(input)) {
                config._d = new Date(+input);
            } else if (typeof input === 'object') {
                dateFromObject(config);
            } else if (typeof input === 'number') {
                config._d = new Date(input);
            } else {
                moment.createFromInputFallback(config);
            }
        }
        function makeDate(y, m, d, h, M, s, ms) {
            var date = new Date(y, m, d, h, M, s, ms);
            if (y < 1970) {
                date.setFullYear(y);
            }
            return date;
        }
        function makeUTCDate(y) {
            var date = new Date(Date.UTC.apply(null, arguments));
            if (y < 1970) {
                date.setUTCFullYear(y);
            }
            return date;
        }
        function parseWeekday(input, language) {
            if (typeof input === 'string') {
                if (!isNaN(input)) {
                    input = parseInt(input, 10);
                } else {
                    input = language.weekdaysParse(input);
                    if (typeof input !== 'number') {
                        return null;
                    }
                }
            }
            return input;
        }
        function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
            return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
        }
        function relativeTime(milliseconds, withoutSuffix, lang) {
            var seconds = round(Math.abs(milliseconds) / 1000), minutes = round(seconds / 60), hours = round(minutes / 60), days = round(hours / 24), years = round(days / 365), args = seconds < relativeTimeThresholds.s && [
                    's',
                    seconds
                ] || minutes === 1 && ['m'] || minutes < relativeTimeThresholds.m && [
                    'mm',
                    minutes
                ] || hours === 1 && ['h'] || hours < relativeTimeThresholds.h && [
                    'hh',
                    hours
                ] || days === 1 && ['d'] || days <= relativeTimeThresholds.dd && [
                    'dd',
                    days
                ] || days <= relativeTimeThresholds.dm && ['M'] || days < relativeTimeThresholds.dy && [
                    'MM',
                    round(days / 30)
                ] || years === 1 && ['y'] || [
                    'yy',
                    years
                ];
            args[2] = withoutSuffix;
            args[3] = milliseconds > 0;
            args[4] = lang;
            return substituteTimeAgo.apply({}, args);
        }
        function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
            var end = firstDayOfWeekOfYear - firstDayOfWeek, daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(), adjustedMoment;
            if (daysToDayOfWeek > end) {
                daysToDayOfWeek -= 7;
            }
            if (daysToDayOfWeek < end - 7) {
                daysToDayOfWeek += 7;
            }
            adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
            return {
                week: Math.ceil(adjustedMoment.dayOfYear() / 7),
                year: adjustedMoment.year()
            };
        }
        function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
            var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;
            d = d === 0 ? 7 : d;
            weekday = weekday != null ? weekday : firstDayOfWeek;
            daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
            dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;
            return {
                year: dayOfYear > 0 ? year : year - 1,
                dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
            };
        }
        function makeMoment(config) {
            var input = config._i, format = config._f;
            if (input === null || format === undefined && input === '') {
                return moment.invalid({ nullInput: true });
            }
            if (typeof input === 'string') {
                config._i = input = getLangDefinition().preparse(input);
            }
            if (moment.isMoment(input)) {
                config = cloneMoment(input);
                config._d = new Date(+input._d);
            } else if (format) {
                if (isArray(format)) {
                    makeDateFromStringAndArray(config);
                } else {
                    makeDateFromStringAndFormat(config);
                }
            } else {
                makeDateFromInput(config);
            }
            return new Moment(config);
        }
        moment = function (input, format, lang, strict) {
            var c;
            if (typeof lang === 'boolean') {
                strict = lang;
                lang = undefined;
            }
            c = {};
            c._isAMomentObject = true;
            c._i = input;
            c._f = format;
            c._l = lang;
            c._strict = strict;
            c._isUTC = false;
            c._pf = defaultParsingFlags();
            return makeMoment(c);
        };
        moment.suppressDeprecationWarnings = false;
        moment.createFromInputFallback = deprecate('moment construction falls back to js Date. This is ' + 'discouraged and will be removed in upcoming major ' + 'release. Please refer to ' + 'https://github.com/moment/moment/issues/1407 for more info.', function (config) {
            config._d = new Date(config._i);
        });
        function pickBy(fn, moments) {
            var res, i;
            if (moments.length === 1 && isArray(moments[0])) {
                moments = moments[0];
            }
            if (!moments.length) {
                return moment();
            }
            res = moments[0];
            for (i = 1; i < moments.length; ++i) {
                if (moments[i][fn](res)) {
                    res = moments[i];
                }
            }
            return res;
        }
        moment.min = function () {
            var args = [].slice.call(arguments, 0);
            return pickBy('isBefore', args);
        };
        moment.max = function () {
            var args = [].slice.call(arguments, 0);
            return pickBy('isAfter', args);
        };
        moment.utc = function (input, format, lang, strict) {
            var c;
            if (typeof lang === 'boolean') {
                strict = lang;
                lang = undefined;
            }
            c = {};
            c._isAMomentObject = true;
            c._useUTC = true;
            c._isUTC = true;
            c._l = lang;
            c._i = input;
            c._f = format;
            c._strict = strict;
            c._pf = defaultParsingFlags();
            return makeMoment(c).utc();
        };
        moment.unix = function (input) {
            return moment(input * 1000);
        };
        moment.duration = function (input, key) {
            var duration = input, match = null, sign, ret, parseIso;
            if (moment.isDuration(input)) {
                duration = {
                    ms: input._milliseconds,
                    d: input._days,
                    M: input._months
                };
            } else if (typeof input === 'number') {
                duration = {};
                if (key) {
                    duration[key] = input;
                } else {
                    duration.milliseconds = input;
                }
            } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
                sign = match[1] === '-' ? -1 : 1;
                duration = {
                    y: 0,
                    d: toInt(match[DATE]) * sign,
                    h: toInt(match[HOUR]) * sign,
                    m: toInt(match[MINUTE]) * sign,
                    s: toInt(match[SECOND]) * sign,
                    ms: toInt(match[MILLISECOND]) * sign
                };
            } else if (!!(match = isoDurationRegex.exec(input))) {
                sign = match[1] === '-' ? -1 : 1;
                parseIso = function (inp) {
                    var res = inp && parseFloat(inp.replace(',', '.'));
                    return (isNaN(res) ? 0 : res) * sign;
                };
                duration = {
                    y: parseIso(match[2]),
                    M: parseIso(match[3]),
                    d: parseIso(match[4]),
                    h: parseIso(match[5]),
                    m: parseIso(match[6]),
                    s: parseIso(match[7]),
                    w: parseIso(match[8])
                };
            }
            ret = new Duration(duration);
            if (moment.isDuration(input) && input.hasOwnProperty('_lang')) {
                ret._lang = input._lang;
            }
            return ret;
        };
        moment.version = VERSION;
        moment.defaultFormat = isoFormat;
        moment.ISO_8601 = function () {
        };
        moment.momentProperties = momentProperties;
        moment.updateOffset = function () {
        };
        moment.relativeTimeThreshold = function (threshold, limit) {
            if (relativeTimeThresholds[threshold] === undefined) {
                return false;
            }
            relativeTimeThresholds[threshold] = limit;
            return true;
        };
        moment.lang = function (key, values) {
            var r;
            if (!key) {
                return moment.fn._lang._abbr;
            }
            if (values) {
                loadLang(normalizeLanguage(key), values);
            } else if (values === null) {
                unloadLang(key);
                key = 'en';
            } else if (!languages[key]) {
                getLangDefinition(key);
            }
            r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
            return r._abbr;
        };
        moment.langData = function (key) {
            if (key && key._lang && key._lang._abbr) {
                key = key._lang._abbr;
            }
            return getLangDefinition(key);
        };
        moment.isMoment = function (obj) {
            return obj instanceof Moment || obj != null && obj.hasOwnProperty('_isAMomentObject');
        };
        moment.isDuration = function (obj) {
            return obj instanceof Duration;
        };
        for (i = lists.length - 1; i >= 0; --i) {
            makeList(lists[i]);
        }
        moment.normalizeUnits = function (units) {
            return normalizeUnits(units);
        };
        moment.invalid = function (flags) {
            var m = moment.utc(NaN);
            if (flags != null) {
                extend(m._pf, flags);
            } else {
                m._pf.userInvalidated = true;
            }
            return m;
        };
        moment.parseZone = function () {
            return moment.apply(null, arguments).parseZone();
        };
        moment.parseTwoDigitYear = function (input) {
            return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
        };
        extend(moment.fn = Moment.prototype, {
            clone: function () {
                return moment(this);
            },
            valueOf: function () {
                return +this._d + (this._offset || 0) * 60000;
            },
            unix: function () {
                return Math.floor(+this / 1000);
            },
            toString: function () {
                return this.clone().lang('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
            },
            toDate: function () {
                return this._offset ? new Date(+this) : this._d;
            },
            toISOString: function () {
                var m = moment(this).utc();
                if (0 < m.year() && m.year() <= 9999) {
                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
                } else {
                    return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
                }
            },
            toArray: function () {
                var m = this;
                return [
                    m.year(),
                    m.month(),
                    m.date(),
                    m.hours(),
                    m.minutes(),
                    m.seconds(),
                    m.milliseconds()
                ];
            },
            isValid: function () {
                return isValid(this);
            },
            isDSTShifted: function () {
                if (this._a) {
                    return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
                }
                return false;
            },
            parsingFlags: function () {
                return extend({}, this._pf);
            },
            invalidAt: function () {
                return this._pf.overflow;
            },
            utc: function () {
                return this.zone(0);
            },
            local: function () {
                this.zone(0);
                this._isUTC = false;
                return this;
            },
            format: function (inputString) {
                var output = formatMoment(this, inputString || moment.defaultFormat);
                return this.lang().postformat(output);
            },
            add: function (input, val) {
                var dur;
                if (typeof input === 'string' && typeof val === 'string') {
                    dur = moment.duration(isNaN(+val) ? +input : +val, isNaN(+val) ? val : input);
                } else if (typeof input === 'string') {
                    dur = moment.duration(+val, input);
                } else {
                    dur = moment.duration(input, val);
                }
                addOrSubtractDurationFromMoment(this, dur, 1);
                return this;
            },
            subtract: function (input, val) {
                var dur;
                if (typeof input === 'string' && typeof val === 'string') {
                    dur = moment.duration(isNaN(+val) ? +input : +val, isNaN(+val) ? val : input);
                } else if (typeof input === 'string') {
                    dur = moment.duration(+val, input);
                } else {
                    dur = moment.duration(input, val);
                }
                addOrSubtractDurationFromMoment(this, dur, -1);
                return this;
            },
            diff: function (input, units, asFloat) {
                var that = makeAs(input, this), zoneDiff = (this.zone() - that.zone()) * 60000, diff, output;
                units = normalizeUnits(units);
                if (units === 'year' || units === 'month') {
                    diff = (this.daysInMonth() + that.daysInMonth()) * 43200000;
                    output = (this.year() - that.year()) * 12 + (this.month() - that.month());
                    output += (this - moment(this).startOf('month') - (that - moment(that).startOf('month'))) / diff;
                    output -= (this.zone() - moment(this).startOf('month').zone() - (that.zone() - moment(that).startOf('month').zone())) * 60000 / diff;
                    if (units === 'year') {
                        output = output / 12;
                    }
                } else {
                    diff = this - that;
                    output = units === 'second' ? diff / 1000 : units === 'minute' ? diff / 60000 : units === 'hour' ? diff / 3600000 : units === 'day' ? (diff - zoneDiff) / 86400000 : units === 'week' ? (diff - zoneDiff) / 604800000 : diff;
                }
                return asFloat ? output : absRound(output);
            },
            from: function (time, withoutSuffix) {
                return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
            },
            fromNow: function (withoutSuffix) {
                return this.from(moment(), withoutSuffix);
            },
            calendar: function (time) {
                var now = time || moment(), sod = makeAs(now, this).startOf('day'), diff = this.diff(sod, 'days', true), format = diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';
                return this.format(this.lang().calendar(format, this));
            },
            isLeapYear: function () {
                return isLeapYear(this.year());
            },
            isDST: function () {
                return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone();
            },
            day: function (input) {
                var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
                if (input != null) {
                    input = parseWeekday(input, this.lang());
                    return this.add({ d: input - day });
                } else {
                    return day;
                }
            },
            month: makeAccessor('Month', true),
            startOf: function (units) {
                units = normalizeUnits(units);
                switch (units) {
                case 'year':
                    this.month(0);
                case 'quarter':
                case 'month':
                    this.date(1);
                case 'week':
                case 'isoWeek':
                case 'day':
                    this.hours(0);
                case 'hour':
                    this.minutes(0);
                case 'minute':
                    this.seconds(0);
                case 'second':
                    this.milliseconds(0);
                }
                if (units === 'week') {
                    this.weekday(0);
                } else if (units === 'isoWeek') {
                    this.isoWeekday(1);
                }
                if (units === 'quarter') {
                    this.month(Math.floor(this.month() / 3) * 3);
                }
                return this;
            },
            endOf: function (units) {
                units = normalizeUnits(units);
                return this.startOf(units).add(units === 'isoWeek' ? 'week' : units, 1).subtract('ms', 1);
            },
            isAfter: function (input, units) {
                units = typeof units !== 'undefined' ? units : 'millisecond';
                return +this.clone().startOf(units) > +moment(input).startOf(units);
            },
            isBefore: function (input, units) {
                units = typeof units !== 'undefined' ? units : 'millisecond';
                return +this.clone().startOf(units) < +moment(input).startOf(units);
            },
            isSame: function (input, units) {
                units = units || 'ms';
                return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
            },
            min: deprecate('moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548', function (other) {
                other = moment.apply(null, arguments);
                return other < this ? this : other;
            }),
            max: deprecate('moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548', function (other) {
                other = moment.apply(null, arguments);
                return other > this ? this : other;
            }),
            zone: function (input, keepTime) {
                var offset = this._offset || 0;
                if (input != null) {
                    if (typeof input === 'string') {
                        input = timezoneMinutesFromString(input);
                    }
                    if (Math.abs(input) < 16) {
                        input = input * 60;
                    }
                    this._offset = input;
                    this._isUTC = true;
                    if (offset !== input) {
                        if (!keepTime || this._changeInProgress) {
                            addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, false);
                        } else if (!this._changeInProgress) {
                            this._changeInProgress = true;
                            moment.updateOffset(this, true);
                            this._changeInProgress = null;
                        }
                    }
                } else {
                    return this._isUTC ? offset : this._d.getTimezoneOffset();
                }
                return this;
            },
            zoneAbbr: function () {
                return this._isUTC ? 'UTC' : '';
            },
            zoneName: function () {
                return this._isUTC ? 'Coordinated Universal Time' : '';
            },
            parseZone: function () {
                if (this._tzm) {
                    this.zone(this._tzm);
                } else if (typeof this._i === 'string') {
                    this.zone(this._i);
                }
                return this;
            },
            hasAlignedHourOffset: function (input) {
                if (!input) {
                    input = 0;
                } else {
                    input = moment(input).zone();
                }
                return (this.zone() - input) % 60 === 0;
            },
            daysInMonth: function () {
                return daysInMonth(this.year(), this.month());
            },
            dayOfYear: function (input) {
                var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 86400000) + 1;
                return input == null ? dayOfYear : this.add('d', input - dayOfYear);
            },
            quarter: function (input) {
                return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
            },
            weekYear: function (input) {
                var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
                return input == null ? year : this.add('y', input - year);
            },
            isoWeekYear: function (input) {
                var year = weekOfYear(this, 1, 4).year;
                return input == null ? year : this.add('y', input - year);
            },
            week: function (input) {
                var week = this.lang().week(this);
                return input == null ? week : this.add('d', (input - week) * 7);
            },
            isoWeek: function (input) {
                var week = weekOfYear(this, 1, 4).week;
                return input == null ? week : this.add('d', (input - week) * 7);
            },
            weekday: function (input) {
                var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
                return input == null ? weekday : this.add('d', input - weekday);
            },
            isoWeekday: function (input) {
                return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
            },
            isoWeeksInYear: function () {
                return weeksInYear(this.year(), 1, 4);
            },
            weeksInYear: function () {
                var weekInfo = this._lang._week;
                return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
            },
            get: function (units) {
                units = normalizeUnits(units);
                return this[units]();
            },
            set: function (units, value) {
                units = normalizeUnits(units);
                if (typeof this[units] === 'function') {
                    this[units](value);
                }
                return this;
            },
            lang: function (key) {
                if (key === undefined) {
                    return this._lang;
                } else {
                    this._lang = getLangDefinition(key);
                    return this;
                }
            }
        });
        function rawMonthSetter(mom, value) {
            var dayOfMonth;
            if (typeof value === 'string') {
                value = mom.lang().monthsParse(value);
                if (typeof value !== 'number') {
                    return mom;
                }
            }
            dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
            return mom;
        }
        function rawGetter(mom, unit) {
            return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
        }
        function rawSetter(mom, unit, value) {
            if (unit === 'Month') {
                return rawMonthSetter(mom, value);
            } else {
                return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
        function makeAccessor(unit, keepTime) {
            return function (value) {
                if (value != null) {
                    rawSetter(this, unit, value);
                    moment.updateOffset(this, keepTime);
                    return this;
                } else {
                    return rawGetter(this, unit);
                }
            };
        }
        moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
        moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
        moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
        moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
        moment.fn.date = makeAccessor('Date', true);
        moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
        moment.fn.year = makeAccessor('FullYear', true);
        moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));
        moment.fn.days = moment.fn.day;
        moment.fn.months = moment.fn.month;
        moment.fn.weeks = moment.fn.week;
        moment.fn.isoWeeks = moment.fn.isoWeek;
        moment.fn.quarters = moment.fn.quarter;
        moment.fn.toJSON = moment.fn.toISOString;
        extend(moment.duration.fn = Duration.prototype, {
            _bubble: function () {
                var milliseconds = this._milliseconds, days = this._days, months = this._months, data = this._data, seconds, minutes, hours, years;
                data.milliseconds = milliseconds % 1000;
                seconds = absRound(milliseconds / 1000);
                data.seconds = seconds % 60;
                minutes = absRound(seconds / 60);
                data.minutes = minutes % 60;
                hours = absRound(minutes / 60);
                data.hours = hours % 24;
                days += absRound(hours / 24);
                data.days = days % 30;
                months += absRound(days / 30);
                data.months = months % 12;
                years = absRound(months / 12);
                data.years = years;
            },
            weeks: function () {
                return absRound(this.days() / 7);
            },
            valueOf: function () {
                return this._milliseconds + this._days * 86400000 + this._months % 12 * 2592000000 + toInt(this._months / 12) * 31536000000;
            },
            humanize: function (withSuffix) {
                var difference = +this, output = relativeTime(difference, !withSuffix, this.lang());
                if (withSuffix) {
                    output = this.lang().pastFuture(difference, output);
                }
                return this.lang().postformat(output);
            },
            add: function (input, val) {
                var dur = moment.duration(input, val);
                this._milliseconds += dur._milliseconds;
                this._days += dur._days;
                this._months += dur._months;
                this._bubble();
                return this;
            },
            subtract: function (input, val) {
                var dur = moment.duration(input, val);
                this._milliseconds -= dur._milliseconds;
                this._days -= dur._days;
                this._months -= dur._months;
                this._bubble();
                return this;
            },
            get: function (units) {
                units = normalizeUnits(units);
                return this[units.toLowerCase() + 's']();
            },
            as: function (units) {
                units = normalizeUnits(units);
                return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
            },
            lang: moment.fn.lang,
            toIsoString: function () {
                var years = Math.abs(this.years()), months = Math.abs(this.months()), days = Math.abs(this.days()), hours = Math.abs(this.hours()), minutes = Math.abs(this.minutes()), seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);
                if (!this.asSeconds()) {
                    return 'P0D';
                }
                return (this.asSeconds() < 0 ? '-' : '') + 'P' + (years ? years + 'Y' : '') + (months ? months + 'M' : '') + (days ? days + 'D' : '') + (hours || minutes || seconds ? 'T' : '') + (hours ? hours + 'H' : '') + (minutes ? minutes + 'M' : '') + (seconds ? seconds + 'S' : '');
            }
        });
        function makeDurationGetter(name) {
            moment.duration.fn[name] = function () {
                return this._data[name];
            };
        }
        function makeDurationAsGetter(name, factor) {
            moment.duration.fn['as' + name] = function () {
                return +this / factor;
            };
        }
        for (i in unitMillisecondFactors) {
            if (unitMillisecondFactors.hasOwnProperty(i)) {
                makeDurationAsGetter(i, unitMillisecondFactors[i]);
                makeDurationGetter(i.toLowerCase());
            }
        }
        makeDurationAsGetter('Weeks', 604800000);
        moment.duration.fn.asMonths = function () {
            return (+this - this.years() * 31536000000) / 2592000000 + this.years() * 12;
        };
        moment.lang('en', {
            ordinal: function (number) {
                var b = number % 10, output = toInt(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
                return number + output;
            }
        });
        function makeGlobal(shouldDeprecate) {
            if (typeof ender !== 'undefined') {
                return;
            }
            oldGlobalMoment = globalScope.moment;
            if (shouldDeprecate) {
                globalScope.moment = deprecate('Accessing Moment through the global scope is ' + 'deprecated, and will be removed in an upcoming ' + 'release.', moment);
            } else {
                globalScope.moment = moment;
            }
        }
        if (hasModule) {
            module.exports = moment;
        }
    }.call(this));
});

define('moment', ['moment/moment'], function ( main ) { return main; });

define('esui/lib/date', [
    'require',
    'moment'
], function (require) {
    var moment = require('moment');
    var date = {};
    date.dateFormats = [
        'YYYYMMDDHHmmss',
        'YYYY-MM-DD HH:mm:ss',
        'YYYY/MM/DD HH:mm:ss',
        'YYYY-MM-DDTHH:mm:ss.SSSZ'
    ];
    date.format = function (source, pattern) {
        return moment(source).format(pattern);
    };
    date.parse = function (source, format) {
        var dateTime = moment(source, format || date.dateFormats);
        return dateTime.toDate();
    };
    return { date: date };
});

define('esui/lib/page', ['require'], function (require) {
    var documentElement = document.documentElement;
    var body = document.body;
    var viewRoot = document.compatMode == 'BackCompat' ? body : documentElement;
    var page = {};
    page.getWidth = function () {
        return Math.max(documentElement ? documentElement.scrollWidth : 0, body ? body.scrollWidth : 0, viewRoot ? viewRoot.clientWidth : 0, 0);
    };
    page.getHeight = function () {
        return Math.max(documentElement ? documentElement.scrollHeight : 0, body ? body.scrollHeight : 0, viewRoot ? viewRoot.clientHeight : 0, 0);
    };
    page.getViewWidth = function () {
        return viewRoot ? viewRoot.clientWidth : 0;
    };
    page.getViewHeight = function () {
        return viewRoot ? viewRoot.clientHeight : 0;
    };
    page.getScrollTop = function () {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    };
    page.getScrollLeft = function () {
        return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    };
    page.getClientTop = function () {
        return document.documentElement.clientTop || document.body.clientTop || 0;
    };
    page.getClientLeft = function () {
        return document.documentElement.clientLeft || document.body.clientLeft || 0;
    };
    return { page: page };
});

define('esui/lib/event', [
    'require',
    './dom',
    './page'
], function (require) {
    var dom = require('./dom');
    var page = require('./page').page;
    var event = {};
    event.preventDefault = function (event) {
        event = event || window.event;
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    };
    event.stopPropagation = function (event) {
        event = event || window.event;
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    };
    event.getMousePosition = function (event) {
        event = event || window.event;
        if (typeof event.pageX !== 'number') {
            event.pageX = event.clientX + page.getScrollLeft() - page.getClientLeft();
        }
        if (typeof event.pageY !== 'number') {
            event.pageY = event.clientY + page.getScrollTop() - page.getClientTop();
        }
        return event;
    };
    event.getTarget = function (event) {
        event = event || window.event;
        return event.target || event.srcElement;
    };
    return {
        on: function (element, type, listener) {
            element = dom.g(element);
            if (element.addEventListener) {
                element.addEventListener(type, listener, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + type, listener);
            }
        },
        un: function (element, type, listener) {
            element = dom.g(element);
            if (element.addEventListener) {
                element.removeEventListener(type, listener, false);
            } else if (element.attachEvent) {
                element.detachEvent('on' + type, listener);
            }
        },
        event: event
    };
});

define('esui/lib/lang', [
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    var lib = {};
    var counter = 8785925;
    lib.getGUID = function (prefix) {
        prefix = prefix || 'esui';
        return prefix + counter++;
    };
    lib.inherits = function (subClass, superClass) {
        var Empty = function () {
        };
        Empty.prototype = superClass.prototype;
        var selfPrototype = subClass.prototype;
        var proto = subClass.prototype = new Empty();
        for (var key in selfPrototype) {
            proto[key] = selfPrototype[key];
        }
        subClass.prototype.constructor = subClass;
        subClass.superClass = superClass.prototype;
        return subClass;
    };
    lib.clone = function (source) {
        if (!source || typeof source !== 'object') {
            return source;
        }
        var result = source;
        if (u.isArray(source)) {
            result = u.clone(source);
        } else if ({}.toString.call(source) === '[object Object]' && 'isPrototypeOf' in source) {
            result = {};
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    result[key] = lib.deepClone(source[key]);
                }
            }
        }
        return result;
    };
    lib.deepClone = lib.clone;
    lib.toDictionary = function (array) {
        var dictionary = {};
        u.each(array, function (value) {
            dictionary[value] = true;
        });
        return dictionary;
    };
    lib.isArray = u.isArray;
    lib.toArray = u.toArray;
    lib.extend = u.extend;
    lib.bind = u.bind;
    lib.curry = u.partial;
    lib.indexOf = u.indexOf;
    lib.decodeHTML = u.unescape;
    lib.encodeHTML = u.escape;
    return lib;
});

define('esui/lib', [
    'require',
    'underscore',
    './lib/attribute',
    './lib/class',
    './lib/date',
    './lib/dom',
    './lib/event',
    './lib/lang',
    './lib/page',
    './lib/string'
], function (require) {
    var lib = {};
    var u = require('underscore');
    if (/msie (\d+\.\d+)/i.test(navigator.userAgent)) {
        lib.ie = document.documentMode || +RegExp.$1;
    }
    u.extend(lib, require('./lib/attribute'), require('./lib/class'), require('./lib/date'), require('./lib/dom'), require('./lib/event'), require('./lib/lang'), require('./lib/page'), require('./lib/string'));
    return lib;
});

define('esui/ControlCollection', [
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    function ControlCollection() {
        this.length = 0;
    }
    ControlCollection.prototype.splice = Array.prototype.splice;
    ControlCollection.prototype.add = function (control) {
        var index = u.indexOf(this, control);
        if (index < 0) {
            [].push.call(this, control);
        }
    };
    ControlCollection.prototype.remove = function (control) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === control) {
                [].splice.call(this, i, 1);
                return;
            }
        }
    };
    ControlCollection.prototype.each = function (iterator, thisObject) {
        u.each(this, function (control, i) {
            iterator.call(thisObject || control, control, i, this);
        });
    };
    ControlCollection.prototype.invoke = function (methodName) {
        var args = [this];
        args.push.apply(args, arguments);
        return u.invoke.apply(u, args);
    };
    u.each([
        'enable',
        'disable',
        'setDisabled',
        'show',
        'hide',
        'toggle',
        'addChild',
        'removeChild',
        'set',
        'setProperties',
        'addState',
        'removeState',
        'toggleState',
        'on',
        'off',
        'fire',
        'dispose',
        'destroy',
        'setViewContext',
        'render',
        'repaint',
        'appendTo',
        'insertBefore'
    ], function (method) {
        ControlCollection.prototype[method] = function () {
            var args = [method];
            args.push.apply(args, arguments);
            var result = this.invoke.apply(this, args);
            return result && result[0];
        };
    });
    u.each([
        'isDisabled',
        'isHidden',
        'hasState',
        'get',
        'getCategory',
        'getChild',
        'getChildSafely'
    ], function (method) {
        ControlCollection.prototype[method] = function () {
            var first = this[0];
            return first ? first[method].apply(first, arguments) : undefined;
        };
    });
    return ControlCollection;
});

define('esui/SafeWrapper', [
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    function SafeWrapper() {
    }
    u.each([
        'enable',
        'disable',
        'setDisabled',
        'show',
        'hide',
        'toggle',
        'setValue',
        'setRawValue',
        'addChild',
        'removeChild',
        'set',
        'addState',
        'removeState',
        'toggleState',
        'on',
        'off',
        'fire',
        'dispose',
        'destroy',
        'initOptions',
        'createMain',
        'initStructure',
        'setViewContext',
        'render',
        'repaint',
        'appendTo',
        'insertBefore',
        'initChildren',
        'disposeChildren'
    ], function (method) {
        SafeWrapper.prototype[method] = function () {
        };
    });
    u.each([
        'isDisabled',
        'isHidden',
        'hasState',
        'isPropertyChanged'
    ], function (method) {
        SafeWrapper.prototype[method] = function () {
            return false;
        };
    });
    u.each([
        'getRawValue',
        'getChild',
        'get'
    ], function (method) {
        SafeWrapper.prototype[method] = function () {
            return null;
        };
    });
    u.each(['getValue'], function (method) {
        SafeWrapper.prototype[method] = function () {
            return '';
        };
    });
    u.each(['setProperties'], function (method) {
        SafeWrapper.prototype[method] = function () {
            return {};
        };
    });
    SafeWrapper.prototype.getCategory = function () {
        return 'control';
    };
    SafeWrapper.prototype.getChildSafely = function (childName) {
        var wrapper = new SafeWrapper();
        wrapper.childName = childName;
        wrapper.parent = this;
        if (this.viewContext) {
            wrapper.viewContext = this.viewContext;
        }
        return wrapper;
    };
    return SafeWrapper;
});

define('esui/ViewContext', [
    'require',
    './ControlCollection',
    './lib',
    './SafeWrapper'
], function (require) {
    var ControlCollection = require('./ControlCollection');
    function ControlGroup(name) {
        ControlCollection.apply(this, arguments);
        this.name = name;
    }
    require('./lib').inherits(ControlGroup, ControlCollection);
    ControlGroup.prototype.add = undefined;
    ControlGroup.prototype.remove = undefined;
    ControlGroup.prototype.disposeGroup = function () {
        for (var i = 0; i < this.length; i++) {
            delete this[i];
        }
        this.length = 0;
    };
    function addToGroup(control, group) {
        ControlCollection.prototype.add.call(group, control);
    }
    function removeFromGroup(control, group) {
        ControlCollection.prototype.remove.call(group, control);
    }
    function getGroupNames(control) {
        var group = control.get('group');
        return group ? group.split(/[\t\r\n ]/) : [];
    }
    var counter = 8587523;
    function getGUID() {
        return 'vt' + counter++;
    }
    var pool = {};
    function ViewContext(id) {
        this.controls = {};
        this.groups = {};
        id = id || getGUID();
        if (pool.hasOwnProperty(id)) {
            var i = 1;
            var prefix = id + '-';
            while (pool.hasOwnProperty(prefix + i)) {
                i++;
            }
            id = prefix + i;
        }
        this.id = id;
        pool[this.id] = this;
    }
    ViewContext.get = function (id) {
        return pool[id] || null;
    };
    ViewContext.prototype.add = function (control) {
        var exists = this.controls[control.id];
        if (exists) {
            if (exists === control) {
                return;
            }
            exists.setViewContext(null);
        }
        this.controls[control.id] = control;
        var groups = getGroupNames(control);
        for (var i = 0; i < groups.length; i++) {
            var groupName = groups[i];
            if (!groupName) {
                continue;
            }
            var group = this.getGroup(groupName);
            addToGroup(control, group);
        }
        control.setViewContext(this);
    };
    ViewContext.prototype.remove = function (control) {
        delete this.controls[control.id];
        var groups = getGroupNames(control);
        for (var i = 0; i < groups.length; i++) {
            var groupName = groups[i];
            if (!groupName) {
                continue;
            }
            var group = this.getGroup(groupName);
            removeFromGroup(control, group);
        }
        control.setViewContext(null);
    };
    ViewContext.prototype.get = function (id) {
        return this.controls[id];
    };
    var SafeWrapper = require('./SafeWrapper');
    ViewContext.prototype.getSafely = function (id) {
        var control = this.get(id);
        if (!control) {
            control = new SafeWrapper();
            control.id = id;
            control.viewContext = this;
        }
        return control;
    };
    ViewContext.prototype.getGroup = function (name) {
        if (!name) {
            throw new Error('name is unspecified');
        }
        var group = this.groups[name];
        if (!group) {
            group = this.groups[name] = new ControlGroup(name);
        }
        return group;
    };
    ViewContext.prototype.clean = function () {
        for (var id in this.controls) {
            if (this.controls.hasOwnProperty(id)) {
                var control = this.controls[id];
                control.dispose();
                if (control.viewContext && control.viewContext === this) {
                    this.remove(control);
                }
            }
        }
        for (var name in this.groups) {
            if (this.groups.hasOwnProperty(name)) {
                this.groups[name].disposeGroup();
                this.groups[name] = undefined;
            }
        }
    };
    ViewContext.prototype.dispose = function () {
        this.clean();
        delete pool[this.id];
    };
    return ViewContext;
});

define('esui/main', [
    'require',
    './lib',
    './ViewContext',
    './ControlCollection'
], function (require) {
    var lib = require('./lib');
    var main = {};
    main.version = '3.1.0-beta.3';
    var ViewContext = require('./ViewContext');
    var defaultViewContext = new ViewContext('default');
    main.getViewContext = function () {
        return defaultViewContext;
    };
    var config = {
            uiPrefix: 'data-ui',
            extensionPrefix: 'data-ui-extension',
            customElementPrefix: 'esui',
            instanceAttr: 'data-ctrl-id',
            viewContextAttr: 'data-ctrl-view-context',
            uiClassPrefix: 'ui',
            skinClassPrefix: 'skin',
            stateClassPrefix: 'state'
        };
    main.config = function (info) {
        lib.extend(config, info);
    };
    main.getConfig = function (name) {
        return config[name];
    };
    main.parseAttribute = function (source, valueReplacer) {
        if (!source) {
            return {};
        }
        var result = {};
        var lastStop = 0;
        var cursor = 0;
        while (cursor < source.length) {
            while (cursor < source.length && source.charAt(cursor) !== ':') {
                cursor++;
            }
            if (cursor >= source.length) {
                break;
            }
            var key = lib.trim(source.slice(lastStop, cursor));
            cursor++;
            lastStop = cursor;
            while (cursor < source.length && source.charAt(cursor) !== ';') {
                cursor++;
            }
            var lookAheadIndex = cursor + 1;
            while (lookAheadIndex < source.length) {
                var ch = source.charAt(lookAheadIndex);
                if (ch === ';') {
                    cursor = lookAheadIndex;
                }
                if (ch === ':') {
                    break;
                }
                lookAheadIndex++;
            }
            var value = lib.trim(source.slice(lastStop, cursor));
            result[key] = valueReplacer ? valueReplacer(value) : value;
            cursor++;
            lastStop = cursor;
        }
        return result;
    };
    main.getControlByDOM = function (dom) {
        if (!dom) {
            return null;
        }
        var getConf = main.getConfig;
        var controlId = dom.getAttribute(getConf('instanceAttr'));
        var viewContextId = dom.getAttribute(getConf('viewContextAttr'));
        var viewContext;
        if (controlId && viewContextId && (viewContext = ViewContext.get(viewContextId))) {
            return viewContext.get(controlId);
        }
        return null;
    };
    function registerClass(classFunc, container) {
        if (typeof classFunc == 'function') {
            var type = classFunc.prototype.type;
            if (type in container) {
                throw new Error(type + ' is exists!');
            }
            container[type] = classFunc;
        }
    }
    function createInstance(type, options, container) {
        var Constructor = container[type];
        if (Constructor) {
            delete options.type;
            return new Constructor(options);
        }
        return null;
    }
    var controlClasses = {};
    main.register = function (controlClass) {
        registerClass(controlClass, controlClasses);
    };
    main.create = function (type, options) {
        return createInstance(type, options, controlClasses);
    };
    main.get = function (id) {
        return defaultViewContext.get(id);
    };
    main.getSafely = function (id) {
        return defaultViewContext.getSafely(id);
    };
    var ControlCollection = require('./ControlCollection');
    main.wrap = function () {
        var collection = new ControlCollection();
        for (var i = 0; i < arguments.length; i++) {
            collection.add(arguments[i]);
        }
        return collection;
    };
    main.init = function (wrap, options) {
        wrap = wrap || document.body;
        options = options || {};
        var valueReplacer = options.valueReplacer || function (value) {
                return value;
            };
        function joinCamelCase(source) {
            function replacer(c) {
                return c.toUpperCase();
            }
            for (var i = 1, len = source.length; i < len; i++) {
                source[i] = source[i].replace(/^[a-z]/, replacer);
            }
            return source.join('');
        }
        function noOverrideExtend(target, source) {
            for (var key in source) {
                if (!(key in target)) {
                    target[key] = source[key];
                }
            }
        }
        function extendToOption(optionObject, terms, value) {
            if (terms.length === 0) {
                noOverrideExtend(optionObject, main.parseAttribute(value, valueReplacer));
            } else {
                optionObject[joinCamelCase(terms)] = valueReplacer(value);
            }
        }
        var rawElements = wrap.getElementsByTagName('*');
        var elements = [];
        for (var i = 0, len = rawElements.length; i < len; i++) {
            if (rawElements[i].nodeType === 1) {
                elements.push(rawElements[i]);
            }
        }
        var uiPrefix = main.getConfig('uiPrefix');
        var extPrefix = main.getConfig('extensionPrefix');
        var customElementPrefix = main.getConfig('customElementPrefix');
        var uiPrefixLen = uiPrefix.length;
        var extPrefixLen = extPrefix.length;
        var properties = options.properties || {};
        var controls = [];
        for (var i = 0, len = elements.length; i < len; i++) {
            var element = elements[i];
            if (element.getAttribute(config.instanceAttr)) {
                continue;
            }
            var attributes = element.attributes;
            var controlOptions = {};
            var extensionOptions = {};
            for (var j = 0, attrLen = attributes.length; j < attrLen; j++) {
                var attribute = attributes[j];
                var name = attribute.name;
                var value = attribute.value;
                if (name.indexOf(extPrefix) === 0) {
                    var terms = name.slice(extPrefixLen + 1).split('-');
                    var extKey = terms[0];
                    terms.shift();
                    var extOption = extensionOptions[extKey];
                    if (!extOption) {
                        extOption = extensionOptions[extKey] = {};
                    }
                    extendToOption(extOption, terms, value);
                } else if (name.indexOf(uiPrefix) === 0) {
                    var terms = name.length == uiPrefixLen ? [] : name.slice(uiPrefixLen + 1).split('-');
                    extendToOption(controlOptions, terms, value);
                }
            }
            var type = controlOptions.type;
            if (!type) {
                var nodeName = element.nodeName.toLowerCase();
                var esuiPrefixIndex = nodeName.indexOf(customElementPrefix);
                if (esuiPrefixIndex === 0) {
                    var typeFromCustomElement = nodeName.replace(/-(\S)/g, function (match, ch) {
                            return ch.toUpperCase();
                        });
                    typeFromCustomElement = typeFromCustomElement.slice(customElementPrefix.length);
                    controlOptions.type = typeFromCustomElement;
                    type = typeFromCustomElement;
                }
            }
            if (type) {
                var controlId = controlOptions.id;
                var customOptions = controlId ? properties[controlId] : {};
                for (var key in customOptions) {
                    controlOptions[key] = valueReplacer(customOptions[key]);
                }
                var extensions = controlOptions.extensions || [];
                controlOptions.extensions = extensions;
                for (var key in extensionOptions) {
                    var extOption = extensionOptions[key];
                    var extension = main.createExtension(extOption.type, extOption);
                    extension && extensions.push(extension);
                }
                controlOptions.viewContext = options.viewContext;
                controlOptions.renderOptions = options;
                controlOptions.main = element;
                var control = main.create(type, controlOptions);
                if (control) {
                    controls.push(control);
                    if (options.parent) {
                        options.parent.addChild(control);
                    }
                    try {
                        control.render();
                    } catch (ex) {
                        var error = new Error('Render control ' + '"' + (control.id || 'anonymous') + '" ' + 'of type ' + control.type + ' ' + 'failed because: ' + ex.message);
                        error.actualError = ex;
                        throw error;
                    }
                }
            }
        }
        return controls;
    };
    var extensionClasses = {};
    main.registerExtension = function (extensionClass) {
        registerClass(extensionClass, extensionClasses);
    };
    main.createExtension = function (type, options) {
        return createInstance(type, options, extensionClasses);
    };
    var globalExtensionOptions = {};
    main.attachExtension = function (type, options) {
        globalExtensionOptions[type] = options;
    };
    main.createGlobalExtensions = function () {
        var options = globalExtensionOptions;
        var extensions = [];
        for (var i = 0, len = options.length; i < len; i++) {
            var option = options[i];
            var type = option.type;
            var extension;
            if (type) {
                extension = main.create(type, option);
            }
            extension && extensions.push(extension);
        }
        return extensions;
    };
    var ruleClasses = [];
    main.registerRule = function (ruleClass, priority) {
        ruleClasses.push({
            type: ruleClass,
            priority: priority
        });
        ruleClasses.sort(function (x, y) {
            return x.priority - y.priority;
        });
    };
    main.createRulesByControl = function (control) {
        var rules = [];
        for (var i = 0; i < ruleClasses.length; i++) {
            var RuleClass = ruleClasses[i].type;
            if (control.get(RuleClass.prototype.type) != null) {
                rules.push(new RuleClass());
            }
        }
        return rules;
    };
    return main;
});


/** d e f i n e */
define('esui', ['esui/main'], function (target) { return target; });

define('fcui/main', [
    'require',
    'esui/main'
], function (require) {
    return require('esui/main');
});

define('fcui', ['fcui/main'], function ( main ) { return main; });

define('fcui/ViewContext', [
    'require',
    'esui/ViewContext'
], function (require) {
    return require('esui/ViewContext');
});

define('fc-view/view/LifeStage', [
    'require',
    'fc-core'
], function (require) {
    var fc = require('fc-core');
    var LIFE_STAGE = {
            NEW: 1,
            INITED: 2,
            RENDERED: 4,
            REPAINTED: 8,
            DISPOSED: 16
        };
    var LIFE_STAGE_KEY = {};
    (function () {
        for (var k in LIFE_STAGE) {
            if (LIFE_STAGE.hasOwnProperty(k)) {
                LIFE_STAGE_KEY[LIFE_STAGE[k]] = k;
            }
        }
    }());
    if ('function' === typeof Object.freeze) {
        Object.freeze(LIFE_STAGE);
    }
    function LifeStage(control) {
        fc.assert(control && typeof control.fire === 'function', '\u9519\u8BEF\u7684LifeStage\u53C2\u6570\uFF0C\u5FC5\u987B\u4F20\u5165`control`\uFF0C' + '\u4E14`control.fire`\u5FC5\u987B\u662F\u51FD\u6570\u3002');
        this.stage = LIFE_STAGE.NEW;
        this.control = control;
    }
    LifeStage.prototype.changeTo = function (stageKey) {
        if (!(stageKey in LIFE_STAGE_KEY)) {
            throw new Error('\u4E0D\u5B58\u5728\u7684life stage\u503C: ' + stageKey);
        }
        var stageName = LIFE_STAGE_KEY[stageKey];
        this.stage = stageKey;
        this.control.fire(stageName.toLowerCase());
    };
    LifeStage.prototype.reset = function () {
        this.stage = LIFE_STAGE.NEW;
    };
    LifeStage.prototype.is = function (stageKey) {
        return !!(stageKey & this.stage);
    };
    (function () {
        for (var k in LIFE_STAGE) {
            if (LIFE_STAGE.hasOwnProperty(k)) {
                LifeStage[k] = LIFE_STAGE[k];
            }
        }
    }());
    return LifeStage;
});

define('esui/helper/children', [
    'require',
    'underscore',
    '../main'
], function (require) {
    var u = require('underscore');
    var ui = require('../main');
    var helper = {};
    helper.initChildren = function (wrap, options) {
        wrap = wrap || this.control.main;
        options = u.extend({}, this.control.renderOptions, options);
        options.viewContext = this.control.viewContext;
        options.parent = this.control;
        ui.init(wrap, options);
    };
    helper.disposeChildren = function () {
        var children = this.control.children.slice();
        u.each(children, function (child) {
            child.dispose();
        });
        this.children = [];
        this.childrenIndex = {};
    };
    helper.disableChildren = function () {
        u.each(this.control.children, function (child) {
            child.dispose();
        });
    };
    helper.enableChildren = function () {
        u.each(this.control.children, function (child) {
            child.enable();
        });
    };
    return helper;
});

define('esui/helper/dom', [
    'require',
    'underscore',
    '../lib',
    '../main'
], function (require) {
    function getControlClassType(control) {
        var type = control.styleType || control.type;
        return type.toLowerCase();
    }
    function joinByStrike() {
        return [].slice.call(arguments, 0).join('-');
    }
    var u = require('underscore');
    var lib = require('../lib');
    var ui = require('../main');
    var helper = {};
    helper.getPartClasses = function (part) {
        if (part && this.partClassCache && this.partClassCache.hasOwnProperty(part)) {
            return this.partClassCache[part].slice();
        }
        var type = getControlClassType(this.control);
        var skin = this.control.skin;
        var prefix = ui.getConfig('uiClassPrefix');
        var skinPrefix = ui.getConfig('skinClassPrefix');
        var classes = [];
        if (part) {
            classes.push(joinByStrike(prefix, type, part));
            if (skin) {
                classes.push(joinByStrike(skinPrefix, skin, type, part));
            }
            if (!this.partClassCache) {
                this.partClassCache = {};
                this.partClassCache[part] = classes.slice();
            }
        } else {
            classes.push(joinByStrike(prefix, 'ctrl'));
            classes.push(joinByStrike(prefix, type));
            if (skin) {
                classes.push(joinByStrike(skinPrefix, skin), joinByStrike(skinPrefix, skin, type));
            }
        }
        return classes;
    };
    helper.getPartClassName = function (part) {
        return this.getPartClasses(part).join(' ');
    };
    helper.getPrimaryClassName = function (part) {
        var type = getControlClassType(this.control);
        if (part) {
            return joinByStrike(ui.getConfig('uiClassPrefix'), type, part);
        } else {
            return joinByStrike(ui.getConfig('uiClassPrefix'), type);
        }
    };
    helper.addPartClasses = function (part, element) {
        if (typeof element === 'string') {
            element = this.getPart(element);
        }
        element = element || this.control.main;
        if (element) {
            lib.addClasses(element, this.getPartClasses(part));
        }
    };
    helper.removePartClasses = function (part, element) {
        if (typeof element === 'string') {
            element = this.getPart(element);
        }
        element = element || this.control.main;
        if (element) {
            lib.removeClasses(element, this.getPartClasses(part));
        }
    };
    helper.getStateClasses = function (state) {
        if (this.stateClassCache && this.stateClassCache.hasOwnProperty(state)) {
            return this.stateClassCache[state].slice();
        }
        var type = getControlClassType(this.control);
        var getConf = ui.getConfig;
        var classes = [
                joinByStrike(getConf('uiClassPrefix'), type, state),
                joinByStrike(getConf('stateClassPrefix'), state)
            ];
        var skin = this.control.skin;
        if (skin) {
            var skinPrefix = getConf('skinClassPrefix');
            classes.push(joinByStrike(skinPrefix, skin, state), joinByStrike(skinPrefix, skin, type, state));
        }
        if (!this.stateClassCache) {
            this.stateClassCache = {};
            this.stateClassCache[state] = classes.slice();
        }
        return classes;
    };
    helper.addStateClasses = function (state) {
        var element = this.control.main;
        if (element) {
            lib.addClasses(element, this.getStateClasses(state));
        }
    };
    helper.removeStateClasses = function (state) {
        var element = this.control.main;
        if (element) {
            lib.removeClasses(element, this.getStateClasses(state));
        }
    };
    helper.getId = function (part) {
        part = part ? '-' + part : '';
        if (!this.control.domIDPrefix) {
            this.control.domIDPrefix = this.control.viewContext && this.control.viewContext.id;
        }
        var prefix = this.control.domIDPrefix ? this.control.domIDPrefix + '-' : '';
        return 'ctrl-' + prefix + this.control.id + part;
    };
    helper.createPart = function (part, nodeName) {
        nodeName = nodeName || 'div';
        var element = document.createElement(nodeName);
        element.id = this.getId(part);
        this.addPartClasses(part, element);
        return element;
    };
    helper.getPart = function (part) {
        return lib.g(this.getId(part));
    };
    helper.isPart = function (element, part) {
        var className = this.getPartClasses(part)[0];
        return lib.hasClass(element, className);
    };
    var INPUT_SPECIFIED_ATTRIBUTES = {
            type: true,
            name: true,
            alt: true,
            autocomplete: true,
            autofocus: true,
            checked: true,
            dirname: true,
            disabled: true,
            form: true,
            formaction: true,
            formenctype: true,
            formmethod: true,
            formnovalidate: true,
            formtarget: true,
            width: true,
            height: true,
            inputmode: true,
            list: true,
            max: true,
            maxlength: true,
            min: true,
            minlength: true,
            multiple: true,
            pattern: true,
            placeholder: true,
            readonly: true,
            required: true,
            size: true,
            src: true,
            step: true,
            value: true
        };
    helper.replaceMain = function (main) {
        main = main || this.control.createMain();
        var initialMain = this.control.main;
        initialMain.setAttribute(ui.getConfig('instanceAttr'), lib.getGUID());
        var attributes = initialMain.attributes;
        for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i];
            var name = attribute.name;
            if (lib.hasAttribute(initialMain, name) && !INPUT_SPECIFIED_ATTRIBUTES.hasOwnProperty(name)) {
                lib.setAttribute(main, name, attribute.value);
            }
        }
        lib.insertBefore(main, initialMain);
        initialMain.parentNode.removeChild(initialMain);
        this.control.main = main;
        return initialMain;
    };
    var INPUT_PROPERTY_MAPPING = {
            name: { name: 'name' },
            maxlength: {
                name: 'maxLength',
                type: 'number'
            },
            required: {
                name: 'required',
                type: 'boolean'
            },
            pattern: { name: 'pattern' },
            min: {
                name: 'min',
                type: 'number'
            },
            max: {
                name: 'max',
                type: 'number'
            },
            autofocus: {
                name: 'autoFocus',
                type: 'boolean'
            },
            disabled: {
                name: 'disabled',
                type: 'boolean'
            },
            readonly: {
                name: 'readOnly',
                type: 'boolean'
            }
        };
    helper.extractOptionsFromInput = function (input, options) {
        var result = {};
        u.each(INPUT_PROPERTY_MAPPING, function (config, attributeName) {
            var specified = lib.hasAttribute(input, attributeName);
            if (specified) {
                var value = lib.getAttribute(input, attributeName);
                switch (config.type) {
                case 'boolean':
                    value = specified;
                    break;
                case 'number':
                    value = parseInt(value, 10);
                    break;
                }
                result[config.name] = value;
            }
        });
        if (lib.hasAttribute(input, 'value') || input.nodeName.toLowerCase() !== 'select' && input.value) {
            result.value = input.value;
        }
        return u.defaults(options || {}, result);
    };
    return helper;
});

define('esui/helper/event', [
    'require',
    'underscore',
    'mini-event/EventQueue',
    '../lib',
    'mini-event'
], function (require) {
    var DOM_EVENTS_KEY = '_esuiDOMEvent';
    var globalEvents = {
            window: {},
            document: {},
            documentElement: {},
            body: {}
        };
    var u = require('underscore');
    var EventQueue = require('mini-event/EventQueue');
    var lib = require('../lib');
    var helper = {};
    function getGlobalEventPool(element) {
        if (element === window) {
            return globalEvents.window;
        }
        if (element === document) {
            return globalEvents.document;
        }
        if (element === document.documentElement) {
            return globalEvents.documentElement;
        }
        if (element === document.body) {
            return globalEvents.body;
        }
        return null;
    }
    function triggerGlobalDOMEvent(element, e) {
        var pool = getGlobalEventPool(element);
        if (!pool) {
            return;
        }
        var queue = pool[e.type];
        if (!queue) {
            return;
        }
        u.each(queue, function (control) {
            triggerDOMEvent(control, element, e);
        });
    }
    function debounce(fn, interval) {
        interval = interval || 150;
        var timer = 0;
        return function (e) {
            clearTimeout(timer);
            var self = this;
            e = e || window.event;
            e = {
                type: e.type,
                srcElement: e.srcElement,
                target: e.target,
                currentTarget: e.currentTarget
            };
            timer = setTimeout(function () {
                fn.call(self, e);
            }, interval);
        };
    }
    function addGlobalDOMEvent(control, type, element) {
        var pool = getGlobalEventPool(element);
        if (!pool) {
            return false;
        }
        var controls = pool[type];
        if (!controls) {
            controls = pool[type] = [];
            var handler = u.partial(triggerGlobalDOMEvent, element);
            if (type === 'resize' || type === 'scroll') {
                handler = debounce(handler);
            }
            controls.handler = handler;
            lib.on(element, type, controls.handler);
        }
        if (u.indexOf(controls, control) >= 0) {
            return;
        }
        controls.push(control);
        return true;
    }
    function removeGlobalDOMEvent(control, type, element) {
        var pool = getGlobalEventPool(element);
        if (!pool) {
            return false;
        }
        if (!pool[type]) {
            return true;
        }
        var controls = pool[type];
        for (var i = 0; i < controls.length; i++) {
            if (controls[i] === control) {
                controls.splice(i, 1);
                break;
            }
        }
        if (!controls.length) {
            var handler = controls.handler;
            lib.un(element, type, handler);
            pool[type] = null;
        }
        return true;
    }
    function triggerDOMEvent(control, element, e) {
        e = e || window.event;
        var isInIgnoringState = u.any(control.ignoreStates, function (state) {
                return control.hasState(state);
            });
        if (isInIgnoringState) {
            return;
        }
        if (!e.target) {
            e.target = e.srcElement;
        }
        if (!e.currentTarget) {
            e.currentTarget = element;
        }
        if (!e.preventDefault) {
            e.preventDefault = function () {
                e.returnValue = false;
            };
        }
        if (!e.stopPropagation) {
            e.stopPropagation = function () {
                e.cancelBubble = true;
            };
        }
        var queue = control.domEvents[e.currentTarget[DOM_EVENTS_KEY]][e.type];
        if (!queue) {
            return;
        }
        queue.execute(e, control);
    }
    helper.addDOMEvent = function (element, type, handler) {
        if (typeof element === 'string') {
            element = this.getPart(element);
        }
        if (!this.control.domEvents) {
            this.control.domEvents = {};
        }
        var guid = element[DOM_EVENTS_KEY];
        if (!guid) {
            guid = element[DOM_EVENTS_KEY] = lib.getGUID();
        }
        var events = this.control.domEvents[guid];
        if (!events) {
            events = this.control.domEvents[guid] = { element: element };
        }
        var isGlobal = addGlobalDOMEvent(this.control, type, element);
        var queue = events[type];
        if (!queue) {
            queue = events[type] = new EventQueue();
            if (!isGlobal) {
                queue.handler = u.partial(triggerDOMEvent, this.control, element);
                lib.on(element, type, queue.handler);
            }
        }
        queue.add(handler);
    };
    helper.delegateDOMEvent = function (element, type, newType) {
        var handler = function (e) {
            var event = require('mini-event').fromDOMEvent(e);
            this.fire(newType || e.type, event);
            if (event.isDefaultPrevented()) {
                lib.event.preventDefault(e);
            }
            if (event.isPropagationStopped()) {
                lib.event.stopPropagation(e);
            }
        };
        this.addDOMEvent(element, type, handler);
    };
    helper.removeDOMEvent = function (element, type, handler) {
        if (typeof element === 'string') {
            element = this.getPart(element);
        }
        if (!this.control.domEvents) {
            return;
        }
        var guid = element[DOM_EVENTS_KEY];
        var events = this.control.domEvents[guid];
        if (!events || !events[type]) {
            return;
        }
        if (!handler) {
            events[type].clear();
        } else {
            var queue = events[type];
            queue.remove(handler);
            if (!queue.getLength()) {
                removeGlobalDOMEvent(this.control, type, element);
            }
        }
    };
    helper.clearDOMEvents = function (element) {
        if (typeof element === 'string') {
            element = this.getPart(element);
        }
        if (!this.control.domEvents) {
            return;
        }
        if (!element) {
            u.each(u.pluck(this.control.domEvents, 'element'), this.clearDOMEvents, this);
            this.control.domEvents = null;
            return;
        }
        var guid = element[DOM_EVENTS_KEY];
        var events = this.control.domEvents[guid];
        delete events.element;
        u.each(events, function (queue, type) {
            var isGlobal = removeGlobalDOMEvent(this.control, type, element);
            if (!isGlobal) {
                var handler = queue.handler;
                queue.dispose();
                queue.handler = null;
                lib.un(element, type, handler);
            }
        }, this);
        delete this.control.domEvents[guid];
    };
    return helper;
});

define('esui/helper/html', ['require'], function (require) {
    var helper = {};
    var SELF_CLOSING_TAGS = {
            area: true,
            base: true,
            br: true,
            col: true,
            embed: true,
            hr: true,
            img: true,
            input: true,
            keygen: true,
            link: true,
            meta: true,
            param: true,
            source: true,
            track: true,
            wbr: true
        };
    helper.getPartBeginTag = function (part, nodeName) {
        var html = '<' + nodeName + ' id="' + this.getId(part) + '" ' + 'class="' + this.getPartClassName(part) + '">';
        return html;
    };
    helper.getPartEndTag = function (part, nodeName) {
        var html = SELF_CLOSING_TAGS.hasOwnProperty(nodeName) ? ' />' : '</' + nodeName + '>';
        return html;
    };
    helper.getPartHTML = function (part, nodeName) {
        return this.getPartBeginTag(part, nodeName) + this.getPartEndTag(part, nodeName);
    };
    return helper;
});

define('esui/helper/life', [
    'require',
    'underscore',
    '../main'
], function (require) {
    var LifeCycle = {
            NEW: 0,
            INITED: 1,
            RENDERED: 2,
            DISPOSED: 4
        };
    var u = require('underscore');
    var ui = require('../main');
    var helper = {};
    helper.initViewContext = function () {
        var viewContext = this.control.viewContext || ui.getViewContext();
        this.control.viewContext = null;
        this.control.setViewContext(viewContext);
    };
    helper.initExtensions = function () {
        var extensions = this.control.extensions;
        if (!u.isArray(extensions)) {
            extensions = this.control.extensions = [];
        }
        Array.prototype.push.apply(extensions, ui.createGlobalExtensions());
        var registeredExtensions = {};
        for (var i = 0; i < extensions.length; i++) {
            var extension = extensions[i];
            if (!registeredExtensions[extension.type]) {
                extension.attachTo(this.control);
                registeredExtensions[extension.type] = true;
            }
        }
    };
    helper.isInStage = function (stage) {
        if (LifeCycle[stage] == null) {
            throw new Error('Invalid life cycle stage: ' + stage);
        }
        return this.control.stage == LifeCycle[stage];
    };
    helper.changeStage = function (stage) {
        if (LifeCycle[stage] == null) {
            throw new Error('Invalid life cycle stage: ' + stage);
        }
        this.control.stage = LifeCycle[stage];
    };
    helper.dispose = function () {
        this.control.disposeChildren();
        this.control.children = null;
        this.control.childrenIndex = null;
        this.clearDOMEvents();
        u.invoke(this.control.extensions, 'dispose');
        this.control.extensions = null;
        if (this.control.parent) {
            this.control.parent.removeChild(this.control);
        }
        if (this.control.viewContext) {
            this.control.viewContext.remove(this.control);
        }
        this.control.renderOptions = null;
    };
    helper.beforeDispose = function () {
        this.control.fire('beforedispose');
    };
    helper.afterDispose = function () {
        this.changeStage('DISPOSED');
        this.control.fire('afterdispose');
        this.control.destroyEvents();
    };
    return helper;
});

define('esui/helper/template', [
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    var FILTERS = {
            'id': function (part, instance) {
                return instance.helper.getId(part);
            },
            'class': function (part, instance) {
                return instance.helper.getPartClassName(part);
            },
            'part': function (part, nodeName, instance) {
                return instance.helper.getPartHTML(part, nodeName);
            }
        };
    var helper = {};
    helper.setTemplateEngine = function (engine) {
        this.templateEngine = engine;
        if (!engine.esui) {
            this.initializeTemplateEngineExtension();
        }
    };
    helper.initializeTemplateEngineExtension = function () {
        u.each(FILTERS, function (filter, name) {
            this.addFilter(name, filter);
        }, this.templateEngine);
    };
    helper.renderTemplate = function (target, data) {
        var helper = this;
        data = data || {};
        var templateData = {
                get: function (name) {
                    if (name === 'instance') {
                        return helper.control;
                    }
                    if (typeof data.get === 'function') {
                        return data.get(name);
                    }
                    var propertyName = name;
                    var filter = null;
                    var indexOfDot = name.lastIndexOf('.');
                    if (indexOfDot >= 0) {
                        propertyName = name.substring(0, indexOfDot);
                        var filterName = name.substring(indexOfDot + 1);
                        if (filterName && FILTERS.hasOwnProperty(filterName)) {
                            filter = FILTERS[filterName];
                        }
                    }
                    var value = data.hasOwnProperty(propertyName) ? data[propertyName] : propertyName;
                    if (filter) {
                        value = filter(value, helper.control);
                    }
                    return value;
                }
            };
        if (!this.templateEngine) {
            throw new Error('No template engine attached to this control');
        }
        return this.templateEngine.render(target, templateData);
    };
    return helper;
});

define('esui/Helper', [
    'require',
    'underscore',
    './helper/children',
    './helper/dom',
    './helper/event',
    './helper/html',
    './helper/life',
    './helper/template'
], function (require) {
    var u = require('underscore');
    function Helper(control) {
        this.control = control;
    }
    u.extend(Helper.prototype, require('./helper/children'), require('./helper/dom'), require('./helper/event'), require('./helper/html'), require('./helper/life'), require('./helper/template'));
    return Helper;
});

define('esui/Control', [
    'require',
    './lib',
    'underscore',
    './main',
    './Helper',
    './SafeWrapper',
    'mini-event/EventTarget'
], function (require) {
    var lib = require('./lib');
    var u = require('underscore');
    var ui = require('./main');
    var Helper = require('./Helper');
    function Control(options) {
        options = options || {};
        this.helper = new Helper(this);
        this.helper.changeStage('NEW');
        this.children = [];
        this.childrenIndex = {};
        this.currentStates = {};
        this.domEvents = {};
        this.main = options.main ? options.main : this.createMain(options);
        if (!this.id && !options.id) {
            this.id = lib.getGUID();
        }
        this.initOptions(options);
        this.helper.initViewContext();
        this.helper.initExtensions();
        this.helper.changeStage('INITED');
        this.fire('init');
    }
    Control.prototype = {
        constructor: Control,
        ignoreStates: ['disabled'],
        getCategory: function () {
            return 'control';
        },
        initOptions: function (options) {
            options = options || {};
            this.setProperties(options);
        },
        createMain: function () {
            if (!this.type) {
                return document.createElement('div');
            }
            var name = this.type.replace(/([A-Z])/g, function (match, ch) {
                    return '-' + ch.toLowerCase();
                });
            return document.createElement(ui.getConfig('customElementPrefix') + '-' + name.slice(1));
        },
        initStructure: function () {
        },
        initEvents: function () {
        },
        render: function () {
            if (this.helper.isInStage('INITED')) {
                this.fire('beforerender');
                this.domIDPrefix = this.viewContext.id;
                this.initStructure();
                this.initEvents();
                if (!this.main.id) {
                    this.main.id = this.helper.getId();
                }
                this.main.setAttribute(ui.getConfig('instanceAttr'), this.id);
                this.main.setAttribute(ui.getConfig('viewContextAttr'), this.viewContext.id);
                this.helper.addPartClasses();
                if (this.states) {
                    this.states = typeof this.states === 'string' ? this.states.split(' ') : this.states;
                    u.each(this.states, this.addState, this);
                }
            }
            this.repaint();
            if (this.helper.isInStage('INITED')) {
                this.helper.changeStage('RENDERED');
                this.fire('afterrender');
            }
        },
        repaint: function (changes, changesIndex) {
            if (!changesIndex || changesIndex.hasOwnProperty('disabled')) {
                var method = this.disabled ? 'addState' : 'removeState';
                this[method]('disabled');
            }
            if (!changesIndex || changesIndex.hasOwnProperty('hidden')) {
                var method = this.hidden ? 'addState' : 'removeState';
                this[method]('hidden');
            }
        },
        appendTo: function (wrap) {
            if (wrap instanceof Control) {
                wrap = wrap.main;
            }
            wrap.appendChild(this.main);
            if (this.helper.isInStage('NEW') || this.helper.isInStage('INITED')) {
                this.render();
            }
        },
        insertBefore: function (reference) {
            if (reference instanceof Control) {
                reference = reference.main;
            }
            reference.parentNode.insertBefore(this.main, reference);
            if (this.helper.isInStage('NEW') || this.helper.isInStage('INITED')) {
                this.render();
            }
        },
        dispose: function () {
            if (!this.helper.isInStage('DISPOSED')) {
                this.helper.beforeDispose();
                this.helper.dispose();
                this.helper.afterDispose();
            }
        },
        destroy: function () {
            var main = this.main;
            this.dispose();
            lib.removeNode(main);
        },
        get: function (name) {
            var method = this['get' + lib.pascalize(name)];
            if (typeof method == 'function') {
                return method.call(this);
            }
            return this[name];
        },
        set: function (name, value) {
            var method = this['set' + lib.pascalize(name)];
            if (typeof method == 'function') {
                return method.call(this, value);
            }
            var property = {};
            property[name] = value;
            this.setProperties(property);
        },
        isPropertyChanged: function (propertyName, newValue, oldValue) {
            return oldValue !== newValue;
        },
        setProperties: function (properties) {
            if (!this.stage) {
                if (properties.hasOwnProperty('id')) {
                    this.id = properties.id;
                }
                if (properties.hasOwnProperty('group')) {
                    this.group = properties.group;
                }
                if (properties.hasOwnProperty('skin')) {
                    this.skin = properties.skin;
                }
            }
            delete properties.id;
            delete properties.group;
            delete properties.skin;
            if (properties.hasOwnProperty('viewContext')) {
                this.setViewContext(properties.viewContext);
                delete properties.viewContext;
            }
            if (this.hasOwnProperty('disabled')) {
                this.disabled = !!this.disabled;
            }
            if (this.hasOwnProperty('hidden')) {
                this.hidden = !!this.hidden;
            }
            var changes = [];
            var changesIndex = {};
            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    var newValue = properties[key];
                    var getterMethodName = 'get' + lib.pascalize(key) + 'Property';
                    var oldValue = this[getterMethodName] ? this[getterMethodName]() : this[key];
                    var isChanged = this.isPropertyChanged(key, newValue, oldValue);
                    if (isChanged) {
                        this[key] = newValue;
                        var record = {
                                name: key,
                                oldValue: oldValue,
                                newValue: newValue
                            };
                        changes.push(record);
                        changesIndex[key] = record;
                    }
                }
            }
            if (changes.length && this.helper.isInStage('RENDERED')) {
                this.repaint(changes, changesIndex);
            }
            return changesIndex;
        },
        setViewContext: function (viewContext) {
            var oldViewContext = this.viewContext;
            if (oldViewContext == viewContext) {
                return;
            }
            if (oldViewContext) {
                this.viewContext = null;
                oldViewContext.remove(this);
            }
            this.viewContext = viewContext;
            viewContext && viewContext.add(this);
            var children = this.children;
            if (children) {
                for (var i = 0, len = children.length; i < len; i++) {
                    children[i].setViewContext(viewContext);
                }
            }
            if (this.viewContext && this.helper.isInStage('RENDERED')) {
                this.main.setAttribute(ui.getConfig('viewContextAttr'), this.viewContext.id);
            }
        },
        setDisabled: function (disabled) {
            this[disabled ? 'disable' : 'enable']();
        },
        disable: function () {
            this.addState('disabled');
        },
        enable: function () {
            this.removeState('disabled');
        },
        isDisabled: function () {
            return this.hasState('disabled');
        },
        show: function () {
            this.removeState('hidden');
        },
        hide: function () {
            this.addState('hidden');
        },
        toggle: function () {
            this[this.isHidden() ? 'show' : 'hide']();
        },
        isHidden: function () {
            return this.hasState('hidden');
        },
        addState: function (state) {
            if (!this.hasState(state)) {
                this.currentStates[state] = true;
                this.helper.addStateClasses(state);
                var properties = {};
                var statePropertyName = state.replace(/-(\w)/, function (m, c) {
                        return c.toUpperCase();
                    });
                properties[statePropertyName] = true;
                this.setProperties(properties);
            }
        },
        removeState: function (state) {
            if (this.hasState(state)) {
                this.currentStates[state] = false;
                this.helper.removeStateClasses(state);
                var properties = {};
                var statePropertyName = state.replace(/-(\w)/, function (m, c) {
                        return c.toUpperCase();
                    });
                properties[statePropertyName] = false;
                this.setProperties(properties);
            }
        },
        toggleState: function (state) {
            var methodName = this.hasState(state) ? 'removeState' : 'addState';
            this[methodName](state);
        },
        hasState: function (state) {
            return !!this.currentStates[state];
        },
        addChild: function (control, childName) {
            childName = childName || control.childName;
            if (control.parent) {
                control.parent.removeChild(control);
            }
            this.children.push(control);
            control.parent = this;
            if (childName) {
                control.childName = childName;
                this.childrenIndex[childName] = control;
            }
            if (this.viewContext != control.viewContext) {
                control.setViewContext(this.viewContext);
            }
        },
        removeChild: function (control) {
            var children = this.children;
            var len = children.length;
            while (len--) {
                if (children[len] === control) {
                    children.splice(len, 1);
                }
            }
            var childName = control.childName;
            if (childName) {
                this.childrenIndex[childName] = null;
            }
            control.parent = null;
        },
        disposeChildren: function () {
            var children = this.children.slice();
            for (var i = 0; i < children.length; i++) {
                children[i].dispose();
            }
            this.children = [];
            this.childrenIndex = {};
        },
        getChild: function (childName) {
            return this.childrenIndex[childName] || null;
        },
        getChildSafely: function (childName) {
            var child = this.getChild(childName);
            if (!child) {
                var SafeWrapper = require('./SafeWrapper');
                child = new SafeWrapper();
                child.childName = childName;
                child.parent = this;
                if (this.viewContext) {
                    child.viewContext = this.viewContext;
                }
            }
            return child;
        },
        initChildren: function (wrap, options) {
            this.helper.initChildren(wrap, options);
        }
    };
    var EventTarget = require('mini-event/EventTarget');
    lib.inherits(Control, EventTarget);
    return Control;
});

define('esui/painters', [
    'require',
    'underscore',
    './lib'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var painters = {};
    painters.state = function (name) {
        return {
            name: name,
            paint: function (control, value) {
                var method = value ? 'addState' : 'removeState';
                control[method](this.name);
            }
        };
    };
    painters.attribute = function (name, attribute, value) {
        return {
            name: name,
            attribute: attribute || name,
            value: value,
            paint: function (control, value) {
                value = this.value == null ? value : this.value;
                control.main.setAttribute(this.attribute, value);
            }
        };
    };
    var unitProperties = {
            width: true,
            height: true,
            top: true,
            right: true,
            bottom: true,
            left: true,
            fontSize: true,
            padding: true,
            paddingTop: true,
            paddingRight: true,
            paddingBottom: true,
            paddingLeft: true,
            margin: true,
            marginTop: true,
            marginRight: true,
            marginBottom: true,
            marginLeft: true,
            borderWidth: true,
            borderTopWidth: true,
            borderRightWidth: true,
            borderBottomWidth: true,
            borderLeftWidth: true
        };
    painters.style = function (name, property) {
        return {
            name: name,
            property: property || name,
            paint: function (control, value) {
                if (value == null) {
                    return;
                }
                if (unitProperties.hasOwnProperty(this.property)) {
                    value = value === 0 ? '0' : value + 'px';
                }
                control.main.style[this.property] = value;
            }
        };
    };
    painters.html = function (name, element, generate) {
        return {
            name: name,
            element: element || '',
            generate: generate,
            paint: function (control, value) {
                var element = typeof this.element === 'function' ? this.element(control) : this.element ? control.helper.getPart(this.element) : control.main;
                if (element) {
                    var html = typeof this.generate === 'function' ? this.generate(control, value) : value;
                    element.innerHTML = html || '';
                }
            }
        };
    };
    painters.text = function (name, element, generate) {
        return {
            name: name,
            element: element || '',
            generate: generate,
            paint: function (control, value) {
                var element = typeof this.element === 'function' ? this.element(control) : this.element ? control.helper.getPart(this.element) : control.main;
                if (element) {
                    var html = typeof this.generate === 'function' ? this.generate(control, value) : value;
                    element.innerHTML = u.escape(html || '');
                }
            }
        };
    };
    painters.delegate = function (name, member, method) {
        return {
            name: name,
            member: this.member,
            method: this.method,
            paint: function (control, value) {
                control[this.member][this.method](value);
            }
        };
    };
    painters.createRepaint = function () {
        var painters = [].concat.apply([], [].slice.call(arguments));
        return function (changes, changesIndex) {
            var index = lib.extend({}, changesIndex);
            for (var i = 0; i < painters.length; i++) {
                var painter = painters[i];
                if (typeof painter === 'function') {
                    painter.apply(this, arguments);
                    continue;
                }
                var propertyNames = [].concat(painter.name);
                var shouldPaint = !changes;
                if (!shouldPaint) {
                    for (var j = 0; j < propertyNames.length; j++) {
                        var name = propertyNames[j];
                        if (changesIndex.hasOwnProperty(name)) {
                            shouldPaint = true;
                            break;
                        }
                    }
                }
                if (!shouldPaint) {
                    continue;
                }
                var properties = [this];
                for (var j = 0; j < propertyNames.length; j++) {
                    var name = propertyNames[j];
                    properties.push(this[name]);
                    delete index[name];
                }
                try {
                    painter.paint.apply(painter, properties);
                } catch (ex) {
                    var paintingPropertyNames = '"' + propertyNames.join('", "') + '"';
                    var error = new Error('Failed to paint [' + paintingPropertyNames + '] ' + 'for control "' + (this.id || 'anonymous') + '" ' + 'of type ' + this.type + ' ' + 'because: ' + ex.message);
                    error.actualError = error;
                    throw error;
                }
            }
            var unpainted = [];
            for (var key in index) {
                if (index.hasOwnProperty(key)) {
                    unpainted.push(index[key]);
                }
            }
            return unpainted;
        };
    };
    return painters;
});

define('esui/Panel', [
    'require',
    'underscore',
    './lib',
    './Control',
    './painters',
    './main'
], function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var Control = require('./Control');
    function Panel() {
        Control.apply(this, arguments);
    }
    Panel.prototype.type = 'Panel';
    Panel.prototype.getCategory = function () {
        return 'container';
    };
    Panel.prototype.createMain = function (options) {
        if (!options.tagName) {
            return Control.prototype.createMain.call(this);
        }
        return document.createElement(options.tagName);
    };
    Panel.prototype.initOptions = function (options) {
        var properties = {};
        u.extend(properties, options);
        properties.tagName = this.main.nodeName.toLowerCase();
        this.setProperties(properties);
    };
    Panel.prototype.repaint = require('./painters').createRepaint(Control.prototype.repaint, {
        name: 'content',
        paint: function (panel, content) {
            if (content != null) {
                panel.helper.disposeChildren();
                panel.main.innerHTML = content;
            }
            panel.helper.initChildren();
        }
    });
    Panel.prototype.setContent = function (html) {
        this.setProperties({ content: html });
    };
    function normalizeStyleName(name) {
        if (name.indexOf('-') >= 0) {
            name = name.replace(/-\w/g, function (word) {
                return word.charAt(1).toUpperCase();
            });
        }
        return name;
    }
    Panel.prototype.getStyle = function (name) {
        name = normalizeStyleName(name);
        return this.main ? this.main.style[name] : '';
    };
    Panel.prototype.setStyle = function (name, value) {
        name = normalizeStyleName(name);
        if (this.main) {
            this.main.style[name] = value || '';
        }
    };
    lib.inherits(Panel, Control);
    require('./main').register(Panel);
    return Panel;
});

define('fcui/Panel', [
    'require',
    'esui/Panel'
], function (require) {
    return require('esui/Panel');
});

define('fc-view/view/BasicView', [
    'require',
    'underscore',
    'fc-core',
    'fcui',
    'fc-core/Promise',
    'fcui/ViewContext',
    './LifeStage',
    'fcui/Panel',
    'ef/ActionPanel',
    'fc-core/EventTarget'
], function (require) {
    var _ = require('underscore');
    var fc = require('fc-core');
    var fcui = require('fcui');
    var Promise = require('fc-core/Promise');
    var ViewContext = require('fcui/ViewContext');
    var LifeStage = require('./LifeStage');
    require('fcui/Panel');
    require('ef/ActionPanel');
    var supportHtml5 = function () {
            try {
                document.createElement('canvas').getContext('2d');
                return true;
            } catch (e) {
                return false;
            }
        }();
    var domEventOn = function (element, type, listener) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element.addEventListener) {
            element.addEventListener(type, listener, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + type, listener);
        }
    };
    var BASIC_CLASS = 'view-basic';
    var proto = {};
    proto.constructor = function (options) {
        options = options || {};
        this.guid = fc.util.guid();
        this.name += '-' + this.guid;
        this.lifeStage = new LifeStage(this);
        this.options = options;
        this.container = options.container;
        this.viewContext = new ViewContext(this.name);
        if (options.template) {
            this.template = options.template;
        }
        if (options.templateName) {
            this.templateName = options.templateName;
        }
        this.lifeStage.changeTo(LifeStage.INITED);
    };
    proto.name = 'fc-view-basicView';
    proto.getClassName = function () {
        var className = BASIC_CLASS + (supportHtml5 ? ' html5' : '');
        if (this.options.className) {
            className += ' ' + this.options.className;
        }
        return className;
    };
    proto.handleError = function (e) {
        fc.util.processError(e);
    };
    proto.get = function (id) {
        return this.viewContext.get(id);
    };
    proto.getSafely = function (id) {
        return this.viewContext.getSafely(id);
    };
    proto.getGroup = function (groupid) {
        if (!groupid) {
            throw new Error('groupid is unspecified');
        }
        return this.viewContext.getGroup(groupid);
    };
    proto.getModel = function () {
        var me = this;
        if (me.model) {
            return me.model;
        }
        if (typeof me.options.model === 'function') {
            var modelResult = me.options.model();
            if (Promise.isPromise(modelResult)) {
                return modelResult.then(function (result) {
                    me.model = result;
                }, _.bind(me.handleError, me));
            }
            me.model = modelResult;
            return me.model;
        }
        return {};
    };
    proto.uiProperties = null;
    proto.getUIProperties = function () {
        return this.uiProperties || {};
    };
    proto.uiEvents = null;
    proto.getUIEvents = function () {
        return this.uiEvents || {};
    };
    function getProperty(target, path) {
        var value = target;
        for (var i = 0; i < path.length; i++) {
            value = value[path[i]];
        }
        return value;
    }
    proto.replaceValue = function (value) {
        if (typeof value !== 'string') {
            return value;
        }
        if (value === '@@' || value === '**') {
            return this.getModel();
        }
        var prefix = value.charAt(0);
        var actualValue = value.substring(1);
        if (prefix === '@' || prefix === '*') {
            var path = actualValue.split('.');
            var value = typeof this.model.get === 'function' ? this.model.get(path[0]) : this.model[path[0]];
            return path.length > 1 ? getProperty(value, path.slice(1)) : value;
        } else {
            return value;
        }
    };
    proto.initStructure = function () {
        fc.assert.has(this.viewContext, '\u521B\u5EFA\u5BB9\u5668\u65F6\u5FC5\u987B\u5DF2\u7ECF\u521B\u5EFA\u4E86ViewContext');
        if (typeof this.container === 'string') {
            this.container = document.getElementById(this.container);
        }
        var me = this;
        var defaultOpts = {
                id: me.name,
                main: me.container,
                viewContext: me.viewContext,
                renderOptions: {
                    properties: me.getUIProperties(),
                    valueReplacer: _.bind(me.replaceValue, me)
                }
            };
        if (!me.container) {
            me.container = document.createElement('div');
            me.container.id = me.name;
            document.body.appendChild(me.container);
            me.main = fcui.create('Dialog', fc.util.deepExtend(defaultOpts, me.options.dialogOptions, { main: me.container }));
            me.main.on('close', me.close, me);
            me.main.show();
        } else {
            me.main = fcui.create('Panel', defaultOpts);
            me.main.render();
        }
        var model = me.getModel();
        if (Promise.isPromise(model)) {
            me.fire('loading');
            return model.ensure(function () {
                me.fire('loaded');
            });
        }
        return Promise.resolve(me.main);
    };
    proto.renderer = null;
    proto.getRenderer = function () {
        if (this.renderer == null) {
            if (this.template) {
                this.renderer = fc.tpl.compile(this.template);
            } else if (this.templateName) {
                this.renderer = fc.tpl.getRenderer(this.templateName);
            } else {
                this.renderer = function () {
                    return '';
                };
            }
        }
        return this.renderer;
    };
    proto.render = function () {
        if (!this.lifeStage.is(LifeStage.NEW | LifeStage.INITED)) {
            this.repaint();
            return Promise.resolve();
        }
        return this.initStructure().then(_.bind(this.finishRender, this)).catch(_.bind(this.handleError, this));
    };
    proto.finishRender = function () {
        var renderer = this.getRenderer();
        this.main.setProperties({ content: renderer(this.model) });
        this.initUIEvents();
        this.initBehavior();
        this.lifeStage.changeTo(LifeStage.RENDERED);
    };
    function bindEventToControl(view, id, eventName, handler) {
        if (typeof handler === 'string') {
            handler = view[handler];
        }
        if (typeof handler !== 'function') {
            return handler;
        }
        var control = view.get(id);
        if (control) {
            control.on(eventName, handler, view);
        }
        return handler;
    }
    function bindEventToGroup(view, groupid, eventName, handler) {
        var group = view.getGroup(groupid);
        group.each(function (item) {
            bindEventToControl(view, item.id, eventName, handler);
        });
    }
    proto.initUIEvents = function () {
        var me = this;
        var uiEvents = me.getUIEvents();
        if (!uiEvents) {
            return;
        }
        for (var key in uiEvents) {
            if (!uiEvents.hasOwnProperty(key)) {
                continue;
            }
            var segments = key.split(':');
            if (segments.length > 1) {
                var id = segments[0];
                var type = segments[1];
                var handler = uiEvents[key];
                if (id.charAt(0) === '@') {
                    bindEventToGroup(me, id.substring(1), type, handler);
                } else {
                    bindEventToControl(me, id, type, handler);
                }
            } else {
                var map = uiEvents[key];
                fc.assert.equals(_.isObject(map), true, 'uiEvents\u5FC5\u987B\u662F\u5BF9\u8C61\uFF01');
                for (var type in map) {
                    if (!map.hasOwnProperty(type)) {
                        continue;
                    }
                    var handler = map[type];
                    if (key.charAt(0) === '@') {
                        bindEventToGroup(me, key.substring(1), type, handler);
                    } else {
                        bindEventToControl(me, key, type, handler);
                    }
                }
            }
        }
    };
    proto.initBehavior = function () {
    };
    proto.repaint = function () {
        var renderer = this.getRenderer();
        this.main.setContent(renderer(this.model));
        this.lifeStage.changeTo(LifeStage.REPAINTED);
    };
    proto.show = function () {
        var me = this;
        if (me.lifeStage.is(LifeStage.NEW | LifeStage.INITED)) {
            me.render().then(function () {
                me.fire('showed');
            }).catch(_.bind(me.handleError, me));
        } else {
            me.container.style.display = 'block';
            me.main.show();
            me.repaint();
            me.fire('showed');
        }
    };
    proto.hide = function () {
        this.main.hide();
        this.container.style.display = 'none';
        this.fire('hided');
    };
    proto.close = function () {
        this.fire('closed');
        this.dispose();
    };
    proto.dispose = function () {
        if (this.lifeStage.is(LifeStage.DISPOSED)) {
            return;
        }
        if (this.viewContext) {
            this.viewContext.dispose();
            this.viewContext = null;
        }
        if (this.container) {
            this.container.innerHTML = '';
            this.container = null;
        }
        this.lifeStage.changeTo(LifeStage.DISPOSED);
        this.destroyEvents();
    };
    var BasicView = fc.oo.derive(require('fc-core/EventTarget'), proto);
    return BasicView;
});

define('fc-view/view/ActionView', [
    'require',
    'fc-core',
    'fc-core/Promise',
    'er/events',
    'mini-event',
    'er/controller',
    './BasicView'
], function (require) {
    var fc = require('fc-core');
    var Promise = require('fc-core/Promise');
    var erEvents = require('er/events');
    var noop = function () {
    };
    var proto = {};
    proto.constructor = function (options) {
        options = options || {};
        if (options.actionPath) {
            this.actionPath = options.actionPath;
        }
        if (options.actionOptions) {
            this.actionOptions = options.actionOptions;
        }
        fc.assert.has(this.actionPath, 'ActionView\u5FC5\u987B\u6307\u5B9AactionPath');
        fc.assert.has(this.actionOptions, 'ActionView\u5FC5\u987B\u6307\u5B9AactionOptions');
        this.$super([options]);
    };
    proto.getUIProperties = noop;
    proto.getUIEvents = noop;
    proto.replaceValue = noop;
    proto.actionType = null;
    proto.action = null;
    function delegateActionEvent(e) {
        var event = require('mini-event').fromEvent(e, {
                preserveData: true,
                syncState: true
            });
        event.type = 'action@' + e.type;
        this.fire(event);
    }
    function attachAction(e) {
        if (!e.isChildAction || e.container !== this.main.id) {
            return;
        }
        this.action = e.action;
        if (typeof this.action.on === 'function') {
            this.action.on('*', delegateActionEvent, this);
        }
        this.fire('actionattach');
    }
    function notifyActionLoadComplete(e) {
        if (!e.isChildAction || e.container !== this.main.id) {
            return;
        }
        this.fire('actionloaded');
    }
    function notifyActionLoadFailed(e) {
        if (!e.isChildAction || e.container !== this.main.id) {
            return;
        }
        this.action = null;
        this.fire('actionloadfail', {
            failType: e.failType,
            reason: e.reason
        });
    }
    function notifyActionLoadAborted(e) {
        if (!e.isChildAction || e.container !== this.main.id) {
            return;
        }
        this.fire('actionloadabort');
    }
    proto.initStructure = function () {
        erEvents.on('enteraction', attachAction, this);
        erEvents.on('enteractioncomplete', notifyActionLoadComplete, this);
        erEvents.on('actionnotfound', notifyActionLoadFailed, this);
        erEvents.on('permissiondenied', notifyActionLoadFailed, this);
        erEvents.on('actionfail', notifyActionLoadFailed, this);
        erEvents.on('enteractionfail', notifyActionLoadFailed, this);
        erEvents.on('actionabort', notifyActionLoadAborted, this);
        this.$super(arguments);
    };
    proto.getActionOptions = function () {
        return fc.util.deepExtend({}, this.actionOptions, this.model);
    };
    proto.finishRender = function () {
        var controller = require('er/controller');
        this.action = controller.renderChildAction(url, this.container.id, this.getActionOptions());
        if (typeof this.action.abort !== 'function') {
            this.action = null;
        }
        this.lifeStage.changeTo(LifeStage.RENDERED);
    };
    function delegateActionPanelEvent(e) {
        var event = require('mini-event').fromEvent(e, {
                preserveData: true,
                syncState: true
            });
        event.type = e.type.replace(/^action@/g, '');
        event.triggerSource = 'action';
        this.fire(event);
    }
    proto.disposeAction = function () {
        var action = this.action;
        if (!action) {
            return;
        }
        if (Promise.isPromise(action) && typeof action.abort === 'function') {
            action.abort();
        } else {
            if (typeof action.un === 'function') {
                action.un('*', delegateActionEvent, this);
            }
            if (typeof action.leave === 'function') {
                action.leave();
            }
        }
        this.action = null;
    };
    proto.dispose = function () {
        this.disposeAction();
        events.un('enteraction', attachAction, this);
        events.un('enteractioncomplete', notifyActionLoadComplete, this);
        events.un('actionnotfound', notifyActionLoadFailed, this);
        events.un('permissiondenied', notifyActionLoadFailed, this);
        events.un('actionfail', notifyActionLoadFailed, this);
        events.un('enteractionfail', notifyActionLoadFailed, this);
        events.un('actionabort', notifyActionLoadAborted, this);
        this.$super(arguments);
    };
    var ActionView = fc.oo.derive(require('./BasicView'), proto);
    return ActionView;
});

define('er/Enum', [
    'require',
    'eoo'
], function (require) {
    var exports = {};
    exports.constructor = function () {
        this.valueIndex = [];
        this.aliasIndex = {};
        this.textIndex = {};
        for (var i = 0; i < arguments.length; i++) {
            var element = arguments[i];
            if (element.value == null) {
                element.value = i;
            }
            this.addElement(element);
        }
    };
    exports.addElement = function (element) {
        if (this.hasOwnProperty(element.value)) {
            throw new Error('Already defined an element with value' + element.value + ' in this enum type');
        }
        if (this.hasOwnProperty(element.alias)) {
            throw new Error('Already defined an element with alias "' + element.alias + '" in this enum type');
        }
        this[element.value] = element.alias;
        this[element.alias] = element.value;
        this.valueIndex[element.value] = element;
        this.aliasIndex[element.alias] = element;
        this.textIndex[element.text] = element;
    };
    exports.fromValue = function (value) {
        return this.valueIndex[value];
    };
    exports.fromAlias = function (alias) {
        return this.aliasIndex[alias];
    };
    exports.fromText = function (text) {
        return this.textIndex[text];
    };
    exports.getTextFromValue = function (value) {
        return this.fromValue(value).text;
    };
    exports.getTextFromAlias = function (alias) {
        return this.fromAlias(alias).text;
    };
    exports.getValueFromAlias = function (alias) {
        return this.fromAlias(alias).value;
    };
    exports.getValueFromText = function (text) {
        return this.fromText(text).value;
    };
    exports.getAliasFromValue = function (value) {
        return this.fromValue(value).alias;
    };
    exports.getAliasFromText = function (text) {
        return this.fromText(text).alias;
    };
    exports.toArray = function () {
        var array = [];
        if (arguments.length > 0) {
            for (var i = 0; i < arguments.length; i++) {
                var hint = arguments[i];
                if (typeof hint === 'string') {
                    array.push(this.fromAlias(hint));
                } else {
                    array.push(hint);
                }
            }
        } else {
            for (var i = 0; i < this.valueIndex.length; i++) {
                if (this.valueIndex[i]) {
                    array.push(this.valueIndex[i]);
                }
            }
        }
        return array;
    };
    var Enum = require('eoo').create(exports);
    return Enum;
});

define('er/Observable', [
    'require',
    'mini-event/EventTarget'
], function (require) {
    return require('mini-event/EventTarget');
});

define('er/datasource', [
    'require',
    './util',
    './ajax',
    './permission'
], function (require) {
    var datasource = {};
    datasource.constant = function (value) {
        return function () {
            return value;
        };
    };
    datasource.remote = function (url, options) {
        return function (model) {
            options = require('./util').mix({
                url: url,
                dataType: 'json'
            }, options);
            if (typeof options.data === 'function') {
                options.data = options.data(model);
            }
            var ajax = require('./ajax');
            return ajax.request(options);
        };
    };
    datasource.permission = function (name) {
        return function () {
            var permission = require('./permission');
            return permission.isAllow(name);
        };
    };
    datasource.defaultValue = function (defaultValue, name) {
        return function (model, options) {
            if (!options.name && !name) {
                throw new Error('No property name specified to determine whether value exists in this model');
            }
            var propertyName = name || options.name;
            return model.hasValue(propertyName) ? model.get(propertyName) : defaultValue;
        };
    };
    datasource.convertTo = function (type, name) {
        return function (model, options) {
            if (!options.name && !name) {
                throw new Error('No property name specified to convert');
            }
            var property = name || options.name;
            var value = model.get(property);
            switch (type) {
            case 'number':
                return parseInt(value, 10);
            case 'string':
                return value + '';
            case 'boolean':
                return !!value;
            default:
                return value;
            }
        };
    };
    return datasource;
});

define('er/template', [
    'require',
    'etpl/main'
], function (require) {
    var template = require('etpl/main');
    template.merge = function (output, tplName, model) {
        var html = '';
        try {
            var html = template.render(tplName, model);
        } catch (ex) {
        }
        if (output) {
            output.innerHTML = html;
        }
        return html;
    };
    return template;
});

define('etpl/tpl', [
    'require',
    'exports',
    'module',
    '.'
], function (require, exports, module) {
    var etpl = require('.');
    return {
        load: function (resourceId, req, load) {
            var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
            xhr.open('GET', req.toUrl(resourceId), true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        var source = xhr.responseText;
                        var moduleConfig = module.config();
                        if (moduleConfig.autoCompile || moduleConfig.autoCompile == null) {
                            etpl.compile(source);
                        }
                        load(source);
                    }
                    xhr.onreadystatechange = new Function();
                    xhr = null;
                }
            };
            xhr.send(null);
        }
    };
});

define('er/tpl', [
    'require',
    'etpl/tpl'
], function (require) {
    return require('etpl/tpl');
});

define('main', [
    'require',
    'underscore',
    'fc-core',
    'fc-ajax',
    'fc-core/Promise',
    'fc-ajax/config',
    'fc-ajax/globalData',
    'fc-ajax/hooks',
    'er',
    'er/config',
    './actionConf',
    'er/controller'
], function (require) {
    var _ = require('underscore');
    var fc = require('fc-core');
    var ajax = require('fc-ajax');
    var Promise = require('fc-core/Promise');
    window.p = function (msg) {
        return function (res) {
            var toShow = msg;
            if (this.option) {
                toShow = '[' + this.option.data.path + '] ' + toShow;
            }
            console.log(toShow, performance.now());
        };
    };
    require('fc-ajax/config').url = 'request.ajax';
    require('fc-ajax/globalData').userid = 666666;
    var ajaxHooks = require('fc-ajax/hooks');
    ajaxHooks.beforeEachRequest = p('hook.beforeEachRequest', true);
    ajaxHooks.afterEachRequest = p('hook.afterEachRequest');
    ajaxHooks.eachSuccess = p('hook.eachSuccess');
    ajaxHooks.eachFailure = p('hook.eachFailure');
    ajaxHooks.businessCheck = function (response) {
        if (typeof response === 'object') {
            if (this.option.data.path === 'GET/basicInfo') {
                return response;
            }
            if (response.status === 200) {
                return response;
            }
        }
        throw new Error('response data has sth error');
    };
    var noop = function (res) {
        console.error('fail biz handler', res);
        return Promise.reject();
    };
    var requesting = ajax.request('GET/basicInfo');
    requesting.then(function (response) {
        p('recieved basicInfo && biz processing')();
        var er = require('er');
        require('er/config').indexURL = '/entry/index';
        var actionConf = _.flatten(require('./actionConf'));
        require('er/controller').registerAction(actionConf);
        er.start();
    }, noop);
});