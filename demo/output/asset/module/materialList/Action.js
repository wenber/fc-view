define('module/materialList/Action', [
    'require',
    './Model',
    './View',
    'eoo',
    'fc-view/mvc/BaseAction'
], function (require) {
    var overrides = {};
    overrides.modelType = require('./Model');
    overrides.viewType = require('./View');
    overrides.initBehavior = function () {
        debugger;
    };
    var Action = require('eoo').create(require('fc-view/mvc/BaseAction'), overrides);
    return Action;
});