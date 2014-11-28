define('module/materialList/Model', [
    'require',
    'fc-ajax',
    'eoo',
    'fc-view/mvc/BaseModel'
], function (require) {
    var ajax = require('fc-ajax');
    var overrides = {};
    overrides.datasource = {};
    overrides.prepare = function () {
    };
    var Model = require('eoo').create(require('fc-view/mvc/BaseModel'), overrides);
    return Model;
});