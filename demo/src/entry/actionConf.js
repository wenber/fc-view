/**
 * @file Entry的ER的Action配置
 * @author Leo Wang(wangkemiao@baidu.com)
 */
define(function (require) {
    /**
     * 配置列表
     * 请在此处列出所有需要注册的Action配置
     * 单位：模块
     * 如果在此处添加配置有疑惑，请直接联系wangkemiao@baidu.com
     */
    var list = [require('./index/actionConf')];
    // 子元素为数组时，调用公共方法合并
    return list;
});