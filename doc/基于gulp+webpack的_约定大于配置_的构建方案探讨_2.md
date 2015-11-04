#基于gulp+webpack的"约定大于配置"的构建方案探讨

这不到半年的时间，玩了很多东西。有些觉得不错的新技术，直接拿到公司的项目里去挖坑。感觉进步很大，但是看看工程，啥都有。单看模块管理，从遗留的requirejs，到我过来改用的browserify，以及现在的es6 module，都有，乱糟糟的感觉。然后有天老大发现：现在发布，前端的构建时间比后端还长。计划重新做构建方案。

##示例代码
 demo在[github上](https://github.com/jzlxiaohei/webpack-coc)，自取。

##假设与前提
我非常推崇`分治`的开发方式。改了一个页面，对其他页面最好不要产生任何影响。开发环境也可以单独针对某个页面，不需要去编译打包其他页面的东西。这就要求，除了一些基本不会改变的公用js框架，js库，公用样式，以及logo图片之类的东西，其他的代码，每个页面的代码完全独立，最好从文件夹层面的分离。这样的话，比如有个页面，如果不再需要，直接把文件夹删就ok了。

`demo`的目录结构是这样的

![dir](dir.png)

两个页面，一个index，一个contact。各自需要的所有代码，资源文件，全在自己的目录。公用的东西在lib里。

所以这里假设的`构建方案`是：

1. 多个页面，每个页面相互独立，如果页面不要了，直接删了文件夹就ok。

2. 开发时，只构建自己的东西，因为如果项目有20，30个页面，我现在只开发index，打包、watch其他页面的代码，会影响我的开发效率。

3. 发布的时候，全量构建.

4. 构建的文件路径映射，给出`map.json`(我命名为assets-map.json)文件，供路径解析用。


##约定大于配置
有使用后端开发框架的同学，应该都知道这个说法。只要按照一定的约定去写代码，框架会帮你做一个自动的处理。比如以文件名以`controller`结尾的,是控制器，然后对应的路由会自动生成等。

很早之前我就在想，能不能前端也有`约定大于配置`的构建方案。我觉得各大公司肯定有相应的方案，但是我没见到。我希望一套方案，直接拿过去，npm一下，按照相应的约定去写，构建自动完成。

这里托`webpack`的福，能比较容易的做出我满意的方案。`webpack`以模块为设计出发点，所有资源都当成模块,css,js,图片,模版文件等等。

>// webpack is a module bundler.

// This means webpack takes modules with dependencies

// and emits static assets representing those modules.

所以实际上，我需要知道每个页面的入口文件，就能自动构建每个页面的所有代码和资源。（这么一说，我好像什么也不用做-_-!）。然后配合gulp，去动态微调一些配置。`gulp + webpack`的基本玩法就是 配置一个基础的webpackConfig，gulp的task里，根据需要，动态微调基本的webpackConfig。

##具体使用
首先看代码怎么写。既然`分治`了，那么先只看`index`文件夹。目录结构说明如下：

	index
		img   -- 文件夹。是人都知道这个文件夹干嘛
		js    -- 文件夹。所以
		less  -- 文件夹。就不侮辱大家的智商
		test  -- 一些测试，这里偷懒，里面啥也没有
		tools -- 开发环境工具
		index.entry.js -- 入口文件
		
规定所以入口文件都是`*.entry.js`，这就是唯一的约定(后面构建时，会找出所以这样命名规则的文件)。当然主要是webpack做了太多的工作。

看一下`index.entry.js`的代码

	import ReactDom from 'react-dom'
	import IndexComponent from './js/IndexComponent.js'

	import './less/index.less'

	ReactDom.render(
    	(
        	<div>
            	<IndexComponent/>
            	<div className='avatar'/>
        	</div>
    	),
    	document.getElementById('mount-dom')
	)

	setTimeout(function(){
    	require.ensure([],function(){
        	require('./js/async.js')
    	})
	},1000)
	
使用`es6`语法，先各种`import`引入依赖（注意`react`和`react-dom`会放到`lib`里，后面说）。包括js，less，`setTimeout`模拟按需异步加载js文件。其中`index.less`里有样式引用img里的图片

	//index.less的代码
	.avatar{
  		background:url(../img/touxiang.jpg) no-repeat;
  		height: 100px;
  		width: 100px;
  		background-size: 100%;
	}
	
执行完构建后，`assets\dist下`，你会看到
	
	//[hash]为文件的hash，这里写成占位符。
	index.entry-[hash].js
	index.entry-[hash].css	
	img/[hash].jpg 	
	
在`assets\assets-map.json`,有路径的映射。（这里用的file-loader处理图片，实际url-loader更好，不过用法上，一般就加一个limit，这里就不赘述了）
	
##单个页面实现
对webpack熟悉的同学，应该会觉得这很普通。类似下面的配置：

	entry: {'/index.entry':"./assets/src/index/index.entry.js"},
    output: {
        filename: "[name]-[chunkhash].js",
        chunkFilename:'[name].js',
        path: __dirname + "/dist",
        libraryTarget:'umd',
        publicPath:''
    },
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
        }
    }
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
            { test: /\.(png|jpg|gif)$/, loader: 'file-loader?name=img/[hash].[ext]' }
        ]
    },
    devtool:'source-map',
    plugins: [
        new ExtractTextPlugin("[name].css"),
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
                except: ['$', 'exports', 'require']
            }
        }),
        assetsPluginInstance
    ],

都是些常用的配置和插件，有几点需要的注意的地方

1. output的`filename`要有`[chunkhash]`,使用`[hash]`的话，同一次构建，不同的entry文件，会是同一个`hash`.原因看[文档](https://webpack.github.io/docs/long-term-caching.html)
2. 使用了`assets-webpack-plugin`生成文件的路径映射。
3. `externals`把公用的库排除掉。公用库会去生成`lib.js`,`lib.css`

##多个页面实现
那多个页面，怎么去实现一起构建呢。
上面的`entry`里配置项里只有一个`index.entry`,如果有两个当然就生成两个页面的代码和资源。类似这样

	{ 
	'/contact.entry': './assets/src/contact/contact.entry.js',
  	'/index.entry': './assets/src/index/index.entry.js'
  	}
  	
还记得我们的约定吗（说着有点怪。。），选出来所有的`*.entry.js`文件，稍作处理就好了。

	var entries = {}

    var entryFiles = glob.sync('assets/src/**/*.entry.js');

    for(var i = 0;i<entryFiles.length;i++){
        var filePath = entryFiles[i];
        key = filePath.substring(filePath.lastIndexOf(path.sep),filePath.lastIndexOf('.'))
        entries[key] = path.join(__dirname,filePath);
    }

    var config = _.merge({},webpackConfig)
    config.entry=entries

上面的代码就是生成一个键值对(key-value pair)，`key`形如 `/*.entry`,value是入口文件的路径。生成完了，设置给`config.entry`.

##lib的处理
lib实际上就是把上面`exteranls`里的东西，统一打个包。
看gulpfile.js 里的`lib` task,就是把`external`设成`{}`.

`lib.js`的代码

	import React from 'react'
	import jQuery from 'jquery'
	import ReactDOM from 'react-dom'

	import './reset.less'

	window.React = React
	window.jQuery = jQuery
	window.$ = jQuery
	window.ReactDOM = ReactDOM

就是把之前排除掉公共的东西，都import进来，另外加点全局的样式。

为啥不用`CommonsChunkPlugin`？因为这些东西很明显是属于lib的，不用每次都去构建不需要构建的代码。

运行 `gulp lib`后，dist下，就会生成`lib-[hash].js` 和`lib-[hash].css`


=====

======= 华丽的分隔线 ======

====

实际上，基本的构建已经完成了。对照下上面说的4点

>1.多个页面，每个页面相互独立，如果页面不要了，直接删了文件夹就ok。

index 和 contact的所有东西都是独立的。这点没问题。


>2.开发时，只构建自己的东西，因为如果项目有20，30个页面，我现在只开发index，打包、watch其他页面的代码，会影响我的开发效率。

开发环境后面说

>3.发布的时候，全量构建.
发布包括：发布lib.js，发布所有页面的静态文件。gulp的`default` task先执行`lib` task，然后自己打包所有页面的资源。

>4.构建的文件路径映射，给出`map.json`(我命名为assets-map.json)文件，供路径解析用。
已经有了，在/assets/assets-map.json里。

##关于assets-map.json
这里有个细节注意一下，`assets-webpack-plugin`这个插件，默认是把json文件覆盖掉的。对于本demo，`lib`和其他是分开，`lib`先执行,所以默认`lib`相关的路径映射会被覆盖。不覆盖有两个条件

1. 设置属性`{update:true}`
2. 同一个插件实例

代码如下：

    var AssetsPlugin = require('assets-webpack-plugin');
    
    var assetsPluginInstance = new AssetsPlugin({filename:'assets/assets-map.json',update: true,prettyPrint: true})
    
    //然后配置里，plugins加入assetsPluginInstance，这样gulp lib task 和 default task里的assetsPluginInstance是同一个对象。
    
有了这个映射文件，就可以自动生成路径了。

	//getStatic.js 可以直接执行node getStatic.js看结果。
	
	//执行gulp后，生成assets/assets-map.json后，执行下面的命令
    var fs =require('fs')
    var path = require('path')
    var fileContent = fs.readFileSync(path.join(__dirname,'assets/assets-map.json'))
    var assetsJson = JSON.parse(fileContent);
    
    function getStatic(resourcePath){
        var lastIndex = resourcePath.lastIndexOf('.')
        var name = resourcePath.substr(0,lastIndex),
            suffix = resourcePath.substr(lastIndex+1);
        if(name in assetsJson){
            return assetsJson[name][suffix]
        }else{
            return resourcePath;
        }
    }
    
    console.log(getStatic('/lib.js'))
    console.log(getStatic('/index.entry.css'))	

以express + jade 为例

	app.locals.getStatic = function(path){
		if(isProdction){
			return getStatic(path) 
		}else{
			//开发环境，return localPath..
		}
	}
	
然后模板里这样使用。

	script(src=getStatic('/lib.js'))
		

##运行demo
说了半天，到现在没有任何可以看的效果。其实最大的效果，都在`assets/dist`里。不过为了大家看效果，多写点，能够运行。运行方式：

[github](https://github.com/jzlxiaohei/webpack-coc)上clone下来，然后

	npm i
	gulp
	node index.js
	
浏览器打开
    http://localhost:3333/contact.html
    http://localhost:3333/index.html

效果很简单（简直是粗糙），但是构建的很多方面都有涉及了。


看一下`assets/dist`里的`index.html`和`contact.html`，是完全静态的页面。如果不需要首屏数据,都是通过ajax生成的话，这就是一个完全静态化的方案。只需要nginx 指向`dist`文件夹下，就发布好了。这里为了大家运行方便，就express 去做静态文件服务器，道理是一样的。

构建完全静态化的东西，难点只有一个，就是路径的问题。找`webpack`的插件吧。这里使用：`html-webpack-plugin`.它会根据模板，自动在head里插入`chunks`的css，在body底部插入`chunks`的js。刚开始的时候，我使用模板文件（路径./assets/webpack-tpl.html'）去生成。

	<!DOCTYPE html>
    <html>
    <head lang="en">
        <meta charset="UTF-8">
        <title>webpack coc</title>
        <!--lib是所有页面公用的。-->
        <!--需要自动生成一下-->
        <link href="/lib.css" rel="stylesheet">
    </head>
    <body>
        <div id="mount-dom"></div>
        <script src="/lib.js"></script>
    </body>
    </html>
生成后，`index.html` 和 `contact.html`会插入相应模块的js和css。但是lib呢，怎么把`hash`加上?我写了个简单的插件。webpack的插件，最简单的，就是一个`function`

	//帮助函数
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
    
    //插件，只在执行lib时插入。
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
    
this.plugin 的第一个参数是构建的阶段，有`after-emit`,`emit`,`done`等。第二个就是负责执行构建逻辑的函数了。关键是这个`stats`参数，里面有大量丰富的信息，建议大家把它打印处理，好好看看。这里只需要知道最终生成了文件名是什么。`stats.toJson().chunks`里有。这里只有`lib`一个模块，所以简单处理一下，就能得到`html-webpack-plugin`需要的模板内容。

另外，一个HtmlWebpackPlugin，只能生成一个html，我们有多entry,有多个HtmlWebpackPlugin。相关的配置都有说明，另外可以看文档。

	 for(var i in entries){
        config.plugins.push(new HtmlWebpackPlugin({
            filename:(i +'.html').replace('entry.',''),//index.entry => index.html
            //template:'./assets/webpack-tpl.html'
            templateContent:globalTplContent 
            inject: true,
            chunks:[i] //只注入当前的chunk，index.html注入index.entry
        }))
    }
 


##考虑前端分离
光有一个项目的方案还不行，实际上，我们现在已经有多个相对独立的前端项目.继续`分治`.

![前后端分离的方案](front-back.png)

个人觉得，前后分离，大体上有两种方案：

1. `模板 + ajax`。

	首屏有`loading`提醒的情况下，用户体验尚可。而且理论上，甚至可以做到完全静态化，既html也是静态的。这样开完完成后，nginx直接指到相关目录，就ok了。我写的demo为了简单，就是全静态化的。
	
2. `node做api中间层`
最简单的情况就是node做个api代理，然后顺便可以简单的套个首屏页面。当然加这一层会给前端几乎无限的可能性。你可以实现自己的缓存策略，对感兴趣的数据进行统计（因为api转接，所以用户请求的数据以及返回的数据，都能拿到。）等。就是工作量略有上升，另外要肩负node运维的职责。node挂了怎么办；升级怎么保证不间断服务等。

通过上图能看出来，大致的架构是这样的：

前端分成多个小项目，都依赖于`api server` => 每一个前端，都使用上面的 `gulp+ webpack`的方案，把页面分开。这与`分治思想`相契合.对于一个工程，重写一个页面，代价太高；完全从写某一个项目，一般也可以接受。

