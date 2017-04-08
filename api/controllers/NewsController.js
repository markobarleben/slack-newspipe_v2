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

			if (counter > 0) {
				counter = 0
			};

			var articleSource = req.body.text;

			articleSource = articleSource.toLowerCase()

			//handle empty request string coming from slack
			if(!articleSource){
				articleSource = 'help'
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
					articleSource: articleSource

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

		var payload_button = req.body.payload
		payload_button = JSON.parse(payload_button)

		// share article in current channel 
		if (payload_button.actions[0].name === 'share_article') {

			var share_article = payload_button.actions.shift().value

				share_article = JSON.parse(share_article)

			sails.log(share_article)

				var article_to_share = ArticleService.shareMessageInChannel({
					share_article: share_article
				})

				return res.ok(article_to_share)
		}

		var next_article = payload_button.actions.shift().value

		DownloadArticleService.download({
			articleSource: next_article
		}, function(articles, error) {

			if (articles ==='error') {
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
					sourceName: next_article,
					counter: counter
				})

			} else {
				var errorMessage = ErrorService.errorMessageToUser();
				return res.serverError(errorMessage)
			}

			if (articleQuery) {

				var article = ArticleService.buildArticleMessageForSlack({
					articleSource: next_article,
					articleQuery: articleQuery,
					responseSource: responseSource
				})
			}
			return res.ok(article)
		})

	}

};