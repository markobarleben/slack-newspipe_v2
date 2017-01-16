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
			res.badRequest();
			res.send({
				text: "Error: access denied"
			});

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
							//tweak the slack button befor --> commands+team%3Aread
							let team = JSON.parse(body).team_name

							res.redirect('http://' + team + '.slack.com');
						}
					}
				})
			}
		})
	}
};