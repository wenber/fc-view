/**
 * @file
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {

    var _ = require('underscore');
    var fc = require('fc-core');

    var proto = {};

    proto.constructor = function (context) {
        // fix context with defaultArgs
        var newContext = _.chain(context)
            .defaults(this.getDefaultArgs())
            .value();
        // call super
        this.$super([newContext]);
    };

    /**
     * 获取去除一些默认key的Model，可以用做传递或者URL使用
     */
    proto.dumpForQuery = function () {
        var dumpedModel = this.dump();
        var toExclude = {
            url: 1,
            container: 1,
            isChildAction: 1,
            referrer: 1,
            context: 1
        };

        var toReturn = {};
        for (var k in dumpedModel) {
            if (dumpedModel.hasOwnProperty(k) && !toExclude[k]) {
                if (!_.isObject(dumpedModel[k])) {
                    toReturn[k] = dumpedModel[k];
                }
            }
        }

        return toReturn;
    };

    proto.resolveQuery = function (data) {
        var url = this.get('url');
        var query = url.getQuery();

        // 过滤掉没变的默认参数
        query = _.chain(query)
            .extend(data)
            .extend(this.getExtraQuery())
            .purify(this.getDefaultArgs())
            .value();

        var path = url.getPath();

        return require('er/URL').withQuery(path, query).toString();
    };

    proto.loadingData = {
        loading: '<span class="view-loading">加载中...</span>'
    };

    proto.defaultArgs = {};

    proto.getDefaultArgs = function () {
        return this.defaultArgs || {};
    };

    /**
     * 获取附加的请求参数
     *
     * @return {Object}
     * @protected
     */
    proto.getExtraQuery = function () {
        return {};
    };

    /**
     * 对合并好的请求参数进行统一的后续处理
     *
     * @param {Object} query 需要处理的参数对象
     * @return {Object}
     * @protected
     */
    proto.filterQuery = function(query) {
        return query;
    };

    proto.load = function () {
        // 先灌入defaultArgs
        this.fill(this.getDefaultArgs, { silent: true });
        return this.$super(arguments);
    };

    return fc.oo.derive(require('./BaseModel'), proto);
});