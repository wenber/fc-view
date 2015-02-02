/**
 * @file fc-view主入口文件
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {
    'use strict';

    var fc = require('fc-core');
    var _ = require('underscore');

    /**
     * fc-view 模块
     * @module view
     */
    var view = {
        version: '0.0.1-alpha.18',

        /**
         * 注册actionConf配置
         * @param {Array} list actionConf的配置
         */
        registerAction: function (list) {
            require('er/controller').registerAction(_.flatten(list));
        },

        /**
         * 全局的start方法
         * @return {meta.Promise} Promise对象
         */
        start: function () {
            var erEvents = require('er/events');
            // 针对于ER的错误处理，配置其不吞错，直接使用util.processError来处理
            erEvents.on('error', fc.util.processError);
            require('er').start();
            // return require('fc-core/Promise').resolve({});
        }
    };

    // 在此直接屏蔽掉er.View的dispose，它会让container内容清空
    require('er/View').prototype.dispose = _.noop;

    return view;
});
