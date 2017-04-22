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
			sails.log.error('error')
		})

	// if source and sortBy "top / latest" successfully loaded
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
