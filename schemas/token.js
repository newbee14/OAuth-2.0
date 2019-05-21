// Load required packages
var mongoose = require('mongoose');
var uid = require('uid2');
var config = require(process.cwd()+'/config').config;
var userModel = require (process.cwd()+'/schemas/user.js');
var clientModel = require (process.cwd()+'/schemas/client');
var Schema = mongoose.Schema;
var AccessTokenSchema = mongoose.Schema({
	value: { type: String, unique: true, default: function() {
		return uid(config.token.size);
	}
		   },
	userId: { type: Schema.Types.ObjectId, ref: 'User' },
	clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
	/*grant: { type: Schema.Types.ObjectId, ref: 'GrantCode' },*/
	/*scope: [ { type: String }],*/
	expires: { type: Date, default: function(){
		var today = new Date();
		var length = config.token.expire; // Length (in minutes) of our access token
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
module.exports = mongoose.model('Token', AccessTokenSchema);
