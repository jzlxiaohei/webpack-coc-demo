'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var glob = require('glob');
var webpack = require('webpack');
var webpackConfig = require('./webpack.production.js');
var path = require('path');
var _ = require('lodash');
var HtmlWebpackPlugin = require('html-webpack-plugin');

//es6 template string，需要node 4.0 以上版本，如果版本不到，只能手动拼了
function getTplContent(libJs, libCss) {
    var str = '\n<!DOCTYPE html>\n    <html>\n    <head lang="en">\n        <meta charset="UTF-8">\n        <title>webpack coc</title>\n        <link href="' + libCss + '" rel="stylesheet">\n    </head>\n    <body>\n        <div id="mount-dom"></div>\n        <script src="' + libJs + '"></script>\n    </body>\n</html>\n    ';
    return str;
}

var globalTplContent;

function libPathPlugin() {
    this.plugin('done', function (stats) {
        var stats = stats.toJson();
        var chunkFiles = stats.chunks[0].files
        console.log(chunkFiles)
        var libJs = '',
            libCss = '';
        for (var i in chunkFiles) {
            var fileName = chunkFiles[i];
            if (fileName.endsWith('.js')) {
                libJs = fileName;
            }
            if (fileName.endsWith('.css')) {
                libCss = fileName;
            }
        }
        globalTplContent = getTplContent(libJs, libCss);
    });
}

gulp.task('lib', ['clean'],function (callback) {
    var config = _.merge({}, webpackConfig);
    config.entry = {
        'lib': ['./assets/src/lib/lib.js']
    };
    config.externals = {};
    config.plugins = config.plugins || [];
    var plugins = config.plugins;
    //lib直接引用打包好的文件,不用Uglify.这对打包lib的速度,有重要影响
    for(var i in plugins){
        if(plugins[i] instanceof webpack.optimize.UglifyJsPlugin){
            plugins.splice(i,1)
            break;
        }
    }

    plugins.push(libPathPlugin);
    webpack(config, function (err, stats) {
        if (err) {
            throw new gutil.PluginError('webpack-lib', err);
        }
        if (typeof callback == 'function') {
            callback();
        }
    });
});

gulp.task('clean',function(){
    return gulp.src(['assets/dist/*','assets/assets-map.json'],{read:false})
        .pipe(clean())
})

gulp.task('default', ['lib'], function () {
    //gulp.task('default',function(){
    //gulp clean
    var entries = {};

    var entryFiles = glob.sync('assets/src/**/*.entry.js');

    for (var i = 0; i < entryFiles.length; i++) {
        var filePath = entryFiles[i];
        var key = filePath.substring(filePath.lastIndexOf(path.sep)+1, filePath.lastIndexOf('.'));
        entries[key] = path.join(__dirname, filePath);
    }

    var config = _.merge({}, webpackConfig);
    config.entry = entries;
    console.log(entries);

    config.plugins = config.plugins || [];

    for (var i in entries) {
        config.plugins.push(new HtmlWebpackPlugin({
            filename: (i + '.html').replace('entry.', ''),
            templateContent: globalTplContent,
            inject: true,
            chunks: [i,'commons']
        }));
    }

    webpack(config, function (err, stats) {
        if (err) {
            throw new gutil.PluginError('webpack-build', err);
        }
    });
});

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}


/** ===================== develop config  ============= **/
var getDevelopConfig = require('./assets/src/webpack.development')
var WebpackDevServer = require('webpack-dev-server')

gulp.task('dev-server',function(){
    var argv = require('yargs').argv;
    var folder = argv['f'];
    if(!folder){
        folder='**'
    }
    var entryFiles = glob.sync(__dirname+'/assets/src/'+folder+'/*.entry.js')

    if(entryFiles.length==0){
        throw new Error('can not find *.entry.js in folder:'+folder);
    }


    var port = 9527;
    var webpackDevConfig = getDevelopConfig();

    for(var i in entryFiles){
        var filePath = entryFiles[i]
        var key = filePath.substring(filePath.lastIndexOf(path.sep)+1, filePath.lastIndexOf('.'));
        webpackDevConfig.entry[key] = [
            'webpack-dev-server/client?http://0.0.0.0:'+port,
            'webpack/hot/dev-server',
            filePath];
    }


    new WebpackDevServer(webpack(webpackDevConfig),{
        publicPath:webpackDevConfig.output.publicPath,
        hot:true,
        inline: true,
        stats: {
            colors:true
        }
        //proxy: [ {
        //    path:/\/api(.*)/,
        //    target:'http://localhost:3001'
        //} ],
        //historyApiFallback: true
    }).listen(port,'localhost',function (err) {
        if(err) throw new gutil.PluginError('webpack-dev-server',err)
    })
})
