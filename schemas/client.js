// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var userModel = require (process.cwd()+'/schemas/user.js');

// Define our client schema
var ClientSchema = new mongoose.Schema({
	name: { type: String,  required: true },
	secret: { type: String, required: true, unique: true },
	domains: [ { type: String } ],
	userId: { type: String, required: true, ref: 'User'},
	clientIp: { type: String, required: true },
	date_added:{type:Date,default:Date.now}
});

// Execute before each user.save() call
ClientSchema.pre('save', function(callback) {
	var user = this;

	// Break out if the secret hasn't changed
	if (!user.isModified('secret')) return callback();

	// secret changed so we need to hash it
	bcrypt.genSalt(15, function(err, salt) {
		if (err) return callback(err);

		bcrypt.hash(user.secret, salt, null, function(err, hash) {
			if (err) return callback(err);
			user.secret = hash;
			callback();
		});
	});
});

ClientSchema.methods.verifySecret = function(secret, cb) {
	bcrypt.compare(secret, this.secret, function(err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

// Export the Mongoose model
module.exports = mongoose.model('Client', ClientSchema);