var webpack = require('webpack')
var path = require('path')

function getDevelopWebpack(){
    return {
        //entry: "./client/Index.jsx",
        entry: {
            'lib':[
                path.join(__dirname,'lib/lib.js')
            ]
        },
        output: {
            filename: "[name].js",
            chunkFilename:'[name].js',
            path:  "/static/dist",
            libraryTarget:'umd',
            sourceMapFilename:'[name].map',
            //library:'libName',
            publicPath:'http://localhost:9527/'//webpack-dev-server 文件是在内存里的，使用时，在硬盘上看不到生成的文件。这个路径是静态文件的basePath
        },
        externals:{
            'zepto':{
                root:'Zepto',
                commonjs:'zepto',
                commonjs2:'zepto'
            }
        },
        module: {
            loaders: [
                {
                    test: /[\.jsx|\.js ]$/,
                    exclude: /node_modules/,
                    loaders: ["babel-loader?stage=0&optional[]=runtime"]
                },
                { test: /\.css$/, loader: "style!css" },
                {
                    test: /\.less$/,
                    loader: "style-loader!css-loader!less-loader"
                },

                { test: /\.(png|jpg|gif)$/, loader: 'url-loader' }

            ]
        },
        debug:true,
        devtool:'eval-source-map',
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            //new webpack.OldWatchingPlugin()//新版的不知道为啥不watch，用这个可以临时解决。
        ]
    }
}

module.exports = getDevelopWebpack