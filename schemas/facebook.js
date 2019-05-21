// Load required packages
var mongoose = require('mongoose');
var uid = require('uid2');
var config = require(process.cwd()+'/config').config;
var clientModel = require (process.cwd()+'/schemas/user.js');
var Schema = mongoose.Schema;
var FacebookSchema = mongoose.Schema({
	value: { type: String, unique: true },
	userId: { type: Schema.Types.ObjectId, ref: 'User' },
	name: { type: String, required:true },
	email: { type: String, required:true },
	facebookId: { type: Number, required:true },
	expires: { type: Date },
	active: { type: Boolean, get: function(value) {
		if (this.expires < new Date() || !value) {
			return false;
		} else {
			return value;
		}
	}, default: true }

});

// Execute before each user.save() call
FacebookSchema.pre('save', function(callback) {
	var user = this;

	// Break out if the expires hasn't changed
	if (!user.isModified('expires')) return callback();
	var today = new Date();
	user.expires = new Date(today.getTime() + user.expires*1000);
	return callback();
});

module.exports = mongoose.model('Facebook', FacebookSchema);
