var Fuse = require('fuse.js');
var request = require('request');

var ErrorService = {

	errorMessageToUser: function(options, callback) {

		var newsAPI_config = sails.config.newsAPI;

		var sourceUrl = 'https://newsapi.org/v1/sources';

		var falseStringFromUser = options.falseStringFromUser;

		var resultAlternativeSource = []

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
					tokenize: true,
					findAllMatches: true,
					keys: ['id']
				};

				var fuse = new Fuse(sources, options)
				var result = fuse.search(falseStringFromUser)

				for (var i = 0; i < result.length; i++) {

					resultAlternativeSource.push(result[i].id)

					sails.log(resultAlternativeSource)

					var errorMessage = {

						text: 'Someting is wrong here! No Article found ' + ':cry: \n ',

						attachments: [{
							fallback: "Message is coming soon",
							color: '#f9f9f9',
							text: ':telescope: Perhaps you may mean \n :point_right: ' + resultAlternativeSource.join(' :point_right:') +
								'\n or type :raised_hands: /newspipe help :raised_hands: for more informations '
						}]
					};
				}

				callback(errorMessage)

			} else {

				sails.log(error)
			}
		})
	}
};

module.exports = ErrorService