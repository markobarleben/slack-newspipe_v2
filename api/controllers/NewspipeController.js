/**
 * NNewsController
 *
 * @description :: Server-side logic for managing nnews
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var request = require('request');
var slack_config = sails.config.slack;
var counter = 0;

var slack_config = sails.config.slack;

module.exports = {

	newsRequest: function(req, res) {

		if (slack_config.slack_verification_token === req.body.token) {

			if (counter > 0) {
				counter = 0
			};

			var articleSource = req.body.text;

			articleSource = articleSource.toLowerCase()

			//handle empty request string coming from slack
			if (!articleSource) {
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

		var SlackclientId = slack_config.clientId;
		var button_payload = req.body.payload
		button_payload = JSON.parse(button_payload)

		var ask_for_permission = {
			text: 'Please give us your ' + '<https://slack.com/oauth/authorize?&client_id=' + SlackclientId + '&redirect_uri= YOUR_REDIRECT_URI' +
				'&team=' + button_payload.team.id + '&scope=chat:write:user| PERMISSION>' + ' to post as you into Slack'
		}

		// post as user into current channel 
		if (button_payload.actions[0].name === 'post_article') {

			Newspipe.checkUser({
				user_id: button_payload.user.id,
				team_id: button_payload.team.id
			}, function(err, user) {
				if (err) return sails.log.error(err);
				if (!user || !user.length) {
					return res.ok(ask_for_permission)
				} else {
					for (var i = 0; i < user.length; i++) {
						var user_token = user[i].oauth_token
					}
					var post_article = button_payload.actions.shift().value

					post_article = JSON.parse(post_article)

					var article_to_post = ArticleService.postMessageInChannel({
						post_article: post_article
					})

					request({
						method: 'POST',
						json: true,
						url: 'https://slack.com/api/chat.postMessage',
						qs: {
							token: user_token,
							channel: button_payload.channel.id,
							as_user: true,
							text: 'Found at: :point_right: ' + post_article.id.toUpperCase() + ' :point_left:',
							attachments: article_to_post
						}

					}, function(err, responds, body) {

						if (!err && responds.statusCode === 200) {
							return res.ok();
						}
					});
				}
			})

		} else {

			var next_article = button_payload.actions.shift().value

			DownloadArticleService.download({
				articleSource: next_article
			}, function(articles, error) {

				if (articles === 'error') {
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

	}
};