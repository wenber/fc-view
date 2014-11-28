/**
 * @file [please input description]
 *
 * @author wangkemiao(wangkemiao@baidu.com)
 */

define(function (require) {

    var _ = require('underscore');
    var fc = require('fc-core');
    var ajax = require('fc-ajax');
    var Promise = require('fc-core/Promise');

    // require('entry/index/Action');

    window.p = function (msg) {
        return function (res) {
            var toShow = msg;
            if (this.option) {
                toShow = '[' + this.option.data.path + '] ' + toShow;
            }
            console.log(toShow, performance.now());
        }
    }

    require('fc-ajax/config').url = 'request.ajax';
    require('fc-ajax/globalData').userid = 666666;

    var ajaxHooks = require('fc-ajax/hooks');

    ajaxHooks.beforeEachRequest = p('hook.beforeEachRequest', true);
    ajaxHooks.afterEachRequest = p('hook.afterEachRequest');
    ajaxHooks.eachSuccess = p('hook.eachSuccess');
    ajaxHooks.eachFailure = p('hook.eachFailure');

    ajaxHooks.businessCheck = function (response) {
        if (typeof response === 'object') {
            if (this.option.data.path === 'GET/basicInfo') {
                return response;
            }
            if (response.status === 200) {
                return response
            }
        }

        throw new Error('response data has sth error');
    };

    var noop = function (res) { console.error('fail biz handler', res); return Promise.reject(); };

    var requesting = ajax.request('GET/basicInfo');
    requesting.then(
        function (response) {
            p('recieved basicInfo && biz processing')();
            var er = require('er');
            require('er/config').indexURL = '/entry/index';
            var actionConf = _.flatten(require('./actionConf'));
            require('er/controller').registerAction(actionConf);
            er.start();
        },
        noop
    );
});
