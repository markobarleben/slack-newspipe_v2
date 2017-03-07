var request = require('request');


var newsAPI_config = sails.config.newsAPI;


var DownloadArticleService = {

	download: function(options, callback) {

		var requestString = options.articleSource;

		var sourceResponse = []


		var promise = new Promise(function(resolve, reject) {

			const sourceUrl = 'https://newsapi.org/v1/sources';

			request({
				json: true,
				method: 'GET',
				url: sourceUrl,
				qs: {
					apiKey: newsAPI_config.apiKey
				}
			}, function(error, response, body) {

			if (!error && response.statusCode == 200) {

					sourceResponse = body.sources

					for (var i = 0; i < sourceResponse.length; i++) {
						if (sourceResponse[i].id === requestString) {
							var sortbyArticle = sourceResponse[i].sortBysAvailable
						}
					}

					function checkSortbyArticle(sort) {

						return sort === 'latest'
					}

					if (sortbyArticle) {

						source.sort = sortbyArticle.find(checkSortbyArticle)

					} else {
						callback('error')
					}

					if (!source.sort) {
						source.sort === 'top'
					}

					resolve(source.sort)

				} else {
					callback('error')
				}

			})
		})

		promise.then(function(val) {

			const articleUrl = 'https://newsapi.org/v1/articles';

			request({
				json: true,
				method: 'GET',
				url: articleUrl,
				qs: {
					apiKey: newsAPI_config.apiKey,
					source: requestString,
					sortBy: val
				}

			}, function(error, responds, body) {

				var responseArray = [];

				var articleResponse = body.articles

				responseArray.push(articleResponse)
				responseArray.push(sourceResponse)

				callback(responseArray);

			})
		}).catch(function(err) {

			callback('error')
		});

	}
};

module.exports = DownloadArticleService;


/*
		var articleRequest = request({
			json: true,
			method: 'GET',
			url: articleUrl,
			qs: {
				apiKey: '921b772763c34336addecdaf801b1d90',
				source: requestString
			}
		});

		var sourceRequest = request({
			json: true,
			method: 'GET',
			url: sourceUrl,
			qs: {
				apiKey: '921b772763c34336addecdaf801b1d90'
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

*/