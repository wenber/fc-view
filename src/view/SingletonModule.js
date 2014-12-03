/**
 * @file fc-view/view/SingletonModule 基础单例子模块类，供公共调用
 * SingletonModule类的提出并不是为了ER的子Action服务，而是为了公共模块服务
 * 本类只提供了template功能
 *
 * 使用模式：先show，再on事件，某个时间点直接hide即可
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */


define(function (require) {

    var _ = require('underscore');
    var fc = require('fc-core');
    var fcui = require('fcui');
    var EventTarget = require('fc-core/EventTarget');
    var Promise = require('fc-core/Promise');
    var ViewContext = require('fcui/ViewContext');
    var LifeStage = require('./LifeStage');

    require('fcui/Panel');
    require('fcui/Dialog');

    /**
     * 判断是否支持html5
     * @return {boolean}
     */
    var supportHtml5 = (function () {
        try {
            document.createElement('canvas').getContext('2d');
            return true;
        } catch (e) {
            return false;
        }
    })();

    /**
     * 默认样式类
     * @type {string}
     */
    var BASIC_CLASS = 'singleton-module-basic';

    /**
     * SingletonModule类
     * @constructor
     * @class SingletonModule
     * @extends fc.EventTarget
     *
     * 对外事件暴露
     * SingletonModule#inited 初始化完成
     * SingletonModule#rendered 渲染完成
     * SingletonModule#repainted 重绘完成
     * SingletonModule#disposed 销毁完成
     * SingletonModule#showed
     * SingletonModule#hided
     * SingletonModule#closed 界面关闭 之后会自动触发销毁
     * SingletonModule#loading 标记为加载中，仅在Model为异步时或者子Action模式时触发
     * SingletonModule#loaded 标记为加载完成，仅在Model为异步时或者子Action模式时触发
     *
     * 环境访问
     * 获取UI：
     * instance.get(id)
     * instance.getSafely(id)
     * instance.getGroup(groupid)
     *
     * 视图控制
     * 展现界面：instance.show()
     * 隐藏界面：instance.hide()
     * 销毁界面：instance.close()
     *
     * 交互控制
     * 建议子类处理交互方法：initBehavior
     */
    var overrides = {};
    overrides.constructor = function () {
        this.guid = fc.util.guid();
        this.name += '-' + this.guid;
        this.lifeStage = new LifeStage(this);
        this.viewContext = new ViewContext(this.name);

        // 请注意，生命周期的改变会自动fire同名事件
        this.lifeStage.changeTo(LifeStage.INITED);
    };

    /**
     * 基础类名
     * @type {string}
     */
    overrides.name = 'singleton-module-basic';

    /**
     * 获取主体容器的样式
     */
    overrides.getClassName = function () {
        var className = BASIC_CLASS + (supportHtml5 ? ' html5': '');
        if (this.className) {
            className += ' ' + this.className;
        }
        return className;
    };

    /**
     * 失败处理
     */
    overrides.handleError = function (e) {
        fc.util.processError(e);
    };

    /**
     * 获取环境内的UI实例
     * @param {string} id UI控件的id
     * @return {Object}
     */
    overrides.get = function (id) {
        return this.viewContext.get(id);
    };

    /**
     * 根据id获取控件实例，如无相关实例则返回{@link SafeWrapper}
     *
     * @param {string} id 控件id
     * @return {Control} 根据id获取的控件
     */
    overrides.getSafely = function (id) {
        return this.viewContext.getSafely(id);
    };

    /**
     * 获取一个控件分组
     *
     * @param {string} groupid 分组名称
     * @return {ControlGroup}
     */
    overrides.getGroup = function (groupid) {
        if (!groupid) {
            throw new Error('groupid is unspecified');
        }

        return this.viewContext.getGroup(groupid);
    };

    /**
     * model对象
     * @type {?meta.Model|Object}
     */
    overrides.model = null;

    /**
     * 获取数据对象
     * @return {Promise|meta.Model|Object} Promise对象或者Model对象或Object
     */
    overrides.getModel = function () {
        var me = this;
        if (me.model) {
            if (typeof me.model === 'function') {
                var modelResult = me.model();
                if (Promise.isPromise(modelResult)) {
                    return modelResult.then(
                        function (result) {
                            me.model = result;
                        },
                        // 这里控制了进行handleError处理，可能吞掉了Model执行的失败传递
                        // 因此如果传入的是一个方法，确保在其中就进行了容错处理
                        _.bind(me.handleError, me)
                    );
                }
                me.model = modelResult;
            }
        }
        else {
            me.model = {};
        }
        return me.model;
    };

    /**
     * UI配置
     * @property
     * @type {?Object}
     */
    overrides.uiProperties = null;

    /**
     * UI配置获取方法
     * @return {Object}
     */
    overrides.getUIProperties = function () {
        return this.uiProperties || {};
    };

    /**
     * UI事件配置
     * @property
     * @type {?Object}
     * @this {SingletonModule}
     */
    overrides.uiEvents = null;

    /**
     * UI事件配置获取方法
     * @return {Object}
     */
    overrides.getUIEvents = function () {
        return this.uiEvents || {};
    };

    /**
     * 线性获取值的方法…… 例如getProperty(a, 'b.c')相当于a.b.c或a.get(b).c
     */
    function getProperty(target, path) {
        var value = target;
        for (var i = 0; i < path.length; i++) {
            value = value[path[i]];
        }

        return value;
    }

    /**
     * 替换元素属性中的特殊值，模式与view.BaseView一致
     *
     * @param {string} value 需要处理的值
     * @return {*} 处理完的值
     * @public
     */
    overrides.replaceValue = function (value) {
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
            var value = typeof this.model.get === 'function'
                ? this.model.get(path[0])
                : this.model[path[0]];
            return path.length > 1
                ? getProperty(value, path.slice(1))
                : value;
        }
        else {
            return value;
        }
    };

    /**
     * 创建主体容器
     * @return {meta.Promise} 异步状态
     */
    overrides.initStructure = function () {

        fc.assert.has(this.viewContext, '创建容器时必须已经创建了ViewContext');

        if (typeof this.container === 'string') {
            this.container = document.getElementById(this.container);
        }

        var me = this;
        var defaultOpts = {
            id: me.name,
            main: me.container,
            viewContext: me.viewContext,
            needFoot: true,
            renderOptions: {
                properties: me.getUIProperties(),
                valueReplacer: _.bind(me.replaceValue, me)
            }
        }

        if (!me.container) {
            // 创建容器元素
            me.container = document.createElement('div');
            me.container.id = me.name;
            document.body.appendChild(me.container);
            // 创建Dialog
            me.control = fcui.create(
                'Dialog',
                _.deepExtend(defaultOpts, me.dialogOptions, {
                    main: me.container,
                    closeOnHide: false  // 强制隐藏不关闭（即不销毁）
                })
            );

            // 部分事件代理过来
            me.control.on('close', function () { me.fire('hide') });
            me.control.on('hide', function () { me.fire('hide') });

            // 立即展现
            me.control.show();
        }
        else {
            me.control = fcui.create('Panel', defaultOpts);
            me.control.render();
        }

        var model = me.getModel();
        if (Promise.isPromise(model)) {
            me.fire('loading');
            return model.ensure(function () {
                me.fire('loaded');
            });
        }

        return Promise.resolve(me.control);
    };

    /**
     * 主体内容渲染器
     * @param {Object|meta.Model} data 数据
     * @return {string} 主体内容的HTML
     */
    overrides.renderer = null;
    overrides.getRenderer = function () {
        if (this.renderer == null) {
            // 渲染器
            if (this.template) {
                this.renderer = fc.tpl.compile(this.template);
            }
            else if (this.templateName) {
                this.renderer = fc.tpl.getRenderer(this.templateName);
            }
            else {
                this.renderer = function () { return ''; };
            }
        }
        return this.renderer;
    };

    overrides.render = function () {
        if (!this.lifeStage.is(LifeStage.NEW | LifeStage.INITED)) {
            this.repaint();
            return Promise.resolve();
        }

        return this.initStructure().then(
            _.bind(this.finishRender, this)
        ).catch(_.bind(this.handleError, this));
    };

    overrides.finishRender = function () {
        var renderer = this.getRenderer();

        this.control.setProperties({
            content: renderer(this.model)
        });

        this.initUIEvents();

        // 供外部来处理交互
        this.initBehavior();

        // 请注意，生命周期的改变会自动fire同名事件
        this.lifeStage.changeTo(LifeStage.RENDERED);
    };

    /**
     * 给指定的控件绑定事件
     *
     * @param {SingletonModule} module SingletonModule对象实例
     * @param {string} id 控件的id
     * @param {string} eventName 事件名称
     * @param {function | string} handler 事件处理函数，或者对应的方法名
     * @return {function} 绑定到控件上的事件处理函数，不等于`handler`参数
     * @inner
     */
    function bindEventToControl(module, id, eventName, handler) {
        if (typeof handler === 'string') {
            handler = module[handler];
        }

        // TODO: mini-event后续会支持`false`作为处理函数，要考虑下
        if (typeof handler !== 'function') {
            return handler;
        }

        var control = module.get(id);
        if (control) {
            control.on(eventName, handler, module);
        }

        return handler;
    }

    /**
     * 给指定的控件组批量绑定事件，相同的处理
     *
     * @param {SingletonModule} module SingletonModule对象实例
     * @param {string} groupid 控件组的id
     * @param {string} eventName 事件名称
     * @param {function | string} handler 事件处理函数，或者对应的方法名
     * @return {function} 绑定到控件上的事件处理函数，不等于`handler`参数
     * @inner
     */
    function bindEventToGroup(module, groupid, eventName, handler) {
        // 因为控件组这时候实际上已经生成了，后续修改也不会影响整个对象，所以直接使用它
        var group = module.getGroup(groupid);

        group.each(function (item) {
            bindEventToControl(module, item.id, eventName, handler);
        });
    }

    overrides.initUIEvents = function () {
        var me = this;
        var uiEvents = me.getUIEvents();

        if (!uiEvents) {
            return;
        }
        // 依次处理配置在uiEvents中的事件
        for (var key in uiEvents) {
            if (!uiEvents.hasOwnProperty(key)) {
                continue;
            }

            // 可以用`uiid:click`的形式在指定控件上绑定指定类型的事件
            // `@groupid:click`的形式批量绑定指定类型的事件另行处理
            var segments = key.split(':');
            if (segments.length > 1) {
                var id = segments[0];
                var type = segments[1];
                var handler = uiEvents[key];

                if (id.charAt(0) === '@') {
                    // group处理
                    bindEventToGroup(me, id.substring(1), type, handler);
                }
                else {
                    bindEventToControl(me, id, type, handler);
                }
            }
            // 也可以是一个控件的id，值是对象，里面每一项都是一个事件类型
            // 或者是`@groupid`的形式
            else {
                var map = uiEvents[key];
                fc.assert.equals(_.isObject(map), true, 'uiEvents必须是对象！');

                for (var type in map) {
                    if (!map.hasOwnProperty(type)) {
                        continue;
                    }
                    var handler = map[type];
                    if (key.charAt(0) === '@') {
                        // group处理
                        bindEventToGroup(me, key.substring(1), type, handler);
                    }
                    else {
                        bindEventToControl(me, key, type, handler);
                    }
                }
            }
        }
    };

    overrides.initBehavior = function () {};

    overrides.repaint = function () {
        var renderer = this.getRenderer();

        // this.control.setProperties({
        //     content: renderer(this.model)
        // });
        this.control.setContent(renderer(this.model))

        // 请注意，生命周期的改变会自动fire同名事件
        this.lifeStage.changeTo(LifeStage.REPAINTED);
    };

    overrides.show = function () {
        var me = this;
        if (me.lifeStage.is(LifeStage.NEW | LifeStage.INITED)) {
            me.render().then(function () {
                me.fire('showed');
            }).catch(_.bind(me.handleError, me));
        }
        else {
            me.control.show();
            me.repaint();
            me.fire('showed');
        }

        // 并且开始监听这时候开始所有注册的事件
        listenPostEvent.call(me);
    };

    /**
     * @type {?Array.<Object>}
     * 元素的key为：type, handler, thisObject
     */
    overrides._postEvents = null;

    /**
     * 扩展的注册一个事件处理函数
     *
     * @param {string} type 事件的类型
     * @param {Function | boolean} fn 事件的处理函数，
     * 特殊地，如果此参数为`false`，将被视为特殊的事件处理函数，
     * 其效果等于`preventDefault()`及`stopPropagation()`
     * @param {Mixed} [thisObject] 事件执行时`this`对象
     * @param {Object} [options] 事件相关配置项
     * @param {boolean} [options.once=false] 控制事件仅执行一次
     */
    overrides._extendedOn = function (type, fn, thisObject, options) {
        this._postEvents.push({
            type: type,
            handler: fn,
            thisObject: thisObject
        });
        return this._originalOn(type, fn, thisObject, options);
    };

    function listenPostEvent() {
        var me = this;

        clearPostEvent.call(me);

        // 开始监听
        me._originalOn = me.on;
        me.on = me._extendedOn;
    }

    function clearPostEvent() {
        var me = this;
        // 如果存在，则清理
        if (me._postEvents) {
            _.each(me._postEvents, function (item) {
                me.un(item.type, item.handler, item.thisObject);
            });
        }
        me._postEvents = [];
        me.on = me._originalOn || me.on;
    }

    overrides.hide = function () {
        this.control.hide();
        this.fire('hided');
        // 并且清除本次展现期间注册的事件
        clearPostEvent.call(this);
    };

    var SingletonModule = fc.oo.derive(EventTarget, overrides);

    return SingletonModule;
});