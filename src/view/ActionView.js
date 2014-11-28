/**
 * @file fc-view/view/ActionView ER子Action的子模块类
 * ActionView类的提出并不是为了ER的子Action服务，而是为了子模块服务
 * 所以不要将BasicView单纯的作为子Action的展现器来使用
 * 因此部分方法将以接口的形式实现，需要子类继承并覆盖
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {

    var fc = require('fc-core');
    var Promise = require('fc-core/Promise');
    var erEvents = require('er/events');

    var noop = function () {};
    
    /**
     * ActionView类
     * @constructor
     * @class ActionView
     * @extends BasicView
     *
     * @param {?Object} options 配置项
     *     这里仅说明了不同之处，具体请查看@link {BasicView}
     *
     * @param {string=} options.actionPath 指定容器将使用的er3的Action的path配置
     *     如果指定erPath，则使用ER子Action模式，优先级高于template形式
     * @param {Object=} options.actionOptions  er3的子Action的配置
     *
     * 对外事件暴露
     * ActionView#inited 初始化完成
     * ActionView#rendered 渲染完成
     * ActionView#repainted 重绘完成
     * ActionView#disposed 销毁完成
     * ActionView#showed
     * ActionView#hided
     * ActionView#closed 界面关闭 之后会自动触发销毁
     * ActionView#loading 标记为加载中，仅在Model为异步时或者子Action模式时触发
     * ActionView#loaded 标记为加载完成，仅在Model为异步时或者子Action模式时触发
     *
     * 环境访问
     * 获取UI：instance.get(id) 或 instance.viewContext.get(id)
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

        if (options.actionPath) {
            this.actionPath = options.actionPath;
        }
        if (options.actionOptions) {
            this.actionOptions = options.actionOptions;
        }

        fc.assert.has(this.actionPath, 'ActionView必须指定actionPath');
        fc.assert.has(this.actionOptions, 'ActionView必须指定actionOptions');

        this.$super([options]);
    };

    // 被屏蔽的几个东西
    // 请在MVC的V中处理
    proto.getUIProperties = noop;
    proto.getUIEvents = noop;
    proto.replaceValue = noop;

    /**
     * 加载的Action的类型
     *
     * @type {string}
     */
    proto.actionType = null;

    /**
     * 加载的Action的实例
     *
     * @type {er.Action | er.meta.Promise}
     * @readonly
     */
    proto.action = null;

    /**
     * 代理子Action的事件
     *
     * @param {mini-event.Event} e 事件对象
     */
    function delegateActionEvent(e) {
        var event = require('mini-event').fromEvent(e, {
            preserveData: true,
            syncState: true
        });
        event.type = 'action@' + e.type;
        this.fire(event);
    }

    /**
     * 把已经加载的子Action赋值到控件上
     *
     * @param {mini-event.Event} e 事件对象
     */
    function attachAction(e) {
        if (!e.isChildAction || e.container !== this.main.id) {
            return;
        }

        this.action = e.action;

        // 代理所有的子Action的事件
        if (typeof this.action.on === 'function') {
            this.action.on('*', delegateActionEvent, this);
        }

        this.fire('actionattach');
    }

    /**
     * 通知子Action加载完毕
     *
     * @param {mini-event.Event} e 事件对象
     */
    function notifyActionLoadComplete(e) {
        if (!e.isChildAction || e.container !== this.main.id) {
            return;
        }

        this.fire('actionloaded');
    }

    /**
     * 通知子Action加载失败
     *
     * @param {mini-event.Event} e 事件对象
     * @param {string} e.reason 失败原因
     */
    function notifyActionLoadFailed(e) {
        if (!e.isChildAction || e.container !== this.main.id) {
            return;
        }

        this.action = null;
        this.fire(
            'actionloadfail',
            { failType: e.failType, reason: e.reason }
        );
    }

    /**
     * 通知子Action加载中断
     *
     * @param {mini-event.Event} e 事件对象
     * @param {string} e.reason 失败原因
     * @inner
     */
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
        // 渲染的收尾工作
        // 不再使用模板处理了
        // me.model一定有东西了

        var controller = require('er/controller');

        this.action = controller.renderChildAction(
            url,
            this.container.id,
            this.getActionOptions()
        );

        // 如果发生错误，因为事件是同步触发的，
        // 因此先执行`notifyActionLoadFailed`再赋值，导致没清掉。
        // 错误时返回的`Promise`对象是没有`abort`方法的，
        // 这种对象我们也不需要，因此直接清掉
        if (typeof this.action.abort !== 'function') {
            this.action = null;
        }

        // this.initUIEvents();

        // // 供外部来处理交互
        // this.initBehavior();

        // 请注意，生命周期的改变会自动fire同名事件
        this.lifeStage.changeTo(LifeStage.RENDERED);
    };


    /**
     * 代理子Action模式的Panel的事件到BasicView上
     *
     * @param {Object} e 事件对象
     */
    function delegateActionPanelEvent(e) {
        var event = require('mini-event').fromEvent(e, {
            preserveData: true,
            syncState: true
        });

        // 清除action@前缀
        event.type = e.type.replace(/^action@/g, '');
        // 增加标记是子Action过来的
        event.triggerSource = 'action';
        this.fire(event);
    }

    /**
     * 销毁Action
     */
    proto.disposeAction = function () {
        var action = this.action;

        if (!action) {
            return;
        }

        // Action正在加载，正确的`renderChildAction`得到的加载器有`abort`方法
        if (Promise.isPromise(action) && typeof action.abort === 'function') {
            action.abort();
        }
        // 已经加载完的Action，但并不一定会有`leave`或`un`方法
        else {
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

        // 移除注册的一堆方法
        events.un('enteraction', attachAction, this);
        events.un('enteractioncomplete', notifyActionLoadComplete, this);
        events.un('actionnotfound', notifyActionLoadFailed, this);
        events.un('permissiondenied', notifyActionLoadFailed, this);
        events.un('actionfail', notifyActionLoadFailed, this);
        events.un('enteractionfail', notifyActionLoadFailed, this);
        events.un('actionabort', notifyActionLoadAborted, this);

        this.$super(arguments);
    }

    var ActionView = fc.oo.derive(require('./BasicView'), proto);

    return ActionView;

});