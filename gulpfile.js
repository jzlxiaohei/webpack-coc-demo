var gulp = require('gulp')
var gutil = require('gulp-util');
var glob = require('glob')
var webpack =  require('webpack')
var webpackConfig = require('./webpack.production.js')
var path = require('path');
var _ = require('lodash')
var HtmlWebpackPlugin = require('html-webpack-plugin')


gulp.task('lib',function(callback){
    var config = _.merge({},webpackConfig)
    config.entry = {
        'lib':['./assets/src/lib/lib.js']
    }
    config.externals={}

    webpack(config,function(err,stats){
        if(err) {
            throw new gutil.PluginError("webpack-build", err);
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
        //var key = path.relative('./assets/src',filePath)
        key = filePath.substring(filePath.lastIndexOf(path.sep),filePath.lastIndexOf('.'))
        entries[key] = path.join(__dirname,filePath);
    }

    var config = _.merge({},webpackConfig)
    config.entry=entries
    console.log(entries)

    config.plugins = config.plugins ||[]

    for(var i in entries){
        config.plugins.push(new HtmlWebpackPlugin({
            filename:(i +'.html').replace('entry.',''),
            template: './assets/webpack-tpl.html',
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