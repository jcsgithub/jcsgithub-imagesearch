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
	            .sort('-_id')
	            .select('-__v')
	            .exec(function (err, results) {
	                if (err)  { throw err; }
	                
	                var finalData = [];
	                results.forEach(function (item) {
	                	finalData.push({
							term: item.term,
							when: item._id.getTimestamp()
						});
	                });
	                
	                res.status(200).send(finalData);
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
					body.items.forEach(function(item) {
						finalData.push({
							url: item.link,
							title: item.title,
							thumbnail: item.image.thumbnailLink,
							context: item.image.contextLink
						});
					});
					
					// save to Searches
					var newSearch = new Searches();
			        newSearch.term = req.params.searchTxt;
					newSearch.save();
					
					res.status(200).send(finalData);
				} else {
					res.status(400).send(body);
				}
			})
		});
};