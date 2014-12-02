/**
 * @file
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

define(function (require) {
    
    var _ = require('underscore');
    var fc = require('fc-core');

    var proto = {};

    proto.constructor = function () {
        this.$super(arguments);
    };

    proto.initBehavior = function () {
        // this.model.on('change', _.bind(this.reloadWithUpdatedModel, this));
        // 删掉tempViewContext
        if (this.tempViewContext) {
            this.tempViewContext.dispose();
            this.tempViewContext = null;
        }
        this.customBehavior();
    };

    proto.enter = function (context) {
        var entering = this.$super(arguments);
        // 先尝试渲染loading tpl
        // model一定有了，但是view不一定有
        if (!context.isChildAction
            && this.viewType && this.viewType.prototype) {
            try {
                var tplName = this.viewType.prototype.template + '-loading';
                var container = document.getElementById(context.container);
                container.innerHTML = fc.tpl.render(
                    tplName, this.model.loadingData
                );
                // 有ui的话还要初始化……
                var ViewContext = require('fcui/ViewContext');
                this.tempViewContext = new ViewContext(
                    container.id + 'tempViewContext'
                );

                var properties = this.viewType.prototype.getUIProperties
                    ? this.viewType.prototype.getUIProperties()
                    : this.viewType.prototype.uiProperties;
                require('fcui').init(container, {
                    viewContext: this.tempViewContext,
                    properties: properties,
                    valueReplacer: _.bind(
                        require('ef/UIView').prototype.replaceValue,
                        this.model
                    )
                });
            }
            catch (e) {
                fc.util.processError(e);
            }
        }

        return entering;
    };

    proto.customBehavior = function () { };

    var EntryAction = fc.oo.derive(require('./BaseAction'), proto);

    return EntryAction;
});