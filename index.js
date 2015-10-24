var express = require('express')
var app = express()

app.use(express.static(__dirname + '/assets/dist'))

app.listen(3333,function(){
    console.log('server start:'+3333)
})


