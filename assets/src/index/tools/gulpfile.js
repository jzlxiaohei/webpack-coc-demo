var gulp = require('gulp')
var gutil = require('gulp-util')
var webpack =  require('webpack')
var webpackConfig = require('./webpack.development.js')


const WebpackDevServer = require('webpack-dev-server')
gulp.task('dev-server',function () {
    var config = Object.create(webpackConfig)

    var port = 8080
    config.debug = true
    for(var i in config.entry) {
        var eItem = config.entry[i]
        eItem.unshift('webpack/hot/dev-server')
        eItem.unshift('webpack-dev-server/client?http://0.0.0.0:'+port)
    }
    config.plugins = config.plugins ||[]

    new WebpackDevServer(webpack(config),{
        contentBase:'../../../',
        publicPath:config.output.publicPath,
        hot:true,
        inline: true,
        stats: {
            colors:true
        },
        proxy: [ {
            path:/\/api(.*)/,
            target:'http://localhost:3001'
        } ],
        lazy: false
        //historyApiFallback: true
    }).listen(port,'localhost',function (err) {
            if(err) throw new gutil.PluginError('webpack-dev-server',err)
        })
})
