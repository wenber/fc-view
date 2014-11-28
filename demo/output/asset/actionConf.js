define('actionConf', [
    'require',
    'entry/actionConf',
    'module/actionConf'
], function (require) {
    var list = [
            require('entry/actionConf'),
            require('module/actionConf')
        ];
    return list;
});