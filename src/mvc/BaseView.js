/**
 * @file fc-view BaseView
 * 基于er.View，参考ef.UIView进行处理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {

    var fc = require('fc-core');
    var _ = require('underscore');
    
    // 在此直接屏蔽掉er.View的dispose，它会让container内容清空
    require('er/View').prototype.dispose = function () {};
    
    /**
     * @class meta.BaseView
     * @constructor
     * @extends er.View
     */
    var proto = {};
    proto.constructor = function () {
        // call super
        this.$super(arguments);
    };

    /**
     * name
     * @type {string}
     */
    proto.name = 'fc-view-mvc-BaseView';

    /**
     * 给指定的控件绑定事件
     *
     * @param {UIView} view View对象实例
     * @param {string} id 控件的id
     * @param {string} eventName 事件名称
     * @param {function | string} handler 事件处理函数，或者对应的方法名
     * @return {function} 绑定到控件上的事件处理函数，不等于`handler`参数
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
    proto.bindEvents = function () {
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

                for (var type in map) {
                    if (map.hasOwnProperty(type)) {
                        var handler = map[type];
                        if (key.indexOf('@') === 0) {
                            // group
                            var groupid = key.split('@')[1];
                            var group = me.getGroup(groupid);
                            group && group.each(function (item) {
                                bindEventToControl(me, item.id, type, handler);
                            });
                        }
                        else {
                            bindEventToControl(me, key, type, handler);
                        }
                    }
                }
            }
        }
    };

    /**
     * 当容器渲染完毕后触发，用于控制元素可见性及绑定事件等DOM操作
     *
     * @override
     * @protected
     */
    proto.enterDocument = function () {
        this.$super(arguments);

        // 在view的初始化阶段暴露给开发者的自定义处理
        this.customDocument();
    };

    /**
     * 在view的初始化阶段暴露给开发者的自定义处理
     */
    proto.customDocument = function () {};

    var BaseView = fc.oo.derive(require('ef/UIView'), proto);
    return BaseView;
});