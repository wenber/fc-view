/**
 * @file fc-view/component/BaseComponent 基础类
 * 本类提供一个可复用的组件化机制下的基础Component类，本类为虚类，请使用实体类
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {

    var _ = require('underscore');
    var fc = require('fc-core');
    var fcui = require('fcui');
    var Promise = require('fc-core/Promise');
    var ViewContext = require('fcui/ViewContext');
    var LifeStage = require('fc-component-ria/LifeStage');

    // 默认使用EntryModel
    var EntryModel = require('../mvc/EntryModel');

    require('fcui/Panel');
    require('fcui/Dialog');

    /**
     * BaseComponent类
     * @class BaseComponent
     * @extends fc.EventTarget
     *
     * 生命周期：using LifeStage
     * NEW -> INITED -> RENDERED -> REPAINTED -> DISPOSED
     *
     * 对外事件暴露
     * BaseComponent#inited 初始化完成
     * BaseComponent#rendered 渲染完成
     * BaseComponent#repainted 重绘完成
     * BaseComponent#disposed 销毁完成
     * BaseComponent#showed
     * BaseComponent#closed 界面关闭 之后会自动触发销毁
     * BaseComponent#loading 标记为加载中，仅在Model为异步时或者子Action模式时触发
     * BaseComponent#loaded 标记为加载完成，仅在Model为异步时或者子Action模式时触发
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
     * 交互处理方法：initBehavior
     *
     */
    var overrides = {};

    /**
     * 处理配置，转为类的属性
     * @param {Object} options 配置
     * @param {ViewContext} options.viewContext ui环境
     * @param {ComponentContext} options.componentContext 组件环境
     * @param {EntryModel} options.model 数据Model
     * @param {Object=} options.args 额外的数据，可用于Model初始化使用
     * @param {HtmlElement | string} options.container 容器
     * @param {string} options.template 模板内容
     * @param {Object=} options.dialogOptions 对话框模式的配置
     */
    overrides.initOptions = function (options) {
        var dialogOptions = _.extend(
            this.dialogOptions || {}, options.dialogOptions
        );

        this.$super(arguments);

        this.dialogOptions = dialogOptions;
        this.dialogOptions.closeOnHide = true;  // 强制隐藏关闭（销毁）
    };

    /**
     * 获取ViewContext
     * @return {fcui.ViewContext}
     */
    overrides.getViewContext = function () {
        if (!this.viewContext) {
            this.viewContext = new ViewContext(this.id);
        }
        return this.viewContext;
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
     * 为Component设置dataLoader
     * 如果是共享的Model，此处不设为Model的主dataLoader
     * 否则，设置为主dataLoader
     * @param {DataLoader} dataLoader 需要关联的数据加载器实例
     */
    overrides.setDataLoader = function (dataLoader) {
        var model = this.getModel();
        if (this._options.model) {
            model.addDataLoader(this.name, dataLoader);
        }
        else {
            model.setDataLoader(dataLoader);
        }
        this.dataLoader = dataLoader;
    };

    /**
     * model类名，构造器
     * @type {?Model}
     */
    overrides.modelType = EntryModel;

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
     * @this {BaseComponent}
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
     * @param {Object} target 数据所在
     * @param {string} path 获取路径
     * @return {*}
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
            var model = this.getModel();
            var result = typeof model.get === 'function'
                ? model.get(path[0])
                : model[path[0]];
            return path.length > 1
                ? getProperty(result, path.slice(1))
                : result;
        }

        return value;
    };

    /**
     * 创建主体容器
     */
    overrides.initStructure = function () {

        var viewContext = this.getViewContext();

        if (typeof this.container === 'string') {
            this.container = document.getElementById(this.container);
        }

        var me = this;
        var defaultOpts = {
            id: me.id,
            main: me.container,
            viewContext: viewContext,
            needFoot: true,
            draggable: true,
            renderOptions: {
                properties: me.getUIProperties(),
                valueReplacer: _.bind(me.replaceValue, me)
            }
        };

        if (!me.container) {
            // 创建容器元素
            me.container = document.createElement('div');
            me.container.id = me.id;
            me.container.setAttribute('component-id', me.id);
            if (me.parentId) {
                me.container.setAttribute('parent-component-id', me.parentId);
            }
            document.body.appendChild(me.container);
            // 创建Dialog
            me.control = fcui.create(
                'Dialog',
                _.deepExtend(defaultOpts, me.dialogOptions, {
                    main: me.container
                })
            );

            // 部分事件代理过来
            me.control.on('close', function () {
                me.fire('hide');
            });
            me.control.on('hide', function () {
                me.fire('hide');
            });

            // 立即展现
            me.control.show();
        }
        else {
            me.control = fcui.create('Panel', defaultOpts);
            me.control.render();
            me.container.setAttribute('component-id', me.id);
            if (me.parentId) {
                me.container.setAttribute('parent-component-id', me.parentId);
            }
        }

        // 在主元素上加个属性，以便找到`ComponentContext`
        if (this.componentContext) {
            this.container.setAttribute(
                'component-context',
                this.componentContext.id
            );
        }

        // 增加className
        me.container.className += ' ' + me.getClassName();
    };

    /**
     * loading的HTML，优先级高于loadingTemplateName
     */
    overrides.loadingTemplate = null;

    /**
     * loading的模板名称
     */
    overrides.loadingTemplateName = null;

    /**
     * loading内容渲染器
     */
    overrides.loadingRenderer = null;
    var DEFAULT_LOADING_TPL = '${loading|raw}';
    overrides.getLoadingRenderer = function () {
        if (this.loadingRenderer == null) {
            // 渲染器
            if (this.loadingTemplate) {
                this.loadingRenderer = fc.tpl.compile(this.loadingTemplate);
            }
            else if (this.loadingTemplateName) {
                this.loadingRenderer = fc.tpl.getRenderer(
                    this.loadingTemplateName
                );
            }

            if (!this.loadingRenderer) {
                this.loadingRenderer = fc.tpl.compile(DEFAULT_LOADING_TPL);
            }
        }
        return this.loadingRenderer;
    };

    overrides.render = function () {
        // 初始化结构
        this.initStructure();

        var model = this.getModel();

        // 显示loading界面
        var loadingRenderer = this.getLoadingRenderer();
        this.control.setProperties({
            content: loadingRenderer(model.loadingData)
        });
        this.fire('loading');

        var state = model.load()
            .then(_.bind(this.prepare, this))
            .then(_.bind(this.finishRender, this));
        state.catch(_.bind(this.handleError, this));
        return state;
    };

    overrides.finishRender = function () {
        var me = this;
        me.fire('loaded');
        var renderer = me.getRenderer();

        if (renderer) {
            me.control.setProperties({
                content: renderer(me.getTemplatedData())
            });
        }

        // 请注意，生命周期的改变会自动fire同名事件
        me.lifeStage.changeTo(LifeStage.RENDERED);

        // 环境内的ui被重置，所以要重新绑定事件
        me.initUIEvents();

        // 供外部来处理交互
        me.initBehavior();

        // 初始化事件
        me.bindEvents();
    };

    overrides.repaint = function () {

        var me = this;
        var renderer = me.getRenderer();
        if (renderer) {
            me.control.setContent(renderer(me.getTemplatedData()));
        }

        // me.control.repaint();

        // 请注意，生命周期的改变会自动fire同名事件
        me.lifeStage.changeTo(LifeStage.REPAINTED);

        // 环境内的ui被重置，所以要重新绑定事件
        me.initUIEvents();

        // 初始化事件
        me.bindEvents();

        return Promise.resolve();
    };

    /**
     * 给指定的控件绑定事件
     *
     * @param {BaseComponent} module BaseComponent对象实例
     * @param {string} id 控件的id
     * @param {string} eventName 事件名称
     * @param {Function | string} handler 事件处理函数，或者对应的方法名
     * @return {Function} 绑定到控件上的事件处理函数，不等于`handler`参数
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
     * @param {BaseComponent} module BaseComponent对象实例
     * @param {string} groupid 控件组的id
     * @param {string} eventName 事件名称
     * @param {function | string} handler 事件处理函数，或者对应的方法名
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

                for (var gType in map) {
                    if (!map.hasOwnProperty(gType)) {
                        continue;
                    }
                    var gHandler = map[gType];
                    if (key.charAt(0) === '@') {
                        // group处理
                        bindEventToGroup(me, key.substring(1), gType, gHandler);
                    }
                    else {
                        bindEventToControl(me, key, gType, gHandler);
                    }
                }
            }
        }
    };

    // 增加两个交互

    /**
     * 显示一条提示信息
     * @protected
     * @param {string | Object} content 提示的内容或完整的配置项
     * @param {string=} title 提示框的标题，如`content`提供配置项则无此参数
     * @return {meta.Promise} 异步状态
     */
    overrides.waitAlert = function (content, title) {
        var options = typeof content === 'string'
            ? {title: title || document.title, content: content}
            : _.clone(content);
        if (!options.viewContext) {
            options.viewContext = this.viewContext;
        }

        return new Promise(function (resolve, reject) {
            var Dialog = require('fcui/Dialog');
            var dialog = Dialog.alert(options);
            dialog.on('ok', resolve);
            // 获取可以选择超时reject ?
        });
    };

    /**
     * 显示一条确认信息
     * @protected
     * @param {string | Object} content 提示的内容或完整的配置项
     * @param {string=} title 提示框的标题，如`content`提供配置项则无此参数
     * @return {meta.Promise} 异步状态
     */
    overrides.waitConfirm = function (content, title) {
        var options = typeof content === 'string'
            ? {title: title || document.title, content: content}
            : _.clone(content);
        if (!options.viewContext) {
            options.viewContext = this.viewContext;
        }

        return new Promise(function (resolve, reject) {
            var Dialog = require('esui/Dialog');
            var dialog = Dialog.confirm(options);
            dialog.on('ok', resolve);
            dialog.on('cancel', reject);
        });
    };

    overrides.dispose = function () {
        if (this.lifeStage.is(LifeStage.DISPOSED)) {
            return;
        }

        // 不直接dispose viewContext……
        this.control.dispose();
        this.viewContext = null;

        this.$super(arguments);
    };

    var BaseComponent = fc.oo.derive(require('fc-component-ria/BaseComponent'), overrides);

    return BaseComponent;
});
