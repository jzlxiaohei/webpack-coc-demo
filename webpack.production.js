var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack')
var path = require('path')
var AssetsPlugin         = require('assets-webpack-plugin');
var assetsPluginInstance = new AssetsPlugin({filename:'assets/assets-map.json',update: true,prettyPrint: true})

var autoprefixer = require('autoprefixer');
var precss      = require('precss');


module.exports = {
    //entry: {'index.entry':"./assets/src/index/index.entry.js"},
    entry: {

    },
    output: {
        filename: "[name]-[chunkhash].js",
        chunkFilename:'[name]-[chunkhash].js',
        path: path.join(__dirname + "/assets/dist"),
        libraryTarget:'umd',
        sourceMapFilename:'[name].map',
        publicPath:''//webpack-dev-server build的文件是在内存里的，使用时，在硬盘上看不到生成的文件。这个路径是静态文件的basePath
    },
    //devtool: 'eval',
    externals:{
        'react': {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react'
        },
        'jquery': {
            root: 'jQuery',
            commonjs2: 'jquery',
            commonjs: 'jquery',
            amd: 'jquery'
        },
        'react-dom':{
            root:'ReactDOM',
            commonjs2: 'react-dom',
            commonjs: 'react-dom',
            amd:'react-dom'
        }
        //'wscn-common':{
        //    commonjs2:'wscn-common',
        //    commonjs:'wscn-common'
        //}
    },
    module: {
        loaders: [
            {
                test: /[\.jsx|\.js ]$/,
                exclude: /node_modules/,
                loader: "babel-loader?stage=0&optional[]=runtime"
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader!less-loader')
            },
            { test: /\.(png|jpg|gif)$/, loader: 'file-loader?name=/img/[hash].[ext]' }
        ]
    },
    devtool:'source-map',
    plugins: [
        new ExtractTextPlugin("[name]-[chunkhash].css"),
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
                except: ['$', 'exports', 'require']
            }
        }),
        assetsPluginInstance
    ],
    postcss: function () {
        return [autoprefixer, precss];
    }
}