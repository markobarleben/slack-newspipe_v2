
var ErrorService = {

	errorMessageToUser: function() {
		var errorMessage = {
			text: 'Someting is wrong here! No Article found ' + ':cry: \n ' +
				'Type ' + '`/newspipe help` for more informations'
		};
		return errorMessage;
	},

/*
	endOfArticle: function(options) {
		var endOfArticle = {
			text: 'No more article found in ' + "*`" + options.articleSource + "`*" + ':cry: \n ' +
				'Type ' + '`/newspipe help` for more informations'
		};
		return endOfArticle;
	}

	*/

};

module.exports = ErrorService