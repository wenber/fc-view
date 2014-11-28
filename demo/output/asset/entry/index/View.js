define('entry/index/View', [
    'require',
    'etpl/tpl!./tpl.html',
    'css!./style.css',
    'fcui/TextBox',
    'fcui/Button',
    'module/simpleList/Entry',
    'eoo',
    'fc-view/mvc/BaseView'
], function (require) {
    require('etpl/tpl!./tpl.html');
    require('css!./style.css');
    require('fcui/TextBox');
    require('fcui/Button');
    var overrides = {};
    overrides.template = 'entry-index';
    overrides.uiProperties = {
        'k-text-box': {
            value: '*testing',
            placeholder: 'owjeiojwo'
        }
    };
    overrides.uiEvents = {
        'k-text-box': { focus: 'onfocus' },
        'k-button': {
            click: function () {
                this.fire('plus1');
            }
        },
        'k-button-1:click': 'click1',
        '@k-g-button-group:click': 'clickGroup',
        '@k-g-button-group': {
            click: function () {
                alert('multi click');
            }
        }
    };
    overrides.onfocus = function () {
        this.get('k-text-box').setValue('');
    };
    overrides.click1 = function () {
        var SimpleListEntry = require('module/simpleList/Entry');
        var simpleList = new SimpleListEntry({
                dialogOptions: {
                    title: 'hello world!',
                    height: 300
                }
            });
        simpleList.show();
    };
    overrides.clickGroup = function (e) {
        var target = e.target;
        alert(target.id);
    };
    overrides.customDocument = function () {
        var me = this;
        var SimpleListEntry = require('module/simpleList/Entry');
        var simpleList = new SimpleListEntry({
                container: 'materialList',
                model: this.model
            });
        simpleList.show();
    };
    var View = require('eoo').create(require('fc-view/mvc/BaseView'), overrides);
    return View;
});