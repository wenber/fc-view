define('tpl', [
    'require',
    'deprecated/core/lib/er',
    'fc-ajax/request'
], function (require) {
    var er = require('deprecated/core/lib/er');
    return {
        load: function (resourceId, req, load, config) {
            require('fc-ajax/request').request(req.toUrl(resourceId), { dataType: 'text' }).then(function (data) {
                try {
                    er.template.parse(data);
                    load(data);
                } catch (e) {
                    load(false);
                }
            }, function () {
                load(false);
            });
        }
    };
});