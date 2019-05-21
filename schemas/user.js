// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var config = require(process.cwd()+'/config').config;
var facebookModel = require (process.cwd()+'/schemas/facebook.js');
var Schema = mongoose.Schema;

// Define our user schema
var UserSchema = new mongoose.Schema({
	email: { type: String, unique: true, sparse:true },
	password: { type: String, required: true },
	mobile: { type: Number,  unique: true, sparse:true },
	name: {type:String, required:true},
	facebookId: { type: String },
	googleId:{ type: String },
	loginType:{type: String, required:true}
});

// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
	var user = this;

	// Break out if the password hasn't changed
	if (!user.isModified('password')) return callback();

	// Password changed so we need to hash it
	bcrypt.genSalt(15, function(err, salt) {
		if (err) return callback(err);

		bcrypt.hash(user.password, salt, null, function(err, hash) {
			if (err) return callback(err);
			user.password = hash;
			callback();
		});
	});
});

UserSchema.statics.findOneOrCreate = function findOneOrCreate(condition, doc, callback) {
	const self = this;
	self.findOne(condition, (err, result) => {
		return result ?
			callback(err, {found:true,result:result})
		: self.create(doc, (err, result) => {
			return callback(err, {found:false,result:result});
		});
	});
};

UserSchema.methods.verifyPassword = function(password, cb) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);
