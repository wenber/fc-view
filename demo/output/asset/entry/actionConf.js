define('entry/actionConf', [
    'require',
    './index/actionConf'
], function (require) {
    var list = [require('./index/actionConf')];
    return list;
});