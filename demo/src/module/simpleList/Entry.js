/**
 * @file
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {
    var fc = require('fc-core');
    var ajax = require('fc-ajax');

    require('etpl/tpl!./tpl.html');

    var proto = {};

    proto.templateName = 'module-simpleList';

    proto.getModel = function () {
        var me = this;
        return ajax.request('vega/GET/mtl/planlist', {
            "fields":["planid","pausestat","planname","shows","clks","paysum","trans","avgprice","plandynamicideastat","acctdynamicideastat","mPriceFactor","planstat","remarketingstat","deviceprefer","wregion","qrstat1","phonetrans","allipblackcnt","clkrate","wbudget","plancyc","showprob","allnegativecnt","showpay"],"startTime":"2014-11-20","endTime":"2014-11-20","levelCond":{"userid":630152},"pageSize":50,"pageNo":1
        }).then(
            function (response) {
                return response.data;
            },
            function () {
                return {};
            }
        ).catch(function () {
            return {};
        }).ensure(function (result) {
            me.model = result;
        });
    };

    proto.uiProperties = {
        'simpleList-button': {
            content: '@totalCount'
        }
    }

    return fc.oo.derive(require('fc-view/view/BasicView'), proto);
});