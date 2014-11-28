/**
 * @file 模块 `entry/index` - Action定义
 *
 * @author wangkemiao(wangkemiao@baidu.com)
 */
define(function (require) {
    
    /**
     * 模块 `entry/index` - Action定义
     *
     * @class
     * @extends {er.Action}
     */
    var overrides = {};

    overrides.modelType = require('./Model');
    overrides.viewType = require('./View');

    /**
     * 初始化行为交互
     */
    overrides.customBehavior = function () {
        var me = this;
        me.view.on('plus1', function () {
            var value = +me.model.get('testing');
            me.model.set('testing', value + 1);
        });

    };

    var Action = require('eoo').create(require('fc-view/mvc/EntryAction'), overrides);

    return Action;
});
