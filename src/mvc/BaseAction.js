/**
 * @file fc-view BaseAction
 * 基于er.Action
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {

    var fc = require('fc-core');
    
    /**
     * @class meta.BaseAction
     * @constructor
     * @extends er.Action
     */
    var proto = {};
    proto.constructor = function () {
        // call super
        this.$super(arguments);
    };

    var BaseAction = fc.oo.derive(require('er/Action'), proto);
    return BaseAction;
});