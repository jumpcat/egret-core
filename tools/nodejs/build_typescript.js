/**
 * 将TypeScript编译为JavaScript
 * 会忽略TS2000+的错误，只会抛出TS1000+的错误
 * @example
 *   node build_typescript.js [source_path]
 *
 * @param source_path:编译路径，默认为引擎代码
 */

var sourcePath = process.argv[2];
if (!sourcePath) {
    sourcePath = "../../src";
}
var outPath = process.argv[3];
if (!outPath) {
    outPath = sourcePath;
}
var path = require("path");
sourcePath = path.join(__dirname, sourcePath);
outPath = path.join(__dirname, outPath);


var allFileList = generateAllTypeScriptFileList(sourcePath);

var cp_exec = require('child_process').exec;
var async = require('async');
var crc32 = require("crc32");
var fs = require("fs");
var CRC32BuildTS = "buildTS.local";
var crc32Data;
if (!fs.existsSync(CRC32BuildTS)) {
    crc32Data = {};
}
else {
    var txt = fs.readFileSync(CRC32BuildTS, "utf8");
    crc32Data = JSON.parse(txt);
}


var checkTypeScriptCompiler = "tsc";
var tsc = cp_exec(checkTypeScriptCompiler);
tsc.on('exit', function (code) {
    if (code == 0) {
        buildAllTypeScript(allFileList);
    }
    else {
        throw new Error("TypeScript编译器尚未安装，请执行 npm install -g typescript 进行安装");
    }
});

console.log(path)
/**
 * 编译单个TypeScript文件
 * @param file
 * @param callback
 */
function build(file, callback) {
    var source = path.join(sourcePath, file);
    var dirname = path.dirname(file);
    var out = path.join(outPath, dirname);
//    var target = path.join(outPath,file).replace(".ts",".js");
    var cmd = "tsc " + source + " -t ES5" //这个特性暂时关闭 //--outDir " +  out;

    var ts = cp_exec(cmd);
    ts.stderr.on("data", function (data) {
        if (data.indexOf("error TS1") >= 0) {
            console.log(data);
        }
    })

    ts.on('exit', function (code) {
        console.log("[success]" + file);
        callback(null, file);
    });
}

/**
 * 编译全部TypeScript文件
 * @param allFileList
 */
function buildAllTypeScript(allFileList) {
    async.forEachLimit(allFileList, 2, function (file, callback) {
        //console.log(path);
        var content = fs.readFileSync(path.join(sourcePath,file), "utf8");
        var data = crc32(content);
        if (crc32Data[path] == data) {
            //不需要重新编译
            callback(null, file);
        }
        else {
            crc32Data[file] = data;
            //需要重新编译一下
            build(file, callback);
        }
    }, function (err) {
        if (err == undefined) {
            console.log("AllComplete");
        }
        else {
            console.log("出错了" + err);
        }
        //保存一下crc32文件
        txt = JSON.stringify(crc32Data);
        if (fs.existsSync(CRC32BuildTS)) {
            fs.unlinkSync(CRC32BuildTS);
        }
        fs.writeFileSync(CRC32BuildTS, txt);
    });

}


/**
 * 生成sourcePath下的所有TypeScript文件列表
 * @param sourcePath
 * @returns {Array}
 */

function generateAllTypeScriptFileList(sourcePath) {
    var libs = require("./egret_nodejs_libs");
    return libs.loopFileSync(sourcePath, filter);

    function filter(path) {
        return  path.indexOf(".ts") == path.length - 3 && path.indexOf(".d.ts") == -1
    }
}
