var request = require('request-promise');
var Promise = require('bluebird');

var newsAPI_config = sails.config.newsAPI;


var DownloadArticleService = {

	download: function(options, callback) {

		sails.log('download download')

		var requestString = options.articleSource;

		var sourceUrl = 'https://newsapi.org/v1/sources';
		var articleUrl = 'https://newsapi.org/v1/articles?';

		var articleRequest = request({
			json: true,
			method: 'GET',
			url: articleUrl,
			qs: {
				apiKey: newsAPI_config.apiKey,
				source: requestString
			}
		});

		var sourceRequest = request({
			json: true,
			method: 'GET',
			url: sourceUrl,
			qs: {
				apiKey: newsAPI_config.apiKey
			}
		});

		Promise.all([
				articleRequest,
				sourceRequest
			])
			.then(function(articleAndSourceResponse) {
				var responseArray = [];
				var articleResponse = articleAndSourceResponse[0].articles;
				var sourceResponse = articleAndSourceResponse[1].sources;

				responseArray.push(articleResponse)
				responseArray.push(sourceResponse)

				callback(responseArray);
			})
			.catch(function(err) {

				callback('error')
			});
	}
};

module.exports = DownloadArticleService;