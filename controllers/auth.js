// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

//Schemas
var User = require(process.cwd()+'/schemas/user');
var Code = require(process.cwd()+'/schemas/code');
var Client = require(process.cwd()+'/schemas/client');
var Token = require(process.cwd()+'/schemas/token');
var Facebook = require(process.cwd()+'/schemas/facebook');

//other dependencies
var config = require(process.cwd()+'/config.js').config;
var uid = require('uid2');

passport.use(new BasicStrategy(
	function(username, password, callback) {
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
		User.findOne(query, function (err, user) {
			if (err) { return callback(err); }
			// No user found with that username
			if (!user) { return callback(null, false); }

			// Make sure the password is correct
			user.verifyPassword(password, function(err, isMatch) {
				if (err) { return callback(err); }

				// Password did not match
				if (!isMatch) { return callback(null, false); }

				// Success
				return callback(null, user);
			});
		});
	}
));

passport.use('client-basic', new BasicStrategy(
	function(username, password, callback) {
		Client.findOne({ _id: username }, function (err, client) {
			if (err) { return callback(err); }

			// No client found with that id or bad password
			if (!client/* || client.secret !== password*/) { return callback(null, false); }

			client.verifySecret(password, function(err, isMatch) {
				if (err) { return callback(err); }

				// Password did not match
				if (!isMatch) { return callback(null, false); }

				// Success
				return callback(null, client);
			});
		});
	}
));

passport.use(new BearerStrategy(
	function(accessToken, callback) {
		Token.findOne({value: accessToken }, function (err, token) {
			if (err) { return callback(err); }

			// No token found
			if (!token || !token.active) { return callback(null, false); }

			User.findOne({ _id: token.userId }, function (err, user) {
				if (err) { return callback(err); }

				// No user found
				if (!user) { return callback(null, false); }

				// Simple example with no scope
				callback(null, user, { scope: '*' });
			});
		});
	}
));



exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], { session : false });

exports.isBasicAuthenticated = passport.authenticate('basic', { session : false });

exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });

exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });

