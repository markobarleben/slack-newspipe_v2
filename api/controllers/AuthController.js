/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var request = require('request');
let slack_config = sails.config.slack;

module.exports = {

	auth: function(req, res) {

		let SlackClientId = slack_config.clientId;
		let SlackClientSecret = slack_config.clientSecret;
		var qs = {
			code: req.query.code,
			client_id: SlackClientId,
			client_secret: SlackClientSecret
		}

		if (!req.query.code) {
			res.redirect('https://github.com/markobarleben/slack-newspipe/blob/master/README.md');
			return;
		}

		request.get({
			url: 'https://slack.com/api/oauth.access',
			qs
		}, function(error, response, body) {
			if (!error && response.statusCode == 200) {

				let token = JSON.parse(body).access_token

				request.post('https://slack.com/api/team.info', {
					form: {
						token: token
					}
				}, function(error, response, body) {
					if (!error && response.statusCode == 200) {
						if (JSON.parse(body).error == 'missing_scope') {
							res.send('newspipe has been added to your team! THANK U!!!! ');
						} else {
							res.send('slack-newspipe is already added by your team! THANK YOU _ U ARE AWESOME!!!!!!')
								
						}
					}
				})
			}
		})
	},

	user_auth: function(req, res) {

		let SlackClientId = slack_config.clientId;
		let SlackClientSecret = slack_config.clientSecret;
		var qs = {
			code: req.query.code,
			client_id: SlackClientId,
			client_secret: SlackClientSecret,
			redirect_uri: 'https://4ff93375.ngrok.io/user_auth'
		}

		if (!req.query.code) {
			res.redirect('https://github.com/markobarleben/slack-newspipe/blob/master/README.md');
			return;
		}

		request.get({
			url: 'https://slack.com/api/oauth.access',
			qs
		}, function(err, response, body) {

			if (err) return sails.log.error(err);

			if (!err && response.statusCode == 200) {
				let token = JSON.parse(body).access_token
				let user = JSON.parse(body).user_id
				let team = JSON.parse(body).team_id

				Newspipe.createUser({
					user_id: user,
					team_id: team,
					oauth_token: token
				}, function(err, user) {

					if (err) return res.send('Ohhhh User , we have a problem“ 1. We have already your permission. Thank you! Go back and Post your message! 2. Our DB is down ):');

					if (user) {
						res.send('Thank you for your permission to post as you into Slack! Please go back to your favorit channel and post your article');
					}
				})
			}
		})
	}
};