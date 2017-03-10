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

					var source = {}

					function checkSortbyArticle(sort) {

						if (sortbyArticle.indexOf('latest') == -1) {
							return source.sort = 'top'
						} else {
							return source.sort = 'latest'
						}
					}

					if (!sortbyArticle) {

						reject();

					} else {

						source.sort = checkSortbyArticle(sortbyArticle)

						sails.log(source.sort)
					}

					if (source.sort) {

						resolve(source.sort)

					} else {

						reject();
					}

				} else {
					reject()
				}

			})
		}).catch(function(err) {
			sails.log('error')
		})

	// if source and sortBy successfully loaded
		promise.then(function(val) {

			const articleUrl = 'https://newsapi.org/v1/articles';

			if (!val) {
				reject('err')
			} else {

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
			}
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