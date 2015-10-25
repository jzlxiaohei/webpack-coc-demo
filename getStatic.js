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