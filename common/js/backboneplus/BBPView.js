/**
 * This class requiress backbone.js
 */
goog.provide('bok.backboneplus.BBPView');
goog.require('bok.BOK');

BOK.inherits(BBPView, Backbone.View);
function BBPView(){
    Backbone.View.call(this);

    this.template = function(){
        throw Error('BBPView: please provide template for view.')
    };
}

BBPView.prototype.render = function () {
    this.$el.html(this.template());
    return this;
};
