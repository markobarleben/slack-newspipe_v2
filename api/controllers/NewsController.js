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

		if (slack_config.slack_token === req.body.token) {

			var timeStamp_start = Math.floor(Date.now());

			if (counter > 0) {
				counter = 0
			};

			var articleSource = req.body.text;
			var responseUrl = req.body.response_url;



			articleSource = articleSource.toLowerCase()

			// check if string empty
			if (articleSource === ' ' || articleSource === '' || articleSource === null || !articleSource || !articleSource.length){
				articleSource == 'help'
			}

			// find whitespaces and delete them
			if (/\s/g.test(articleSource)) {
				articleSource = articleSource.trim();
			}

			sails.log(articleSource)

			if (articleSource === 'help') {
				var sendHelpMessage = HelpService.answerToUser({
					helpMessageFromUser: articleSource
				});
				return res.ok(sendHelpMessage);
			} else {

				DownloadArticleService.download({
					articleSource: articleSource,
					responseUrl: responseUrl

				}, function(articles, error) {

					if (articles === 'error') {
						var errorMessage = ErrorService.errorMessageToUser({
							falseStringFromUser: articleSource
						}, function(errorMessage, error) {
							return res.ok(errorMessage)
						});

						return;
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
						return res.ok(errorMessage)
					}

					if (articleQuery && responseSource) {
						var article = ArticleService.buildArticleMessageForSlack({
							articleSource: articleSource,
							articleQuery: articleQuery,
							responseSource: responseSource
						})
					}
					return res.ok(article)
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
			}
			return res.ok(article)
		})

	}

};