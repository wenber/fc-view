/**
 * @file
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {
    
    var _ = require('underscore');
    var fc = require('fc-core');

    var proto = {};

    /**
     * 数据更新后重新加载操作
     * @protected
     */
    proto.reloadWithUpdatedModel = function () {
        var model = this.model;
        var url = this.context.url;
        var path = url.getPath();

        // 如果跟默认的参数相同，去掉默认字段
        // var defaultArgs = this.model.getDefaultArgs();
        var args = model.dumpForQuery();
        var targetUrl = require('er/URL').withQuery(path, args).toString();
        this.redirect(targetUrl, { force: true });
    };

    proto.initBehavior = function () {
        this.model.on('change', _.bind(this.reloadWithUpdatedModel, this));
        this.customBehavior();
    };

    proto.customBehavior = function () { };

    var EntryAction = fc.oo.derive(require('./BaseAction'), proto);

    return EntryAction;
});