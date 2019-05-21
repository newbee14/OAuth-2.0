var express = require('express');
var app = express();
const bodyParser= require('body-parser');
//var fs = require('fs');
var _ =require('lodash');
// Create our Express router
var router = express.Router();

const md5=require('md5');
var moment=require('moment');
var crypto=require('crypto');

/*Global Vars*/
var config=null;
var log=null;
var db=null;

router.use(bodyParser.json()); // for parsing application/json

router.post('/',(req,res)=>{
	try{
		/***********************
		*Setting cookie function
		***********************/
		function setCookie(token,expires){
			res.cookie('accessToken',token,{ maxAge:expires});
		}
		/***************************
		*Setting cookie function END
		****************************/
		/*****************************
		*Function for Sending Response
		******************************/
		function outResponse(resp,err){
			if(_.isEmpty(err)){
				res.json({success:true,data:resp});
			}
			else{
				res.json({success:false,error:err});
			}
		}
		/*********************************
		*Function for Sending Response End
		**********************************/
		/*Mongoose Schemas */
		var Login=require(process.cwd()+'/schemas/user.js');
		var Session=require(process.cwd()+'/schemas/session.js');

		/*var dbUserObj=db.dbUserObj;
		var dbSessionObj=db.dbSessionObj;*/
		if(req.get('Content-Type')=='application/json'){
			var json=req.body;
			if(json && json.username && json.password){
				var username=json.username;
				var password=md5(json.password);
				var query={};
				if(isNaN(username)){
					query={
						email:username,
						password:password
					};
				}
				else{
					query={
						mobile:username,
						password:password
					};
				}
								console.log("login",Login);
				Login.find(query).exec(function(err, res_db_user) {
					//					console.log('ha ha');
					if(err){
						outResponse('error',err);
					}
					else{
						if(res_db_user.length!=0){
							var expire=moment().diff(moment().minute(config.sessionLogoutTime));
							/*****************************
							*Function for Genrating Key
							******************************/
							var generate_key = function() {
								var sha = crypto.createHash('sha512');
								sha.update(Math.random().toString());
								return sha.digest('hex');
							};
							/*********************************
							*Function for Genrating Key End
							**********************************/
							var token = generate_key();
							Session.find({"userId":res_db_user[0]._id}).exec((err,res_db_ses)=>{
								if(res_db_ses.length>=0||res_db_ses.length<=config.deviceLimit){
									Session({"loginId":res_db_user[0]._id,"token":token,"sessionStart":moment().format(),"clientIp":req.ip}).save((err)=>{
										if (err){
											throw err;
										}
										setCookie(token,expire);
										outResponse({token:token});
									});
								}
								else{
									Session.findOneAndUpdate({"loginId":res_db_user[0]._id},{"token":token,"sessionStart":moment().format(),"clientIp":req.ip});
									outResponse({token:token});
									//										outResponse('error',{message:'you are logged in more than '+config.deviceLimit+" no of devices.Please logout from one of them to login again.",code:201});

								}
							});
						}
						else{
							outResponse('error',{message:'unauthenticated',code:101});
						}
					}
					// send HTML file populated with quotes here
				});
			}
		}
	}
	catch(err){
		console.log(err.stack);
		res.json({success:false,error:"Some error '"+err.message+"'"});
	}
});


module.exports=function(config_f,db_f,log_f){
	config=config_f;
	log=log_f;
	db=db_f;
	//	console.log(db_f);
	return router;
};
