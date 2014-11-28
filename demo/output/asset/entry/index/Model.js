define('entry/index/Model', [
    'require',
    'fc-ajax',
    'eoo',
    'fc-view/mvc/EntryModel'
], function (require) {
    var ajax = require('fc-ajax');
    var overrides = {};
    overrides.datasource = {
        context: function (model) {
            return ajax.request('vega/GET/material', {
                'level': 'useracct',
                'fields': [
                    'wregion',
                    'bgttype',
                    'wbudget',
                    'weekbudget',
                    'userstat',
                    'qrstat1'
                ]
            });
        },
        materialList: {
            retrieve: function () {
                return ajax.request('vega/GET/mtl/planlist', {
                    'fields': [
                        'planid',
                        'pausestat',
                        'planname',
                        'shows',
                        'clks',
                        'paysum',
                        'trans',
                        'avgprice',
                        'plandynamicideastat',
                        'acctdynamicideastat',
                        'mPriceFactor',
                        'planstat',
                        'remarketingstat',
                        'deviceprefer',
                        'wregion',
                        'qrstat1',
                        'phonetrans',
                        'allipblackcnt',
                        'clkrate',
                        'wbudget',
                        'plancyc',
                        'showprob',
                        'allnegativecnt',
                        'showpay'
                    ],
                    'startTime': '2014-11-20',
                    'endTime': '2014-11-20',
                    'levelCond': { 'userid': 630152 },
                    'pageSize': 50,
                    'pageNo': 1
                }).then(function (response) {
                    return response.data;
                }, function () {
                    return {};
                }).catch(function () {
                    return {};
                });
            },
            dump: true
        }
    };
    overrides.defaultArgs = { testing: 1 };
    overrides.prepare = function () {
        p('recieved material && biz processing')();
    };
    var Model = require('eoo').create(require('fc-view/mvc/EntryModel'), overrides);
    return Model;
});