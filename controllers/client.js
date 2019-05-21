var uid=require('uid2');
var url = require('url');

// Load required packages
var Client = require(process.cwd()+'/schemas/client');

// Create endpoint /api/client for POST
exports.postClients = function(req, res) {
	try{
		if(req.get('Content-Type')=='application/json'){
			var json=req.body;
			if(json && json.name && json.domains){
				// Create a new instance of the Client model
				var client = new Client();
				var oauth_secret=uid(64);
				// Set the client properties that came from the POST data
				client.name = json.name;
				client.secret = oauth_secret;
				client.domains = json.domains;
				client.userId = req.user._id;
				client.clientIp = req.ip;

				client.save(function(err) {
					if (err){
						res.send(err);
						return;
					}
					res.json({ 
						message: 'Client successfully added!', 
						data: {
							client_id:client._id,
							client_secret:oauth_secret,
							name:client.name,
							domains:client.domains,
							userId:client.userId
						} 
					});
				});
			}
			else{
				throw new Error("some of the required feilds are missing");
			}
		}
		else{
			throw new Error('content type not json');
		}
	}
	catch(err){
		console.log(err.stack);
		res.json({success:false,error:"Some error '"+err.message+"'"});
	}
};

// Create endpoint /api/clients for GET
exports.getClients = function(req, res) {
	// Use the Client model to find all clients
	Client.find({ userId: req.user._id }, function(err, clients) {
		if (err){
			res.send(err);
			return;
		}

		res.json(clients);
	});
};