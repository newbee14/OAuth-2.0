// Load required packages
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

//Schemas
var User = require(process.cwd()+'/schemas/user');
var Code = require(process.cwd()+'/schemas/code');
var Client = require(process.cwd()+'/schemas/client');
var Token = require(process.cwd()+'/schemas/token');
var Facebook = require(process.cwd()+'/schemas/facebook');
var Google = require(process.cwd()+'/schemas/google');

//other dependencies
var config = require(process.cwd()+'/config.js').config;
var uid = require('uid2');

passport.use(new FacebookStrategy(
	{
		clientID: config.facebook.id,
		clientSecret: config.facebook.secret,
		callbackURL: config.facebook.url,
		profileFields: config.facebook.profileFields,
		passReqToCallback: true
	},
	function(req, accessToken, refreshToken, params, profile, done) {
		var user = new User({
			name:profile._json.name,
			email:profile._json.email,
			facebookId:profile._json.id,
			password:req.genPassword,
			loginType:'facebook'
		});
		var condition=[{facebookId:profile._json.id}];
		if(profile._json.email || profile._json.email !== '' || profile._json.email !== null){
			condition.push({email:profile._json.email});
		}
		User.findOneOrCreate({$or:condition}, user, function(err, user) {
			if (err) { return done(err); }
			if(user===null){return done(null,false);}
			var facebook=new Facebook({
				value:accessToken,
				name:profile._json.name,
				email:profile._json.email,
				facebookId:profile._json.id,
				userId:user.result._id,
				expires:params.expires_in
			});
			if(user.found){
				if(!user.result.facebookId || user.result.facebookId === '' || user.result.facebookId === null){
					User.findOneAndUpdate({_id:user.result._id},{$set:{facebookId:profile._json.id}},(err,updatedUser)=>{
						if(err){return done(err);}
						if(updatedUser){
							facebook.save((err)=>{
								if(err){return done(err);}
								return done(null, user);
							});
						}
					});
				}
				else{
					Facebook.findOneAndUpdate({facebookId:user.result.facebookId},{$set:{value:accessToken,expires:params.expires_in}},(err,updateFacebook)=>{
						if(err){return done(err);}
						return done(null, user);
					});
				}
			}
			else {
				facebook.save((err)=>{
					if(err){return done(err);}
					return done(null, user);
				});
			}

		});
	}
));

passport.use(new GoogleStrategy(
	{
		clientID: config.google.id,
		clientSecret: config.google.secret,
		callbackURL: config.google.url,
		profileFields: config.google.profileFields,
		passReqToCallback: true
	},
	function(req, accessToken, refreshToken, params, profile, done) {
		var user = new User({
			name:profile.displayName,
			email:profile.emails[0].value,
			googleId:profile.id,
			password:req.genPassword,
			loginType:'google'
		});
		var condition=[{googleId:profile.id}];
		if(profile.emails[0].value || profile.emails[0].value !== '' || profile.emails[0].value !== null){
			condition.push({email:profile.emails[0].value});
		}
		User.findOneOrCreate({$or:condition}, user, function(err, user) {
			if (err) { return done(err); }
			if(user===null){return done(null,false);}
			var google=new Google({
				value:accessToken,
				name:profile.displayName,
				email:profile.emails[0].value,
				googleId:profile.id,
				userId:user.result._id,
				expires:params.expires_in
			});
			if(user.found){
				if(!user.result.googleId || user.result.googleId === '' || user.result.googleId === null){
					User.findOneAndUpdate({_id:user.result._id},{$set:{googleId:profile._json.id}},(err,updatedUser)=>{
						if(err){return done(err);}
						if(updatedUser){
							google.save((err)=>{
								if(err){return done(err);}
								return done(null, user);
							});
						}
					});
				}
				else{
					Google.findOneAndUpdate({googleId:user.result.googleId},{$set:{value:accessToken,expires:params.expires_in}},(err,updateGoogle)=>{
						if(err){return done(err);}
						return done(null, user);
					});
				}
			}
			else {
				google.save((err)=>{
					if(err){return done(err);}
					return done(null, user);
				});
			}

		});
	}
));


exports.facebookLogin = passport.authenticate('facebook',{session:false, scope:config.facebook.scope});
exports.facebookLoginRedirect = passport.authenticate('facebook',{session:false, assignProperty:'user', failureRedirect: '/user/facebook/failiure' });


exports.googleLogin = passport.authenticate('google', { session:false, scope: config.google.scope });
exports.googleLoginCallback = passport.authenticate('google', { session:false, failureRedirect: '/user/google/failiure' });
