/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var request = require('request');
var slack_config = sails.config.slack;

module.exports = {

	auth: function(req, res) {

		var SlackclientId = slack_config.clientId;
		var SlackclientSecret = slack_config.clientSecret;
		var qs = {
			code: req.query.code,
			client_id: SlackclientId,
			client_secret: SlackclientSecret
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

							res.send('newspipe has been added to your team!');
						} else {

							res.send('slack-newspipe is already added by your team! THANK YOU _ U ARE AWESOME!!!!!!')
							//rejected by slack team  -> After the app is installed, could you direct users to a page that indicates installation was successful rather than to their Slack team?
							//let team = JSON.parse(body).team.domain;
							//res.redirect('http://' + team + '.slack.com');
						}
					}
				})
			}
		})
	}
};