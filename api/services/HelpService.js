
var HelpService = {

	answerToUser: function(options) {

		if (options.helpMessageFromUser.match('help')) {

			var helpMessage = {

				replace_original: true,

				text: 'If you want to read the latest news from your favourite news source, \n' +
					'simply type the name of your source directly here in your window. e.g ' + '`/newspipe bloomberg`\n'
					+ '*If you want to know what source we feature go on  *' + ' ` <http://newsapi.org/sources|newsapi.org>`'

			}
		}

		return helpMessage;
	},
};

module.exports = HelpService;

