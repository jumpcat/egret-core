/**
 * Created by huanghaiying on 14/12/5.
 */
var console = {};
console.log = function (message) {
    egtlog(message);
}

egret_native.setSearchPaths(["",
    "src/",
    "resource/",
    "resource/assets/",
    "resource/config"
]);

egret_native.requireFiles = function () {
    require("bin-debug/lib/egret_file_list.js");
    require("bin-debug/src/game_file_list.js");
    for (var key in egret_file_list) {
        var src = "libs/" + egret_file_list[key];
        require(src);

    }
    for (var key in game_file_list) {
        var src = "bin-debug/src/" + game_file_list[key];
        require(src);
    }
};

egret_native.egretInit = function () {
    var needCompile = true;
    if (!needCompile) {
        egret_native.requireFiles();
    }
    else {
        require("launcher/game-min-native.js");
    }

    //egret.dom为空实现
    egret.dom = {};
    egret.dom.drawAsCanvas = function () {
    };

    egret.MainContext.type = egret.MainContext.TYPE_NATIVE;
    var context = egret.MainContext.instance;
    context.rendererContext = new egret.NativeRendererContext();
    context.netContext = new egret.NativeNetContext();
    context.touchContext = new egret.NativeTouchContext();
    context.deviceContext = new egret.NativeDeviceContext();

    egret.StageDelegate.getInstance().setDesignSize(480, 800);
    context.stage = new egret.Stage();
    context.stage.scaleMode = egret.StageScaleMode.SHOW_ALL;

    egret.RendererContext.CONTENT_SCALE_FACTOR = 1;

    context.run();
};

egret_native.loadVersion = function (completeCall) {
    var ctr = egret.MainContext.instance.netContext._versionCtr;
    ctr.addEventListener(egret.IOErrorEvent.IO_ERROR, loadError, this);
    ctr.addEventListener(egret.Event.COMPLETE, loadComplete, this);
    ctr.fetchVersion();

    function loadError(e) {
        ctr.removeEventListener(egret.IOErrorEvent.IO_ERROR, loadError, this);
        ctr.removeEventListener(egret.Event.COMPLETE, loadComplete, this);
    }

    function loadComplete(e) {
        ctr.removeEventListener(egret.IOErrorEvent.IO_ERROR, loadError, this);
        ctr.removeEventListener(egret.Event.COMPLETE, loadComplete, this);

        completeCall();
    }
};

egret_native.egretStart = function () {
    var document_class = "Main";
    var rootClass;
    if (document_class) {
        rootClass = egret.getDefinitionByName(document_class);
    }
    var context = egret.MainContext.instance;
    if (rootClass) {
        var rootContainer = new rootClass();
        if (rootContainer instanceof egret.DisplayObjectContainer) {
            context.stage.addChild(rootContainer);
        }
        else {
            throw new Error("文档类必须是egret.DisplayObjectContainer的子类!");
        }
    }
    else {
        throw new Error("找不到文档类！");
    }
};

egret_native.pauseApp = function () {
    console.log("pauseApp");
    egret_native.Audio.pauseBackgroundMusic();
    egret_native.Audio.pauseAllEffects();
};

egret_native.resumeApp = function () {
    console.log("resumeApp");
    egret_native.Audio.resumeBackgroundMusic();
    egret_native.Audio.resumeAllEffects();
};