var express = require('express');
const bodyParser= require('body-parser');
var passport = require('passport');
// Create our Express router
var router = express.Router();

var clientController = require(process.cwd()+'/controllers/client');
var authController = require(process.cwd()+'/controllers/auth');

/*Global Vars*/
var config=null;
var log=null;
var db=null;

router.use(bodyParser.json()); // for parsing application/json

router.use(passport.initialize());

router.route('/')
	.post(authController.isAuthenticated, clientController.postClients)
	.get(authController.isBasicAuthenticated, clientController.getClients);


module.exports=function(config_f,db_f,log_f){
	config=config_f;
	log=log_f;
	db=db_f;
	//	console.log(db_f);
	return router;
};
