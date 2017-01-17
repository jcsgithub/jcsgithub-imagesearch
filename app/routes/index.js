'use strict';

var path = process.cwd();
var Urls = require('../models/urls.js');

var request = require('request');

module.exports = function (app) {
	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});
		
	app.route('/api/imagesearch/:searchTxt')
		.get(function (req, res) {
			var query = req.params.searchTxt;
			var offset = Number(req.query.offset) * 10 || 0;
			
			query += '&num=10&searchType=image';
			
			if (offset)
				query += '&start=' + (offset + 1);
			
			var url = 'https://www.googleapis.com/customsearch/v1?' 
				+ 'key=' + process.env.GOOGLE_API_KEY 
				+ '&cx=' + process.env.GOOGLE_SEARCH_ENGINE_ID 
				+ '&q=' + query;
			
			request(url, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					body = JSON.parse(body);
					
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
					res.status(400);
				}
			})
		});
};