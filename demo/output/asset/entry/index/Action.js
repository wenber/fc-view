define('entry/index/Action', [
    'require',
    './Model',
    './View',
    'eoo',
    'fc-view/mvc/EntryAction'
], function (require) {
    var overrides = {};
    overrides.modelType = require('./Model');
    overrides.viewType = require('./View');
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