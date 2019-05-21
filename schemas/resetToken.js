// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var config = require(process.cwd()+'/config').config;
var userModel = require (process.cwd()+'/schemas/user.js');
var Schema = mongoose.Schema;

// Define our user schema
var resetTokenSchema = new mongoose.Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User' },
	value:{type:String},
	expires: { type: Date, default: function(){
		var today = new Date();
		var length = config.resetToken.expire; // Length (in minutes) of our access token
		return new Date(today.getTime() + length*60000);
	} },
	active: { type: Boolean, get: function(value) {
		if (this.expires < new Date() || !value) {
			return false;
		} else {
			return value;
		}
	}, default: true }
});
// Export the Mongoose model
module.exports = mongoose.model('ResetToken', resetTokenSchema);
