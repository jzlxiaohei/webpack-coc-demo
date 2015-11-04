var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack')
var path = require('path')
var AssetsPlugin         = require('assets-webpack-plugin');
var assetsPluginInstance = new AssetsPlugin({filename:'assets/assets-map.json',update: true,prettyPrint: true})

var autoprefixer = require('autoprefixer');
var precss      = require('precss');

var node_modules = path.join(__dirname,'./node_modules');
module.exports = {
    //entry: {'index.entry':"./assets/src/index/index.entry.js"},
    entry: {
    },
    output: {
        filename: "[name]-[chunkhash].js",
        chunkFilename:'[name]-[chunkhash].js',
        path: path.join(__dirname + "/assets/dist"),
        libraryTarget:'umd',
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

    resolve:{
        alias:{
            react:path.join(node_modules,'./react/dist/react.min.js'),
            jquery:path.join(node_modules,'./jquery/dist/jquery.min.js'),
            'react-dom':path.join(node_modules,'./react-dom/dist/react-dom.min.js'),
        }
    },
    module: {
        noParse:[
            path.join(node_modules,'./react/dist/react.min.js'),
            path.join(node_modules,'./jquery/dist/jquery.min.js'),
            path.join(node_modules,'./react-dom/dist/react-dom.min.js')
        ],
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
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader!less-loader')
            },
            { test: /\.(png|jpg|gif)$/, loader: 'file-loader?name=/img/[hash].[ext]' }
        ]
    },
    devtool:'sourcemap',
    plugins: [
        new ExtractTextPlugin("css/[name]-[chunkhash].css"),
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
                except: ['$', 'exports', 'require']
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name:'commons',
            filename:'commons.js',
            minChunks:function(module,count){
                //引用测试大于某个次数
                if(count>=3){
                    return true;
                }

                //符合某种格式
                var resourceName = module.resource
                if(resourceName){
                    resourceName = resourceName.substring(resourceName.lastIndexOf(path.sep)+1)
                }
                var reg = /^(\w)+.common/
                if(reg.test(resourceName)){
                    return true;
                }

                return false;
            }
        }),
        assetsPluginInstance
    ],
    postcss: function () {
        return [autoprefixer, precss];
    }
}