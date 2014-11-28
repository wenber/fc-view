/**
 * @file 模块 `module/materialList` - Action定义
 *
 * @author wangkemiao(wangkemiao@baidu.com)
 */
define(function (require) {
    
    /**
     * 模块 `module/materialList` - Action定义
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
    overrides.initBehavior = function () {
        debugger;
    };

    var Action = require('eoo').create(require('fc-view/mvc/BaseAction'), overrides);

    return Action;
});
