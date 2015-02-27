

/**
 * Created by Administrator on 14-7-30.
 */

goog.provide("net.DecoratedSocketController");
goog.require('bok.EventDispatcher');

BOK.inherits(DecoratedSocketController, EventDispatcher);
/**
 * @constructor
 * @param {DecoratedSocketController} controller
 * */
function DecoratedSocketController(controller) {
    EventDispatcher.call(this);

    this.socket_ = null;

    this.decoratedController = controller;
}

DecoratedSocketController.prototype.init = function(host, opt) {
    //start socket io connect
    try {
        this.socket_ = io.connect(host, {port:opt.port});
    } catch (e) {
        BOK.warn("net.chatSocketController.init: socket.io not found");
        return;
    }
    console.log('decorate socket init');
    this.bindSocketListener(this.socket_);
};


/**
 * @param {socket.io} socket
 * */
DecoratedSocketController.prototype.bindSocketListener = function(socket) {
    console.log('decorate socket bind socket listener');
	this.socket_ = socket;

    //hook socket up with all "onXXXX" functions
    BOK.each(this.constructor.prototype, function(item, key){
        if(/^on[A-Z]/.test(key)) {
            this.socket_.on(key.substr(2).toLowerCase(), Delegate.create(this, item));
        }
    }, this);
    this.decoratedController && this.decoratedController.bindSocketListener(this.socket_);

};