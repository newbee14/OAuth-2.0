// Load required packages
var mongoose = require('mongoose');
var userModel = require (process.cwd()+'/schemas/user.js');
var clientModel = require (process.cwd()+'/schemas/client');

// Define our token schema
var CodeSchema   = new mongoose.Schema({
	value: { type: String, required: true },
	redirectUri: { type: String, required: true },
	userId: { type: String, required: true, ref: 'User' },
	clientId: { type: String, required: true, ref: 'Client' }
});

// Export the Mongoose model
module.exports = mongoose.model('Code', CodeSchema);