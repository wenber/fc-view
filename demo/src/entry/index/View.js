/**
 * @file 模块 `entry/index` - View定义
 *
 * @author wangkemiao(wangkemiao@baidu.com)
 */

define(function (require) {

    // 加载tpl
    require('etpl/tpl!./tpl.html');
    // require('etpl/tpl!./list/tpl.html');

    // 加载样式
    require('css!./style.less');

    require('fcui/TextBox');
    require('fcui/Button');

    /**
     * 模块 `entry/index` - View定义
     *
     * @class
     * @extends {er.View}
     */
    var overrides = {};

    /**
     * @property {string} template 所使用的模板
     */
    overrides.template = 'entry-index';

    overrides.uiProperties = {
        'k-text-box': {
            value: '*testing',
            placeholder: 'owjeiojwo'
        }
    };

    /**
     * ui事件
     */
    overrides.uiEvents = {
        'k-text-box': {
            focus: 'onfocus'
        },
        'k-button': {
            click: function () {
                this.fire('plus1');
            }
        },
        'k-button-1:click': 'click1',
        '@k-g-button-group:click': 'clickGroup',
        '@k-g-button-group': {
            click: function () {
                alert('multi click')
            }
        }
    };

    overrides.onfocus = function () {
        this.get('k-text-box').setValue('');
    }

    overrides.click1 = function () {
        var SimpleListEntry = require('module/simpleList/Entry');
        var simpleList = new SimpleListEntry({
            dialogOptions: {
                title: 'hello world!',
                height: 300
            }
        });

        simpleList.show();
    }

    overrides.clickGroup = function (e) {
        var target = e.target;
        alert(target.id);
    }

    overrides.customDocument = function () {
        var me = this;
        var SimpleListEntry = require('module/simpleList/Entry');
        var simpleList = new SimpleListEntry({
            container: 'materialList',
            model: this.model
        });

        simpleList.show();
    }

    var View = require('eoo').create(require('fc-view/mvc/BaseView'), overrides);

    return View;
});
