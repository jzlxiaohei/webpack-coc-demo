var webpack = require('webpack')
var path = require('path')

module.exports = {
    //entry: "./client/Index.jsx",
    entry: {
        'contact/contact.entry':[
            '../contact.entry.js'
        ],
        'lib':[
            '../../lib/lib.js'
        ]
    },
    output: {
        filename: "[name].js",
        chunkFilename:'[name].js',
        path: __dirname + "/dist",
        libraryTarget:'umd',
        sourceMapFilename:'[name].map',
        //library:'libName',
        publicPath:'/assets/dist/'//webpack-dev-server 文件是在内存里的，使用时，在硬盘上看不到生成的文件。这个路径是静态文件的basePath
    },
    externals:{

    },
    module: {
        loaders: [
            {
                test: /[\.jsx|\.js ]$/,
                exclude: /node_modules/,
                loader: "babel-loader?stage=0&optional[]=runtime"
            },
            { test: /\.css$/, loader: "style!css" },
            {
                test: /\.less$/,
                loader: "style-loader!css-loader!less-loader"
            },

            { test: /\.(png|jpg)$/, loader: 'file-loader' }

        ]
    },
    devtool:'source-map',
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.OldWatchingPlugin()//新版的不知道为啥不watch，用这个可以临时解决。
    ]
}