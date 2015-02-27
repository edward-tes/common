/**
 * Created by Envee.
 *
 * Date: 14-12-22
 * Time: 下午5:09
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */

goog.provide("bok.apps.preloader.components.ColorfulCanvasSkin");
goog.require("bok.apps.preloader.interfaces.IPreloaderSkin");
goog.require("bok.Delegate");

goog.require("org.createjs.easeljs.EaselJS");
goog.require("org.createjs.tweenjs.TweenJS");

BOK.inherits(ColorfulCanvasSkin, createjs.Container);
BOK.implement(ColorfulCanvasSkin, IPreloaderSkin);

/**
 * @override
 * @param {createjs.Bitmap} loadingBG //loading backgroud pg
 * @param {string} barColor //loading backgroud color in format 'rgba(255,255,255,0.8)'
 */
function ColorfulCanvasSkin(loadingBG, barColor, width, height)
{
    createjs.Container.call(this);
    var THIS = this;
    this.loaderHeight = 15;
    this.loaderWidth = 410;
    this.particles = [];
    this.particlesShape = [];
    this.particleLift = 180;
    this.hueStart = 0;
    this.hueEnd = 120;
    this.hue = 0;
    this.loadingBar_ = null;
    this.particleRate = 10;
    this.gravity = .4;
    this.cw = width;
    this.ch = height;
    this.loaded = 0;
    this.loader = {
        x: (this.cw/2) - (this.loaderWidth/2),
        y: (this.ch/2) - (this.loaderHeight/2)
    };
    this.skinReadyCallback = null;
    this.displayFinishCallback = null;
    this.PERCENT_PER_BAR = 1;
    this.loadingBarColor = barColor || 'rgba(255,255,255,0.8)';
    loadingBG.set({x:0, y:0 });



    this.addChild(loadingBG);

    /*========================================================*/
    /* Particles
     /*========================================================*/
    this.Particle = function(){
        this.x = THIS.loader.x + ((THIS.loaded/100)*THIS.loaderWidth) - THIS.rand(0, 1);
        this.y = THIS.ch/2 + THIS.rand(0,THIS.loaderHeight)-THIS.loaderHeight/2;
        this.vx = (THIS.rand(0,4)-2)/100;
        this.vy = (THIS.rand(0,THIS.particleLift)-THIS.particleLift*2)/100;
        this.width = THIS.rand(1,4)/2;
        this.height = THIS.rand(1,4)/2;
        this.hue = THIS.hue;
    };

    this.Particle.prototype.update = function(i){
        this.vx += (THIS.rand(0,2)-3)/100;
        this.vy += THIS.gravity;
        this.x += this.vx;
        this.y += this.vy;

        if(this.y > (THIS.ch/2 + 20)){
            THIS.particles.splice(i, 1);
        }
    };

    this.Particle.prototype.render = function(){
        var fillStyle = 'hsla('+THIS.hue+', 100%, '+THIS.rand(50,70)+'%, '+THIS.rand(20,100)/100+')';
        var particle = new createjs.Shape(new createjs.Graphics().beginFill(fillStyle).drawRect(this.x, this.y, this.width, this.height).endFill());
        THIS.particlesShape.push(particle);
        THIS.addChild(particle);
    };
    this.createParticles = function(){
        var i = this.particleRate;
        while(i--){
            this.particles.push(new this.Particle());
        };
    };

    this.updateParticles = function(){
        var i = this.particles.length;
        while(i--){
            var p = this.particles[i];
            p.update(i);
        };
    };

    this.renderParticles = function(){
        var i = this.particles.length;
        while(i--){
            var p = this.particles[i];
            p.render();
        };
    };
    /*========================================================*/
    /* Update Loader
     /*========================================================*/
    this.updateLoader = function(loadingPercentage){
        if(this.loaded < 100){
            this.loaded = loadingPercentage;
        } else {
            this.loaded = 0;
        }
    };
    this.clearPractice = function(){
        BOK.each(this.particlesShape, function(pra){
            this.removeChild(pra)
        },this);
    };
    /*========================================================*/
    /* Render Loader
     /*========================================================*/
    this.renderLoader = function(){
        var fillStyle = '#000';
        this.loaderProgress_ = new createjs.Shape(new createjs.Graphics().beginFill(fillStyle).drawRect(this.loader.x, this.loader.y, this.loaderWidth, this.loaderHeight).endFill());

        this.hue = this.hueStart + (this.loaded/100)*(this.hueEnd - this.hueStart);

        var newWidth = (this.loaded/100)*this.loaderWidth;
        fillStyle = 'hsla('+this.hue+', 100%, 40%, 1)';
        this.loaderProgress2_= new createjs.Shape(new createjs.Graphics().beginFill(fillStyle).drawRect(this.loader.x, this.loader.y, newWidth, this.loaderHeight).endFill());

        fillStyle = 'rgba(34,34,34,0.2)';
        this.loaderProgress3_ = new createjs.Shape(new createjs.Graphics().beginFill(fillStyle).drawRect(this.loader.x, this.loader.y, newWidth, this.loaderHeight /2).endFill());
        this.addChild(this.loaderProgress_,this.loaderProgress2_,this.loaderProgress3_);
    };

    /*========================================================*/
    /* Utility Functions
     /*========================================================*/
    this.rand = function(rMi, rMa){return ~~((Math.random()*(rMa-rMi+1))+rMi);};
    this.hitTest = function(x1, y1, w1, h1, x2, y2, w2, h2){return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);};
}

/** @override
 * @param {number} loadingPercentage
 * */
ColorfulCanvasSkin.prototype.update = function(loadingPercentage)
{
    if(loadingPercentage > 100)
        loadingPercentage = 100;
    var TOTAL_BARS_NUM = 100 / this.PERCENT_PER_BAR;
    this.clearPractice();
    this.createParticles();
    this.updateLoader(loadingPercentage);

    this.updateParticles();
    this.renderLoader();
    this.renderParticles();
    if(loadingPercentage == 100){

    }
};

/**
 * @override
 * */
ColorfulCanvasSkin.prototype.finish = function()
{
    this.update(100);

    createjs.Tween.get(this).wait(1000).to({alpha:0}, 500).call(Delegate.create(this, this.skinDisplayFinish));
};

/**
 * @override
 * */
ColorfulCanvasSkin.prototype.displayStart = function()
{
    this.loadingBar_ = new createjs.Shape(new createjs.Graphics().beginFill('#000').drawRect(this.loader.x, this.loader.y, this.loaderWidth, this.loaderHeight).endFill());
    this.hue = this.hueStart + (this.loaded/100)*(this.hueEnd - this.hueStart);
    var newWidth = (this.loaded/100)*this.loaderWidth;
    this.centerBar_ = new createjs.Shape(new createjs.Graphics().beginFill('hsla('+this.hue+', 100%, 40%, 1)').drawRect(this.loader.x, this.loader.y, newWidth, this.loaderHeight).endFill());
    this.newBar_ = new createjs.Shape(new createjs.Graphics().beginFill('#222').drawRect(this.loader.x, this.loader.y, newWidth, this.loaderHeight/2).endFill());

    this.addChild(this.loadingBar_, this.centerBar_, this.newBar_);

    this.skinReadyCallback();
};

/**
 * @override
 * */
ColorfulCanvasSkin.prototype.regSkinReadyCallback = function(callback)
{
    this.skinReadyCallback = callback;
};

/**
 * @override
 * */
ColorfulCanvasSkin.prototype.regSkinFinishCallback = function(callback)
{
    this.displayFinishCallback = callback;
};

/**
 * @override
 * */
ColorfulCanvasSkin.prototype.dismiss = function()
{
};

/**
 * @private
 * */
ColorfulCanvasSkin.prototype.skinDisplayFinish = function()
{
    this.removeAllChildren();
    this.bars_ = [];
    this.entities_ = [];
    this.displayFinishCallback();
};