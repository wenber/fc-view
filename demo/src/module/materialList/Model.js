/**
 * @file 模块 `module/materialList` - Model定义
 *
 * @author wangkemiao(wangkemiao@baidu.com)
 */

define(function (require) {

    var ajax = require('fc-ajax');

    /**
     * 模块 `module/materialList` - Model定义
     *
     * @class
     * @extends {er.Model}
     */
    var overrides = {};

    /**
     * 请求数据以及准备基础数据
     */
    overrides.datasource = {
        // materialList: {
        //     retrieve: function (model) {
        //         return ajax.request('vega/GET/mtl/planlist', {
        //             "fields":["planid","pausestat","planname","shows","clks","paysum","trans","avgprice","plandynamicideastat","acctdynamicideastat","mPriceFactor","planstat","remarketingstat","deviceprefer","wregion","qrstat1","phonetrans","allipblackcnt","clkrate","wbudget","plancyc","showprob","allnegativecnt","showpay"],"startTime":"2014-11-20","endTime":"2014-11-20","levelCond":{"userid":630152},"pageSize":50,"pageNo":1
        //         }).then(
        //             function (response) {
        //                 return response.data;
        //             },
        //             function () {
        //                 return {};
        //             }
        //         ).catch(function () {
        //             return {};
        //         });
        //     },
        //     dump: true
        // }
    };

    /**
     * 数据请求完成之后的后置处理
     */
    overrides.prepare = function () {};

    var Model = require('eoo').create(require('fc-view/mvc/BaseModel'), overrides);

    return Model;
});
