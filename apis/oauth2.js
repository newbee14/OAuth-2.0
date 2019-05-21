var express = require('express');
var app = express();
const bodyParser= require('body-parser');
var passport = require('passport');
// Create our Express router
var router = express.Router();

var oauth2Controller = require(process.cwd()+'/controllers/oauth');
var authController = require(process.cwd()+'/controllers/auth');

/*Global Vars*/
var config=null;
var log=null;
var db=null;

router.use(bodyParser.json()); // for parsing application/json

router.use(passport.initialize());

router.route('/authorize')
	.get(authController.isAuthenticated, oauth2Controller.authorization)
	.post(authController.isAuthenticated, oauth2Controller.decision);

router.route('/token')
	.post(authController.isClientAuthenticated,oauth2Controller.token);

module.exports=function(config_f,db_f,log_f){
	config=config_f;
	log=log_f;
	db=db_f;
	//	console.log(db_f);
	return router;
};
