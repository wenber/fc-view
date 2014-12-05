/**
 * @file fc-view BaseView
 * 基于er.View，参考ef.UIView进行处理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {

    var fc = require('fc-core');
    var _ = require('underscore');

    /**
     * @class meta.BaseView
     * @constructor
     * @extends ef.UIView
     */
    var overrides = {};
    overrides.constructor = function () {
        // 指定了名字，但是新实例应该有不同的名字
        this.name = this.name + '-' + fc.util.guid();
        // call super
        this.$super(arguments);
    };

    /**
     * name
     * @type {string}
     */
    overrides.name = 'fc-view-mvc-BaseView';

    /**
     * 给指定的控件绑定事件
     *
     * @param {UIView} view View对象实例
     * @param {string} id 控件的id
     * @param {string} eventName 事件名称
     * @param {Function | string} handler 事件处理函数，或者对应的方法名
     * @return {Function} 绑定到控件上的事件处理函数，不等于`handler`参数
     * @inner
     */
    function bindEventToControl(view, id, eventName, handler) {
        if (typeof handler === 'string') {
            handler = view[handler];
        }

        // TODO: mini-event后续会支持`false`作为处理函数，要考虑下
        if (typeof handler !== 'function') {
            return handler;
        }

        var control = view.get(id);
        if (control) {
            control.on(eventName, handler, view);
        }

        return handler;
    }

    /**
     * 绑定控件的事件。
     *
     * @override
     * @protected
     */
    overrides.bindEvents = function () {
        var me = this;
        var events = me.getUIEvents();
        if (!events) {
            return;
        }

        for (var key in events) {
            if (!events.hasOwnProperty(key)) {
                // 下面逻辑太长了，在这里先中断
                continue;
            }

            // 可以用`uiid:click`的形式在指定控件上绑定指定类型的事件
            // 扩展增加，可以用`@groupid:click`的形式批量绑定指定类型的事件
            var segments = key.split(':');
            if (segments.length > 1) {
                var id = segments[0];
                var type = segments[1];
                var handler = events[key];

                if (id.indexOf('@') === 0) {
                    // group
                    var groupid = id.split('@')[1];
                    var group = me.getGroup(groupid);
                    group && group.each(function (item) {
                        bindEventToControl(me, item.id, type, handler);
                    });
                }
                else {
                    bindEventToControl(me, id, type, handler);
                }
            }
            // 也可以是一个控件的id，值是对象，里面每一项都是一个事件类型
            // 或者是`@groupid`的形式
            else {
                var map = events[key];

                if (typeof map !== 'object') {
                    return;
                }

                for (var hType in map) {
                    if (!map.hasOwnProperty(hType)) {
                        continue;
                    }
                    var hHandler = map[hType];
                    if (key.indexOf('@') === 0) {
                        // group
                        var hGroupid = key.split('@')[1];
                        var hGroup = me.getGroup(hGroupid);
                        hGroup && hGroup.each(function (item) {
                            bindEventToControl(me, item.id, hType, hHandler);
                        });
                    }
                    else {
                        bindEventToControl(me, key, hType, hHandler);
                    }
                }
            }
        }
    };

    /**
     * 获取要去渲染的数据，但是这里做一个扩充处理
     * 可以使用自定义的replacer来进行展现替换，不改变model的东西
     * @return {Object} 一个提供了get方法的数据获取器
     */
    overrides.getTemplateData = function () {
        var me = this;
        var result = me.$super(arguments);
        var oldVisit = result.get;
        result.get = function (propertyPath) {
            var value = oldVisit(propertyPath);
            if (me.templateDataReplacer
                && me.templateDataReplacer[propertyPath]) {
                var replacer = me.templateDataReplacer[propertyPath];
                if (_.isFunction(replacer)) {
                    return replacer.call(me, value, me.model);
                }
                // 否则是其他类型的，就直接覆盖
                return replacer;
            }
            return value;
        };
        return result;
    };

    /**
     * View的模板数据替换配置
     * @type {Object}
     */
    overrides.templateDataReplacer = null;

    /**
     * 在view的初始化阶段暴露给开发者的自定义处理
     */
    overrides.customDocument = function () {};

    var BaseView = fc.oo.derive(require('ef/UIView'), overrides);
    return BaseView;
});
