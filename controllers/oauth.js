// Load required packages
var oauth2orize = require('oauth2orize');
var User = require(process.cwd()+'/schemas/user');
var Client = require(process.cwd()+'/schemas/client');
var Token = require(process.cwd()+'/schemas/token');
var Code = require(process.cwd()+'/schemas/code');
var uid = require('uid2');
var url = require('url');

var server = oauth2orize.createServer();

// Register serialialization function
server.serializeClient(function(client, callback) {
	return callback(null, client._id);
});

// Register deserialization function
server.deserializeClient(function(id, callback) {
	Client.findOne({ _id: id }, function (err, client) {
		if (err) { return callback(err); }
		return callback(null, client);
	});
});

// Register authorization code grant type
server.grant(oauth2orize.grant.code(function(client, redirectUri, user, ares, callback) {
	// Create a new authorization code
	var code = new Code({
		value: uid(16),
		clientId: client._id,
		redirectUri: redirectUri,
		userId: user._id
	});

	// Save the auth code and check for errors
	code.save(function(err) {
		if (err) { return callback(err); }

		callback(null, code.value);
	});
}));

// Exchange authorization codes for access tokens
server.exchange(oauth2orize.exchange.code(function(client, code, redirectUri, body, callback) {
	Code.findOne({ value: code }, function (err, authCode) {
		if (err) { return callback(err); }
		if (authCode === undefined) { return callback(null, false); }
		if (client._id.toString() !== authCode.clientId) { return callback(null, false); }
		if (redirectUri !== authCode.redirectUri) { return callback(null, false); }

		// Delete auth code now that it has been used
		authCode.remove(function (err) {
			if(err) { return callback(err); }

			// Create a new access token
			var token = new Token({
				clientId: authCode.clientId,
				userId: authCode.userId
			});

			// Save the access token and check for errors
			token.save(function (err) {
				if (err) { return callback(err); }

				callback(null, token);
			});
		});
	});
}));

// User authorization endpoint
exports.authorization = [
	server.authorization(function(clientId, redirectUri, callback) {
		Client.findOne({ _id: clientId }, function (error, client) {
			if (clientId) {
				var match = false, uri = url.parse(redirectUri || '');
				for (var i = 0; i < client.domains.length; i++) {
					if (uri.host == client.domains[i] || (uri.protocol == client.domains[i] && uri.protocol != 'http' && uri.protocol != 'https')) {
						match = true;
						break;
					}
				}
				if (match && redirectUri && redirectUri.length > 0) {
					callback(null, client, redirectUri);
				} else {
					callback(new Error("You must supply a redirect_uri that is a domain or url scheme owned by your app."), false);
				}
			} else if (!error) {
				callback(new Error("There is no app with the client_id you supplied."), false);
			} else {
				callback(error);
			}
		});
	}),
	function(req, res){
		req.oauth2.client.verifySecret(req.query.secret, function(err, isMatch) {
			if (err) { return res.send(err); }

			// Password did not match
			if (!isMatch) { return res.send({success: false,error:{message:"secret not correct"}}); }

			// Success
			res.json( {message:'Do you, '+(isNaN(req.user.mobile)?req.user.email:req.user.mobile)+', authorize client with id '+req.oauth2.client._id +' and name '+req.oauth2.client.name+'. If yes send post request with transaction id to /authorize', transactionID: req.oauth2.transactionID });

		});
	}
];

// User decision endpoint
exports.decision = [
	server.decision()
];

// Application client token exchange endpoint
exports.token = [
	server.token(),
	server.errorHandler()
];
