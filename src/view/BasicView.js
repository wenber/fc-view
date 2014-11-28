/**
 * @file fc-view/view/BasicView 基础子模块类
 * BasicView类的提出并不是为了ER的子Action服务，而是为了子模块服务
 * 所以不要将BasicView单纯的作为子Action的展现器来使用
 * BasicView类及其子类作为子模块实体类，提供整合的方法和渠道来进行模块的自处理和模块间的通讯
 * 因此本次实现，BasicView将作为一个abstract类进行实现！
 * 并且只提供了template功能
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {

    var _ = require('underscore');
    var fc = require('fc-core');
    var fcui = require('fcui');
    var Promise = require('fc-core/Promise');
    var ViewContext = require('fcui/ViewContext');
    var LifeStage = require('./LifeStage');

    require('fcui/Panel');
    require('ef/ActionPanel')

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
     * 为DOM元素添加事件
     *
     * 本方法 *不处理* DOM事件的兼容性，包括执行顺序、`Event`对象属性的修正等
     *
     * @param {HTMLElement | string} element DOM元素或其id
     * @param {string} type 事件类型， *不能* 带有`on`前缀
     * @param {Function} listener 事件处理函数
     */
    var domEventOn = function (element, type, listener) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }

        if (element.addEventListener) {
            element.addEventListener(type, listener, false);
        }
        else if (element.attachEvent) {
            element.attachEvent('on' + type, listener);
        }
    };

    /**
     * 默认样式类
     * @type {string}
     */
    var BASIC_CLASS = 'view-basic';

    /**
     * BasicView类
     * @constructor
     * @class BasicView
     * @extends fc.EventTarget
     *
     * @param {?Object} options 配置项
     * @param {string|HtmlElement} options.container 容器Id或DOM，平面化依据
     * @param {string=} options.className指定容器的自定义css的样式类
     * @param {Object|meta.Model|Function} options.model 模块的数据，也可以是方法
     *
     * @param {string=} options.templateName 主体内容的模板名称，需要确保已经加载模板
     * @param {string=} options.template 主体内容的模板HTML，使用fc.tpl处理
     *     template的优先级高于templateName
     *
     * @param {Object=} options.dialogOptions 对话框模式的配置，Dialog原生参数
     * @param {boolean} options.dialogOptions.closeButton 是否具有关闭按钮
     * @param {boolean} options.dialogOptions.closeOnHide 右上角关闭是隐藏还是移除
     * @param {boolean} options.dialogOptions.draggable 是否可拖拽
     * @param {boolean} options.dialogOptions.mask 是否具有遮挡层
     * @param {string} options.dialogOptions.title 标题的显示文字
     * @param {string} options.dialogOptions.defaultFoot 默认的foot模板
     * @param {boolean} options.dialogOptions.needFoot 是否需要展现foot，默认false
     * @param {Object=} options.dialogOptions.roles 此项待试验后补充
     *
     * 对外事件暴露
     * BasicView#inited 初始化完成
     * BasicView#rendered 渲染完成
     * BasicView#repainted 重绘完成
     * BasicView#disposed 销毁完成
     * BasicView#showed
     * BasicView#hided
     * BasicView#closed 界面关闭 之后会自动触发销毁
     * BasicView#loading 标记为加载中，仅在Model为异步时或者子Action模式时触发
     * BasicView#loaded 标记为加载完成，仅在Model为异步时或者子Action模式时触发
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
    var proto = {};
    proto.constructor = function (options) {
        options = options || {};
        this.guid = fc.util.guid();
        this.name += '-' + this.guid;
        this.lifeStage = new LifeStage(this);

        // 几个平铺属性
        this.options = options;
        this.container = options.container;
        this.viewContext = new ViewContext(this.name);

        if (options.template) {
            this.template = options.template;
        }
        if (options.templateName) {
            this.templateName = options.templateName;
        }

        // 请注意，生命周期的改变会自动fire同名事件
        this.lifeStage.changeTo(LifeStage.INITED);
    };

    proto.name = 'fc-view-basicView';

    /**
     * 获取主体容器的样式
     */
    proto.getClassName = function () {
        var className = BASIC_CLASS + (supportHtml5 ? ' html5': '');
        if (this.options.className) {
            className += ' ' + this.options.className;
        }
        return className;
    };

    /**
     * 失败处理
     */
    proto.handleError = function (e) {
        fc.util.processError(e);
    };

    /**
     * 获取环境内的UI实例
     * @param {string} id UI控件的id
     * @return {Object}
     */
    proto.get = function (id) {
        return this.viewContext.get(id);
    };

    /**
     * 根据id获取控件实例，如无相关实例则返回{@link SafeWrapper}
     *
     * @param {string} id 控件id
     * @return {Control} 根据id获取的控件
     */
    proto.getSafely = function (id) {
        return this.viewContext.getSafely(id);
    };

    /**
     * 获取一个控件分组
     *
     * @param {string} groupid 分组名称
     * @return {ControlGroup}
     */
    proto.getGroup = function (groupid) {
        if (!groupid) {
            throw new Error('groupid is unspecified');
        }

        return this.viewContext.getGroup(groupid);
    };

    /**
     * 获取数据对象
     * @return {Promise|meta.Model|Object} Promise对象或者Model对象或Object
     */
    proto.getModel = function () {
        var me = this;
        if (me.model) {
            return me.model;
        }

        if (typeof me.options.model === 'function') {
            var modelResult = me.options.model();
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
            return me.model;
        }
        return {};
    };

    /**
     * UI配置
     * @property
     * @type {?Object}
     */
    proto.uiProperties = null;

    /**
     * UI配置获取方法
     * @return {Object}
     */
    proto.getUIProperties = function () {
        return this.uiProperties || {};
    };

    /**
     * UI事件配置
     * @property
     * @type {?Object}
     * @this {BasicView}
     */
    proto.uiEvents = null;

    /**
     * UI事件配置获取方法
     * @return {Object}
     */
    proto.getUIEvents = function () {
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
    proto.initStructure = function () {

        fc.assert.has(this.viewContext, '创建容器时必须已经创建了ViewContext');

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
        }

        if (!me.container) {
            // 创建容器元素
            me.container = document.createElement('div');
            me.container.id = me.name;
            document.body.appendChild(me.container);
            // 创建Dialog
            me.main = fcui.create(
                'Dialog',
                fc.util.deepExtend(defaultOpts, me.options.dialogOptions, {
                    main: me.container
                })
            );

            // 部分事件代理过来
            me.main.on('close', me.close, me);

            // 立即展现
            me.main.show();
        }
        else {
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

    /**
     * 主体内容渲染器
     * @param {Object|meta.Model} data 数据
     * @return {string} 主体内容的HTML
     */
    proto.renderer = null;
    proto.getRenderer = function () {
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

    proto.render = function () {
        if (!this.lifeStage.is(LifeStage.NEW | LifeStage.INITED)) {
            this.repaint();
            return Promise.resolve();
        }

        return this.initStructure().then(
            _.bind(this.finishRender, this)
        ).catch(_.bind(this.handleError, this));
    };

    proto.finishRender = function () {
        var renderer = this.getRenderer();

        this.main.setProperties({
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
     * @param {BasicView} view BasicView对象实例
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
     * 给指定的控件组批量绑定事件，相同的处理
     *
     * @param {BasicView} view BasicView对象实例
     * @param {string} groupid 控件组的id
     * @param {string} eventName 事件名称
     * @param {function | string} handler 事件处理函数，或者对应的方法名
     * @return {function} 绑定到控件上的事件处理函数，不等于`handler`参数
     * @inner
     */
    function bindEventToGroup(view, groupid, eventName, handler) {
        // 因为控件组这时候实际上已经生成了，后续修改也不会影响整个对象，所以直接使用它
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

    proto.initBehavior = function () {};

    proto.repaint = function () {
        var renderer = this.getRenderer();

        // this.main.setProperties({
        //     content: renderer(this.model)
        // });
        this.main.setContent(renderer(this.model))

        // 请注意，生命周期的改变会自动fire同名事件
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

    /**
     * 关闭处理，销毁界面
     */
    proto.close = function () {
        // 要先fire closed，然后dispose，否则dispose会把所有之前挂的事件都去掉，
        // closed就on不到了。
        this.fire('closed');
        this.dispose();
    };

    /**
     * 销毁处理
     */
    proto.dispose = function () {

        if (this.lifeStage.is(LifeStage.DISPOSED)) {
            return;
        }

        // 销毁ui
        if (this.viewContext) {
            this.viewContext.dispose();
            this.viewContext = null;
        }

        if (this.container) {
            this.container.innerHTML = '';  // 清空了容器的html
            this.container = null;
        }

        // 请注意，生命周期的改变会自动fire同名事件
        this.lifeStage.changeTo(LifeStage.DISPOSED);

        // 销毁mini-Events的相关绑定事件
        this.destroyEvents();
    };

    var BasicView = fc.oo.derive(require('fc-core/EventTarget'), proto);

    return BasicView;
});