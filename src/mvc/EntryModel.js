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
        var newContext = fc.util.deepExtend({}, this.getDefaultArgs(), context);
        // call super
        this.$super([newContext]);
    };
    
    proto.defaultArgs = {};

    proto.getDefaultArgs = function () {
        return this.defaultArgs || {};
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

    return fc.oo.derive(require('./BaseModel'), proto);
});