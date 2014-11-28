/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: common/esl/tpl.js
 * desc: 模板加载插件，适配ESL
 *
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/07/24 $
 */
define( 'tpl', function (require) {
    var er = require('deprecated/core/lib/er');
    return {
        load: function ( resourceId, req, load, config ) {
            require('fc-ajax/request').request(req.toUrl(resourceId), {
                dataType: 'text'
            }).then(
                function (data) {
                    try {
                        er.template.parse(data);
                        load(data);
                    }
                    catch (e) {
                        load(false);
                    }
                },
                function () {
                    load(false);
                }
            );
        }
    }
});