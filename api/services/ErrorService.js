var Fuse = require('fuse.js');
var request = require('request');

var ErrorService = {

	errorMessageToUser: function(options) {

		var newsAPI_config = sails.config.newsAPI;

		var sourceUrl = 'https://newsapi.org/v1/sources';

		var falseStringFromUser = options.falseStringFromUser;

		var resultId = " ";


		request.get({
			json: true,
			url: sourceUrl,
			qs: {
				apiKey: newsAPI_config
			}

		}, function(error, response, body) {

			var sources = body.sources

			if (!error && response.statusCode == 200) {

				var options = {
					keys: ['id'],
				};

				var fuse = new Fuse(sources, options)
				var result = fuse.search(falseStringFromUser)

				for (var i = 0; i < result.length; i++) {
					
					resultId = result[i].id

					sails.log(resultId)
				}
			}

		})

		var errorMessage = {
			text: 'Someting is wrong here! No Article found ' + ':cry: \n ' +
				'Type ' + '`/newspipe help` for more informations \n ' +
				' or ist that what you mean mabye ',

				attachments: [{
				fallback: "Message is coming soon",
				color: '#f9f9f9',
				text: '`' +resultId + '`'
			}]
		};

		return errorMessage;
	}
};

module.exports = ErrorService