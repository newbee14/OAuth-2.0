// Load required packages
var User = require(process.cwd()+'/schemas/user');
var ResetToken = require(process.cwd()+'/schemas/resetToken');
var _ =require('lodash');
var uid = require('uid2');
var bcrypt = require('bcrypt-nodejs');
var config=require(process.cwd()+'/config.js').config;

// Create endpoint /api/users for POST
exports.postUsers = function(req, res) {
	try{
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
		if(req.get('Content-Type')=='application/json'){
			var json=req.body;
			if(json && (json.email || json.mobile) && json.password && json.name){
				var email=json.email||'';
				var password=json.password;
				var mobile=json.mobile||'';
				var name=json.name;
				var loginType='direct';
				if(mobile!=='' && isNaN(mobile)){
					throw new Error('mobile no cant contain alphabets');
				}
				var user = new User({
					email: email,
					password: password,
					mobile:mobile,
					name:name,
					loginType:loginType
				});
				var orCondition=[];
				if(mobile!=''){
					orCondition.push({mobile:user.mobile});
				}
				if(email!=''){
					orCondition.push({email:user.email});
				}
				User.findOne({$or:orCondition},(err,userObj)=>{
					if(err){return res.json({success:false,error:{message:err}});}
					if(userObj !== null){
						if(userObj.email && userObj.mobile){
							return res.json({success:false,error:{message:"User already exists"}});
						}
						if(!userObj.email && email){
							User.findOneAndUpdate({_id:userObj._id},{$set:{email:email}},(err,updatedUser)=>{
								if(err){return res.json({success:false,error:{message:err}});}
								if(updatedUser){
									outResponse('User Exists Error',{ message: 'User already exists, Record updated with email id.'});
									return;
								}
							});
						}
						if(!userObj.mobile && mobile){
							User.findOneAndUpdate({_id:userObj._id},{$set:{mobile:mobile}},(err,updatedUser)=>{
								if(err){return res.json({success:false,error:{message:err}});}
								if(updatedUser){
									outResponse('User Exists Error',{ message: 'User already exists, Record updated with mobile no.'});
									return;
								}
							});
						}
					}
					user.save(function(err) {
						if (err){
							return res.json({success:false,error:{message:err}});
						}
						outResponse({ message: 'New user successfully added' });
						return;
					});
				});
			}
			else{
				throw new Error("some of the required feilds are missing");
			}
		}
		else{
			throw new Error('content type not json');
		}
	}
	catch(err){
		console.log(err.stack);
		return res.json({success:false,error:"Some error '"+err.message+"'"});
	}

};

// Create endpoint /users/authenticate for GET
exports.authenticate= function(req, res) {
	return outResponse(req.user);
	function outResponse(user){
		return res.json({
			name:user.name,
			email:user.email,
			authenticated:true,
			mobile:user.mobile,
			id:user._id,
			loginType:user.loginType
		});
	}
};

//issue token to forgot password
exports.forgotPassword=(req,res)=>{
	const username=req.body.username;
	var query=null;
	if(isNaN(username)){
		query={
			email:username
		};
	}
	else{
		query={
			mobile:username
		};
	}
	User.findOne(query,(err,user)=>{
		if(err){return res.json({success:false,error:{message:err}});}
		if(user){
			const resetToken=new ResetToken({
				value:uid(config.resetToken.size),
				userId:user.id
			});
			resetToken.save((errUpdate,token)=>{
				if(errUpdate){return res.json({success:false,error:{message:errUpdate}});}
				if(token){
					return res.json({success:true,resetToken:resetToken});
				}
			});
		}
		else{
			return res.json({success:false,error:{message:"User not found"}});
		}
	});
};

//reset password
exports.resetPassword=(req,res)=>{
	var token=req.body.token,
		password=req.body.password;
	bcrypt.genSalt(15, function(err, salt) {
		if (err){ return res.json({success:false,error:{message:err}});}

		bcrypt.hash(password, salt, null, function(err, hash) {
			if (err){ return res.json({success:false,error:{message:err}});}
			password = hash;

			ResetToken.findOne({value:token},(err,tokenObj)=>{
				if(err){return res.json({success:false,error:{message:err}});}
				if(tokenObj===null){return res.json({success:false,error:{message:"Token invalid"}});}
				if(tokenObj.active){
					User.findOne({_id:tokenObj.userId},(err,user)=>{
						if(err){return res.json({success:false,error:{message:err}});}
						if(user===null){return res.json({success:false,error:{message:"User Not found"}});}
						tokenObj.remove((err)=>{
							if(err){return res.json({success:false,error:{message:err}});}
							User.update({_id:user._id},{$set:{password:password}},(err,updatedUser)=>{
								if(err){return res.json({success:false,error:{message:err}});}
								if(updatedUser===null){return res.json({success:false,error:{message:"Some Internal Error. Try Again"}});}
								return res.json({success:true});
							});
						});
					});
				}
				else{
					if(err){return res.json({success:false,error:{message:"Reset Token expired please apply again."}});}
				}

			});
		});
	});
};

//delete user
exports.delete=(req,res)=>{
	User.findOneAndRemove({_id:req.user.id},(err)=>{
		if(err){return res.json({success:false,error:{message:err}});}
		return res.json({success:true});

	});
};

//generate password
exports.genPassword=(req,res,next)=>{
	var password=uid(config.genPassword.size);
	req.genPassword=password;
	return next();
};

//facebook success
exports.facebookSuccess=(req,res)=>{
	var user=req.user.result;
	if(req.user.found){
		res.json({authenicated:true,user:{name:user.name,email:user.email,facebookId:user.facebookId,id:user._id}});
	}
	else{
		var password=req.genPassword;
		res.json({success:true,user:{name:user.name,email:user.email,facebookId:user.facebookId,genPassword:password,id:user._id}});
	}
};

//facebook failiure
exports.facebookFailiure=(req,res)=>{
	res.json({success:false});
};

//google success
exports.googleSuccess=(req,res)=>{
	var user=req.user.result;
	if(req.user.found){
		res.json({authenicated:true,user:{name:user.name,email:user.email,googleId:user.googleId,id:user._id}});
	}
	else{
		var password=req.genPassword;
		res.json({success:true,user:{name:user.name,email:user.email,googleId:user.googleId,genPassword:password,id:user._id}});
	}
};

//google failiure
exports.googleFailiure=(req,res)=>{
	res.json({success:false});
};

