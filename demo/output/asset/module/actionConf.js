define('module/actionConf', [
    'require',
    './materialList/actionConf'
], function (require) {
    var list = [require('./materialList/actionConf')];
    return list;
});