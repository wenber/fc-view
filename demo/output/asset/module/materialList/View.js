define('module/materialList/View', [
    'require',
    'etpl/tpl!./tpl.html',
    'css!./style.css',
    'eoo',
    'fc-view/mvc/BaseView'
], function (require) {
    require('etpl/tpl!./tpl.html');
    require('css!./style.css');
    var overrides = {};
    overrides.template = 'module-materialList';
    overrides.enterDocument = function () {
    };
    var View = require('eoo').create(require('fc-view/mvc/BaseView'), overrides);
    return View;
});