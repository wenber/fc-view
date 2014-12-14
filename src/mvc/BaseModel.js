/**
 * @file fc-view BaseModel
 * 整体模式修改，基于emc/Model实现
 * 当前整体模式基于ecomfe/er/4.0/feature/mvc的Model实现
 *
 * @author Gray Zhang(otakustay@gmail.com)
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {

    var _ = require('underscore');
    var fc = require('fc-core');
    var Promise = require('fc-core/Promise');
    require('./DataLoader');

    /**
     * 在ER框架中，Model并不一定要继承该类，任何对象都可以作为Model使用
     *
     * ER对于Model的处理如下：
     *
     * 1. 通过{@Action#.createModel}方法创建一个对象，或通过其它手段通过{@link Action#.setModel}提供{@link Model}实例
     * 2. 如果该对象有`load`函数，则执行该函数，并分为以下情况，通过`Promise`处理异步
     * 3. 如果对象没有`load`函数，则默认对象本身就是Model
     * 4. 当离开Action时，如果Model有`dispose`方法，则会调用以销毁对象
     *
     * 该Model类为一个通用的可配置的基类，提供了数据加载的相关方法
     *
     * @class meta.BaseModel
     *
     * @extends emc.Model
     */
    var overrides = {};

    /**
     * @constructor
     * @param {Object} context 初始化的数据
     */
    overrides.constructor = function (context) {
        var me = this;
        me.$super(arguments);

        // 配置dataLoaderSet
        _.each(me.dataLoaderSet, function (item) {
            item.setStore(me);
        });

        // 初始化函数，用于在无法修改构造函数的情况下手动使用
        me.initialize();
    };

    /**
     * 初始化函数，用于在无法修改构造函数的情况下手动使用
     *
     * @method BaseModel#.initialize
     * @protected
     */
    overrides.initialize = _.noop;

    /**
     * 加载数据，在完成数据处理后返回
     *
     * @method BaseModel#.load
     *
     * @return {Promise | undefined} 方法会在{@link BaseModel#.prepare}之后再返回
     */
    overrides.load = function () {
        var dataLoader = this.getDataLoader();
        var loading = Promise.cast(dataLoader ? dataLoader.load() : []);
        if (this.prepare) {
            return loading.then(_.bind(this.forwardToPrepare, this));
        }
        return loading;
    };

    /**
     * 加载数据后进入数据准备阶段
     *
     * @method BaseModel#.forwardToPrepare
     * @protected
     *
     * @param {meta.DataLoadResult[]} results 数据加载的结果集
     * @return {meta.DataLoadResult[]} 数据加载的结果集
     */
    overrides.forwardToPrepare = function (results) {
        return new Promise(_.bind(this.prepare, this)).then(
            function () {
                var success = {
                    success: true,
                    name: '$prepare',
                    options: {}
                };
                results.push(success);
                return results;
            },
            function (ex) {
                var error = {
                    success: false,
                    name: '$prepare',
                    options: {},
                    error: ex
                };
                results.push(error);
                return results;
            }
        );
    };

    /**
     * 处理加载后的数据
     *
     * 这个方法用于在{@link BaseModel#.load}完毕后，调整一些数据结构
     *
     * 在该方法执行时，当前的{@link BaseModel}对象中已经有{@link BaseModel#.load}方法填充的数据，
     * 可使用{@link BaseModel#.get}、{@link BaseModel#.set}和{@link BaseModel#.remove}方法对数据进行调整
     *
     * 需要使用传入的`resolve`和`reject`方法来改变状态
     *
     * @method BaseModel#.prepare
     * @protected
     * @param {Function} resolve 标记当前为完成
     * @param {Function} reject 标记当前为拒绝
     */
    overrides.prepare = function (resolve, reject) {
        resolve();
    };

    /*
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

    /**
     * 销毁当前{@link BaseModel}对象，会尝试停止所有正在加载的数据
     *
     * @method BaseModel#.dispose
     */
    overrides.dispose = function () {
        this.$super();
        var dataLoader = this.getDataLoader();
        if (dataLoader) {
            dataLoader.dispose();
            dataLoader = null;
        }
        // 配置dataLoaderSet
        _.each(this.dataLoaderSet, function (item) {
            item.setStore(null);
        });
    };

    /**
     * 获取关联数据加载器
     *
     * @method Model#.getDataLoader
     *
     * @return {DataLoader}
     * @protected
     */
    overrides.getDataLoader = function () {
        return this.dataLoader;
    };

    /**
     * 设置关联的数据加载器
     *
     * @method Model#.setDataLoader
     *
     * @param {DataLoader} dataLoader 需要关联的数据加载器实例
     * @protected
     */
    overrides.setDataLoader = function (dataLoader) {
        dataLoader.setStore(this);
        this.dataLoader = dataLoader;
    };

    var BaseModel = fc.oo.derive(require('emc/Model'), overrides);
    BaseModel.formatter = require('./formatter');

    return BaseModel;
});
