#使用情况

公司正好有新项目,我就把上面那套思想拿去用了.果然用在实际项目,才能注意到更多细节.

一. 首先,路径,路径,路径很麻烦,也很重要.前端构建和其他工种构建的最大区别,个人认为就是路径的改变。开发路径 => 打包路径 => cdn路径。

上篇,直接打包到`assets/dist`,然后cdn指到这里就ok的.实际上,公司的cdn,会按项目,先做一级目录.


   	assets/dist/
        	project1 //..project1里各个页面的静态文件
        	project2 //..project2里的各个页面的静态文件.
        	webpack-coc //本demo的静态文件应该都放到这里.


   所以要加一个`project_name`的变量,让他们打包到 `assets/dist/project_name`里.
   
   当然，改动不多。`output`里的`path`和`publicPath`设置一下就好
   
   	var project_name='webpack_coc';
   	//...
   
   	output={
		//...
		path:path.join(__dirname ,'./assets/dist/'+project_name),
		publicPath:'/'+project_name  
   	}
   
   说明一下，`publicPath`会在影响图片（包括字体）在css中的路径。解析图片的loader（`file-loader`）有个name参数，`name=/img/[name]-[hash].[ext]`这样，图片会生成在路径`assets/dist/webpack_coc/img`里，但是css里，要引用到img，在css中的路径需要是`/webpack_coc/img/图片名称.png`(之前提到过cdn根目录是`assets/dist`)，如果不配置`publicPath`,则图片在css中路径是`/img/图片名称.png`
   
  这个地方调了我好长时间（!_!）

   所以`路径问题`（省略1万字）,不过目前看,webpack的配置项,还是考虑的很周到,遇到的问题,后面都能解决,需要点耐心和查文档的能力.

二. `webpack`强大灵活,导致想写一个真正通用的很难.

自己看webpack的东西,写多了,感觉要配置的地方不多,而且本质上就是构造一个配置对象,实在不行,我改变对象就就是.所以尝试封装一下.

    不过中间项目改变了两次目录结构,加上一次同事要用`angular 1`写后台（之前都是拿这套来写react的）,都是要改动不少地方的。关键还是定一套`约定`(终于点题了)，包括文件名，文件的相对路径，公共的库等。这项工作目前还在推进中,不过这个是和公司业务和历史代码相关联的，大家还要根据自己的时间情况，去做个方案。


不过整体上,现在的开发和发布方式,同事们还都是比较认可的,觉得比之前高（zhuang）级（bi)多了.

#补充
上篇结尾说，这篇其实是补充说明几个上次漏掉的比较重要的问题。

## 加快lib的打包速度


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
        	//..
        }
        
这两项是干嘛的，大家可以参考 [这篇文章](http://www.ituring.com.cn/article/200534)通俗易懂，另外打包`lib`的时候，把`UglifyJsPlugin`去掉，这个非常耗时，我打包`react`和`jquery`，`react-dom`这三个成为`lib`的时候，做不做uglifyJs，打包速度几乎差2个数量级。代码上，就是重plugins里删掉它就ok了。

    //lib直接引用打包好的文件,不用Uglify.这对打包lib的速度,有重要影响
    for(var i in plugins){
        if(plugins[i] instanceof webpack.optimize.UglifyJsPlugin){
            plugins.splice(i,1)
            break;
        }
    }
    
（其实lib，你也可以直接把几个文件的dist版简单合拼一下就ok了，个人觉得这样可能更好。不过这里为了演示`webpack`，就这样了）

## 公共（commons）部分的处理。

看过`webpack`相关资料的同学，应该对`CommonsChunkPlugin`这个参加印象深刻。帮大家默认'解决'了一个前端构建的纠结点：到底什么时候拆，什么时候和。

1. 拆掉的太细，每个稍微公用点的模块，别管多大，都单独加载，这样你的页面将有很多个`<script>`标签，这当然影响加载速度（在http 1.x的协议下，一般来说加载很多小文件，不如加载一个大一点的文件优。）
2. 不拆的话，有公共的东西，其实只是一些页面要用到，其他页面加载这些代码，完全是浪费。

只要你的项目涉及多个页面，不管用什么打包工具，还是通过`requirejs`这样的AMD loader异步加载，上面这两个都很让人纠结。纠结的根本原因，是没有最好的方案。人都确定不了怎么拆怎么和最好，`webpack`也没那么智能。`CommonsChunkPlugin`默认行为是：如果一个模块被其他各个文件引用超过（含等于）3次，就认为是公共部分。这个次数是能自定义的。

当然这个提取，你可能不满意，但是关键也很难拿出通用的方案。我这里稍微加了点功能，我可以控制哪些模块，一定会被加入`commons`中,或者一定不加入，这就给开发者一定的自定义空间。

`CommonsChunkPlugin`有个参数`minChunks`,这个参数可以是一个数字（number）默认是3，意思是引用大于等于这样个数字的时候，就认为是`公共`部分；或者是`Infinity`,这就是所有模块都是公共部分，也就说，或有一个公共模块，但是这个模块是空壳，里面什么模块都没有；最后它可以是一个`函数`，好了，你懂的，在函数里实现我们的逻辑，`return true`表示这个模块是公共的，`false`则不是.

我加了一条，如果模块形如`*.common.**`，那么它是公共部分。
	
		new webpack.optimize.CommonsChunkPlugin({
            name:'commons',
            filename:'commons-[chunkhash].js',
            minChunks:function(module,count){
                //引用测试大于某个次数,保持默认行为，如果你的模块特别多，适当提高
                if(count>=3){
                    return true;
                }

                //符合某种格式，return ture
                var resourceName = module.resource
                if(resourceName){
                    resourceName = resourceName.substring(resourceName.lastIndexOf(path.sep)+1)
                }
                var reg = /^(\w)+.common/
                if(reg.test(resourceName)){
                    return true;
                }
				
				//符合某种格式，return false;
				
                return false;
            }
        }),
        
为了看效果，我命名了`haha.common.js`,另外有个`much_use.js`一共被引用了3次。打包后，在`assets/dist/commons-[hash].js`里，你能找到两个js的代码。

注意，打包lib时，不需要提取commonns，打包lib的时候，把这个插件去掉。

所以终于输出要页面的时候，每个页面有`3个css`和`3个js`: `lib.js`,`commons.js`和页面相关的js，（css相同），对于一个页面来说，这个静态文件的数量，也差不多合适。
	

##开发

开发时，和发布时的核心差别是，有些优化的操作不需要做，调试的功能要加上。具体的配置，在`assets/src/webpack.development.js`里。

具体到配置上，发布时的几个插件：

1.  `webpack.optimize.UglifyJsPlugin`首先干掉，想都不要想。
2. `webpack.optimize.CommonsChunkPlugin`个人感觉，影响不大。
3. `assetsPluginInstance` 生成资源文件的map文件，看怎么和后端配合，模块不是特别多的时候，基本感觉不到对性能的影响。
4. `ExtractTextPlugin`抽取`css`。如果没有这个插件，样式是通过js脚本，在页面插入`<style>`标签实现的，所以发布的时候，一定要用，不让或闪屏。开发的时候，使用这个，会是css文件的改动，失去`hot-reload`功能，所以建议干掉。

需要添加的：`new webpack.HotModuleReplacementPlugin()`，另外一个重要的地方，是publicPath。使用`webpack-dev-server`开发时，生成的模块是不写硬盘的，只保存在内存里，这样编译速度会快很多。但是不写进目录里，怎么能访问到。就用`publicPath`指定的路径去访问。这里建议大家用全路径，比如，你启动webpack-dev-server的端口为9527,那么

	publicPath:'http://localhost:9527/anyPathYouWantOrEmpty'
	
为啥要写全路径，请参加[文档](https://webpack.github.io/docs/webpack-dev-server.html#combining-with-an-existing-server)里的`Combining with an existing server`一栏，里面有对`full url`进行说明。

小试一下，在demo 根目录 执行`gulp dev-server`,然后以任意方式用浏览器打开（不管是起server还是双击文件直接打开）`/assets/src/index/tools/index.demo.html`,看下页面的样子，让后去`/assets/src/index/index.less`里改一下body的背景颜色，你会看到，背景改变了，页面没刷新。（改js的话，一般情况下，页面或自动reload）

#前后端配合问题
目前来说，很多公司的开发，还没法完全做到前后端完全分离。那么就存在一个前后配合开发过程。我们的基本处理是

###如果开发环境：
后端通过一个函数，去解析资源的map文件(`assets-map.json`)，前端用的话，
	
	script(src=getStatic('/index.entry.js'))
	
`getStatic`负责根据资源文件的map，生成`index.entry.js`的hash版。

开发的时候，因为要引人页面的js和lib.js就行，这样处理就ok了。lib看是写在模板里，还是自动生成，这个看情况。


###发布环境

1. 后端处理生成`js`文件的hash版路径后，还要去找有没有相应的css文件，有的话，插入css。
2. 自动添加 `commons.js`和`commons.css`
3. lib同上

这样3个js和3个css文件就都有了，齐活