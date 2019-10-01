const express = require('express');
//引入路由器模块 
const userRouter = require('./routers/identify');
//引入body-parser中间件
const bodyParser = require('body-parser');

//引入跨域插件
var cors = require('cors');
var app = express();
app.listen(4000);
//托管静态资源到public目录下
app.use(express.static('public'));
//使用body-parser中间件
app.use(bodyParser.urlencoded({
  extended: false //不是第三方的qs模块，而是使用querystring模块
}));
app.use(bodyParser.json())
//设置跨域
app.use(cors({
//   origin: ["*"],
  methods: ['GET', 'POST','DELETE','PUT'],
  //credentials:true,
  alloweHeaders: ['Content-Type', 'Authorization']
}));

//使用路由器
app.use('/api/identify', userRouter);
