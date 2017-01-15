var request = require('request-promise');
var Promise = require('bluebird');

var DownloadArticleService = {

	download: function(options, callback) {

		var requestString = options.articleSource;
		var response_url = options.responseUrl;

		var sourceUrl = 'https://newsapi.org/v1/sources';
		var articleUrl = 'https://newsapi.org/v1/articles?';

		var articleRequest = request({
			json: true,
			method: 'GET',
			url: articleUrl,
			qs: {
				apiKey: sails.config.newsApiKey.apiKey,
				source: requestString
			}
		});

		var sourceRequest = request({
			json: true,
			method: 'GET',
			url: sourceUrl,
			qs: {
				apiKey: sails.config.newsApiKey.apiKey
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
				sails.log.error(err);
				callback(err);
			});
		}
};

module.exports = DownloadArticleService;