var express = require('express');
var app = express();
const bodyParser= require('body-parser');
//var fs = require('fs');
var _ =require('lodash');
const MongoClient = require('mongodb').MongoClient;
// Load required packages
var mongoose = require('mongoose'); 
const config=require("./config.js").config;
const md5=require('md5');
var moment=require('moment');
var crypto=require('crypto');


/**********************
*Logger configuration
**********************/
var winston = require('winston');
require('winston-daily-rotate-file');
var transport = new winston.transports.DailyRotateFile({
	filename: './logs/logger/log',
	datePattern: 'yyyy-MM-dd.',
	prepend: true,
	level: process.env.ENV === 'development' ? 'debug' : 'info'
});
var logger = new (winston.Logger)({
	transports: [
		transport
		//        new (winston.transports.Console)()
	]
});

/**********************
*Mongo Db connection
***********************/
mongoose.connect('mongodb://'+config.mongo.user+':'+config.mongo.password+'@'+config.mongo.url+':'+config.mongo.port+'/'+config.mongo.database,(err) => {
	if (err) return console.log(err)
	app.listen(config.app.port, () => {
		console.log('listening on '+config.app.port);
	})
	
});
/***************************/

/**********************
*Session configuration
**********************/
var session = require('express-session');
app.use(session({
	secret: '123',
	resave: true,
	saveUninitialized: true,
	httpOnly: false,
	logstash:true
}));
var sess;
/*************************
*Session configuration End
*************************/


// Oauth Router
var userRouter = require('./apis/user.js')(config,/*{dbUserObj:dbUserObj,dbSessionObj:dbSessionObj}*/mongoose,logger);

app.use('/user',userRouter);

// Oauth2 client Router
var clientRouter = require('./apis/client.js')(config,/*{dbUserObj:dbUserObj,dbSessionObj:dbSessionObj}*/mongoose,logger);

app.use('/client',clientRouter);

// Oauth2 client Router
var oauth2Router = require('./apis/oauth2.js')(config,/*{dbUserObj:dbUserObj,dbSessionObj:dbSessionObj}*/mongoose,logger);

app.use('/oauth',oauth2Router);

app.get('/',(req,res)=>{
	res.json(req.query);
});
app.post('/',(req,res)=>{
	res.json(req.body);
});
