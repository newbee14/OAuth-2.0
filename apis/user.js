var express = require('express');
var app = express();
const bodyParser= require('body-parser');
var passport = require('passport');
// Create our Express router
var router = express.Router();

var userController = require(process.cwd()+'/controllers/user');
var authController = require(process.cwd()+'/controllers/auth');
var socialController = require(process.cwd()+'/controllers/social');

/*Global Vars*/
var config=null;
var log=null;
var db=null;

router.use(bodyParser.json()); // for parsing application/json

router.use(passport.initialize());

//add user
router.post('/',userController.postUsers);

//verify user
router.get('/authenticate',authController.isAuthenticated, userController.authenticate);

//password utilities
router.post('/forgotPassword', userController.forgotPassword);
router.post('/resetPassword', userController.resetPassword);

//delete user
router.delete('/',authController.isAuthenticated, userController.delete);

//facebook utilities
router.get('/facebook',socialController.facebookLogin);
router.get('/facebook/callback',userController.genPassword,socialController.facebookLoginRedirect,userController.facebookSuccess);
router.get('/facebook/failiure',userController.facebookFailiure);

//google utilities
router.get('/google',socialController.googleLogin);
router.get('/google/callback',userController.genPassword,socialController.googleLoginCallback,userController.googleSuccess);
router.get('/google/failiure',userController.googleFailiure);

module.exports=function(config_f,db_f,log_f){
	config=config_f;
	log=log_f;
	db=db_f;
	//	console.log(db_f);
	return router;
};
