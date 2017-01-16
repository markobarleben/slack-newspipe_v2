/**
 * NNewsController
 *
 * @description :: Server-side logic for managing nnews
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var request = require('request');
var counter = 0;

var slack_config = sails.config.slack;

module.exports = {

	newsRequest: function(req, res) {

		if ( slack_config.slack_token === req.body.token) {

			var timeStamp_start = Math.floor(Date.now());

			if (counter > 0) {
				counter = 0
			};

			var slackUsername = req.body.user_name;
			var articleSource = req.body.text;
			var responseUrl = req.body.response_url;

			articleSource = articleSource.toLowerCase()

			// find whitespaces and delete them
			if (/\s/g.test(articleSource)) {
				articleSource = articleSource.trim();
			}

			if (articleSource === 'help' || articleSource === null) {
				var sendHelpMessage = HelpService.answerToUser({
					helpMessageFromUser: articleSource
				});
				return res.ok(sendHelpMessage);
			} else {

				DownloadArticleService.download({
					articleSource: articleSource,
					responseUrl: responseUrl

				}, function(articles, error) {

					if (error) {
						var errorMessage = ErrorService.errorMessageToUser();
						return res.ok(errorMessage)
						sails.log.info('--->>>>>>>   ' + error)
					}

					var responseArticle = articles[0]
					var responseSource = articles[1]

					if (responseArticle && responseSource) {
						var articleQuery = ArticleService.articleQuery({
							articles: responseArticle,
							sources: responseSource,
							sourceName: articleSource,
							counter: counter
						})
					} else {
						var errorMessage = ErrorService.errorMessageToUser();
						res.serverError(errorMessage)
					}

					if (articleQuery && responseSource) {
						var article = ArticleService.buildArticleMessageForSlack({
							articleSource: articleSource,
							articleQuery: articleQuery,
							responseSource: responseSource
						})
					}
					var timeStamp_End = 0;
					var time_result = 0;

					time_result = (timeStamp_end = Math.floor(Date.now()) - timeStamp_start)
					sails.log('time_result -->>>>> ' + time_result)


					// after 2500 msec put article to response_url - but not the best solution 
					if (time_result < 2500) {
						return res.ok(article)
					} else {
						request({
							url: responseUrl, //URL to hit
							headers: {
								"content-type": "application/json",
							},
							body: article,
							method: 'POST',
							json: true
						}, function(error, response, body) {
							if (error) {
								console.log(error);
							} else {
								sails.log(body)
								res.ok(body);
								sails.log(time_result)
							}
						})
						return res.json({
							text: 'message is comming :)'
						});
					}
				})
			}
		} else {

			return res.badRequest({
				text: '`No valid token detected!`'
			})
		}
	},

	buttonAction: function(req, res) {

		counter++;

		var timeStamp_start = Math.floor(Date.now());
		var valueNextButton = req.body.payload
		var responseUrl = req.body.payload
		responseUrl = JSON.parse(responseUrl)
		responseUrl = responseUrl.response_url

		valueNextButton = JSON.parse(valueNextButton)

		var articleNameNextButton = valueNextButton.actions.shift().value

		DownloadArticleService.download({
			articleSource: articleNameNextButton,
			responseUrl: responseUrl
		}, function(articles, error) {

			if (error) {
				var errorMessage = ErrorService.errorMessageToUser();
				return res.serverError(errorMessage)
				sails.log.info(error)
			}

			var responseArticle = articles[0]
			var responseSource = articles[1]
			var articleLength = responseArticle.length

			if (counter === articleLength) {
				counter = 0
			}

			if (responseArticle && responseSource) {
				var articleQuery = ArticleService.articleQuery({
					articles: responseArticle,
					sources: responseSource,
					sourceName: articleNameNextButton,
					counter: counter
				})

			} else {
				var errorMessage = ErrorService.errorMessageToUser();
				return res.serverError(errorMessage)
			}

			if (articleQuery) {

				var article = ArticleService.buildArticleMessageForSlack({
					articleSource: articleNameNextButton,
					articleQuery: articleQuery,
					responseSource: responseSource
				})
			} else {
				sails,
				log('error')
			}

			var timeStamp_End = 0;
			var time_result = 0;

			time_result = (timeStamp_end = Math.floor(Date.now()) - timeStamp_start)
			sails.log('time_result -->>>>> ' + time_result)


			// after 2500 msec take article to response_url - but not the best solution
			if (time_result < 2500) {
				return res.ok(article)
			} else {
				request({
					url: responseUrl, //URL to hit
					headers: {
						'content-type': 'application/json',
					},
					body: article,
					method: 'POST',
					json: true
				}, function(error, response, body) {
					if (error) {
						console.log(error);
					} else {
						res.json(body)
						sails.log(body)
						sails.log(time_result)
					}
				})
				return res.json({
					text: 'message is comming :)'
				});
			}

		})

	}

};