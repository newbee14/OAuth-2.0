//var md5=require("md5");
var config={
	app:{
		port:9900	
	},
	mongo:{
		user:"ashish",
		password:"abc123",
		url:"localhost",
		port:27017,
		database:"authentication"
	},
	deviceLimit:15,
	sessionLogoutTime:10,
	token: {
		expire: 60,//minutes
		size: 256
	},
	resetToken:{
		size:128,
		expire:24*60//minutes
	},
	facebook:{
		id:'24009808874',
		secret:'17d3fa32558b69d4ab12e096a',
		url:'http://localhost:9900/user/facebook/callback',
		scope:['email'],
		profileFields:['id', 'displayName', 'email']
	},
	google:{
		id:'106417-b3mtrcueoieed1rgo592qpavifiqbtuc.apps.googleusercontent.com',
		secret:'tB1pBZVC2KNuLWX-V9YeO',
		url:'http://localhost:9900/user/google/callback',
		scope:['https://www.googleapis.com/auth/plus.login','email'],
		profileFields:['id', 'displayName', 'email']
	},
	genPassword:{
		size:10
	}
};
exports.config=config;
