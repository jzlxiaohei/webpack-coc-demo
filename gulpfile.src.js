var gulp = require('gulp')
var gutil = require('gulp-util');
var glob = require('glob')
var webpack =  require('webpack')
var webpackConfig = require('./webpack.production.js')
var path = require('path');
var _ = require('lodash')
var HtmlWebpackPlugin = require('html-webpack-plugin')


var globalTplContent ;
//es6 template string，需要node 4.0 以上版本，如果版本不到，只能手动拼了

    function getTplContent(libJs,libCss) {
        var str = `
    <!DOCTYPE html>
        <html>
        <head lang="en">
            <meta charset="UTF-8">
            <title>webpack coc</title>
            <link href="${libCss}" rel="stylesheet">
        </head>
        <body>
            <div id="mount-dom"></div>
            <script src="${libJs}"></script>
        </body>
    </html>
        `;
        return str
    }


    function libPathPlugin(){
        this.plugin("done", function(stats) {
            var stats = stats.toJson()
            var chunkFiles = stats.chunks[0].files
            var libJs ='',libCss='';
            for(var i in chunkFiles){
                var fileName = chunkFiles[i]
                if(fileName.endsWith('.js')){
                    libJs = fileName
                }
                if(fileName.endsWith('.css')){
                    libCss = fileName
                }
            }
            globalTplContent = getTplContent(libJs,libCss)
        });
    }

gulp.task('lib',function(callback){
    var config = _.merge({},webpackConfig)
    config.entry = {
        '/lib':['./assets/src/lib/lib.js']
    }
    config.externals={}
    config.plugins = config.plugins || [];
    config.plugins.push(libPathPlugin);
    webpack(config,function(err,stats){
        if(err) {
            throw new gutil.PluginError("webpack-lib", err);
        }
        if(typeof callback=='function'){
            callback();
        }
    })
})

gulp.task('default',['lib'],function(){
//gulp.task('default',function(){

    var entries = {}

    var entryFiles = glob.sync('assets/src/**/*.entry.js');

    for(var i = 0;i<entryFiles.length;i++){
        var filePath = entryFiles[i];
        var key = filePath.substring(filePath.lastIndexOf(path.sep),filePath.lastIndexOf('.'))
        entries[key] = path.join(__dirname,filePath);
    }

    var config = _.merge({},webpackConfig)
    config.entry=entries
    console.log(entries)

    config.plugins = config.plugins ||[]

    for(var i in entries){
        config.plugins.push(new HtmlWebpackPlugin({
            filename:(i +'.html').replace('entry.',''),
            templateContent:globalTplContent,
            inject: true,
            chunks:[i]
        }))
    }

    webpack(config,function(err,stats){
        if(err) {
            throw new gutil.PluginError("webpack-build", err);
        }
    })
})


if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}