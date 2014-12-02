/**
 * @file fc-view BaseModel
 * 基于er.Model，参考ef.UIModel进行处理
 * 
 * 原来ef.UIModel中的formatter在设置（set、fill）时会自动进行format处理
 * 但是这导致存入和取出的值格式不符，因此在这里没有融入此类处理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {

    var _ = require('underscore');
    var fc = require('fc-core');
    
    /**
     * @class meta.BaseModel
     * @constructor
     * @extends er.Model
     */
    var overrides = {};

    // 原来ef.UIModel中的formatter在设置时会自动进行format处理
    // 但是这导致存入和取出的值格式不符，因此在这里没有融入此类处理

    /**
     * 重写set方法
     *
     * @method Model#.set
     *
     * @param {string} name 属性名
     * @param {*} value 对应的值
     * @param {Object} options 相关选项
     * @param {boolean} options.silent=false
     *     如果该值为`true`则不触发{@link Model#.event:change|change事件}
     *
     * @fires change
     * @throws {Error} 当前对象已经销毁
     * @throws {Error} 未提供`name`参数
     * @throws {Error} 未提供`value`参数
     */
    overrides.set = function (name, value, options) {
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
            /**
             * 属性值发生变化时触发
             *
             * @event Model#.change
             *
             * @property {string} name 发生变化的属性的名称
             * @property {string} changeType 变化的类型取值为`"add"`、`"change"`或`"remove"`
             * @property {*} oldValue 变化前的值
             * @property {*} newValue 变化后的值
             */
            this.fire('change', event);
            this.fire('change:' + name, event);
        }
    };

    /**
     * 重写fill，批量设置值
     *
     * @method Model#.fill
     *
     * @param {Object} extension 批量值的存放对象
     * @param {Object} [options] 相关选项
     * @param {boolean} [options.silent=false] 如果该值为`true`则不触发{@link Model#.event:change|change事件}
     *
     * @fires change
     * @throws {Error} 当前对象已经销毁
     * @throws {Error} 未提供`extension`参数
     */
    overrides.fill = function (extension, options) {
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

    /**
     * 删除对应键的值
     *
     * @method Model#.remove
     *
     * @param {string} name 属性名
     * @param {Object} options 相关选项
     * @param {boolean} options.silent=false
     *     如果该值为`true`则不触发{@link Model#.event:change|change事件}
     *
     * @fires change
     * @throws {Error} 当前对象已经销毁
     * @throws {Error} 未提供`name`参数
     */
    overrides.remove = function (name, options) {
        if (!this.store) {
            throw new Error('This model is disposed');
        }

        if (!name) {
            throw new Error('Argument name is not provided');
        }

        // 如果原来就没这个值，就不触发`change`事件了
        if (!this.store.hasOwnProperty(name)) {
            return undefined;
        }

        options = options || EMPTY;
        var oldValue = this.store[name];

        // 用类似`underscore.omit`的方法，会受属性的多少有影响，所以还是乖乖用`delete`吧
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

    /**
     * 将当前{@link Model}对象导出为一个普通的对象
     *
     * @method Model#.dump
     *
     * @return {Object} 一个普通的对象，修改该对象不会影响到当前{@link Model}对象
     */
    overrides.dump = function () {
        // 为保证获取对象后修改不会影响到当前`Model`对象，需要做一次DEEP克隆的操作
        var returnValue = {};
        fc.util.deepExtend(returnValue, this.store);
        return returnValue;
    };

    /**
     * 根据传入的属性名获取一个组装后的对象
     *
     * @param {Array.<string> | string...} names 需要的属性名列表
     * @return {Object} 包含`names`参数指定的属性的对象
     */
    overrides.getPart = function (names) {
        if (Object.prototype.toString.call(names) !== '[object Array]') {
            names = [].slice.call(arguments);
        }

        var part = {};
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            part[name] = this.get(name);
        }
        return part;
    };

    var BaseModel = fc.oo.derive(require('er/Model'), overrides);
    BaseModel.formatter = require('./formatter');

    return BaseModel;
});