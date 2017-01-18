'use strict';

var path = process.cwd();
var Searches = require('../models/searches.js');

var request = require('request');

module.exports = function (app) {
	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});
		
	app.route('/api/latest/imagesearch')
		.get(function (req, res) {
			Searches
	            .find()
	            .limit(10)
	            .select('-__v')
	            .exec(function (err, result) {
	                if (err)  { throw err; }
	                
	                res.status(200).send(result);
	            });
		});
		
	app.route('/api/imagesearch/:searchTxt')
		.get(function (req, res) {
			var query = req.params.searchTxt;
			var offset = Number(req.query.offset) || 0;
			
			query += '&num=10&searchType=image';
			
			if (offset)
				query += '&start=' + (offset);
			
			var url = 'https://www.googleapis.com/customsearch/v1?' 
				+ 'key=' + process.env.GOOGLE_API_KEY 
				+ '&cx=' + process.env.GOOGLE_SEARCH_ENGINE_ID 
				+ '&q=' + query;
			
			request(url, function (error, response, body) {
				body = (body)? JSON.parse(body) : null;
				
				if (!error && response.statusCode == 200) {
					var finalData = [];
					body.items.forEach(function(item, index) {
						finalData.push({
							url: item.link,
							title: item.title,
							thumbnail: item.image.thumbnailLink,
							context: item.image.contextLink
						});
					});
					
					res.status(200).send(finalData);
				} else {
					res.status(400).send(body);
				}
			})
		});
};