
var ErrorService = {

	errorMessageToUser: function() {
		var errorMessage = {
			text: 'Someting is wrong here! No Article found ' + ':cry: \n ' +
				'Type ' + '`/newspipe help` for more informations'
		};
		return errorMessage;
	}
};

module.exports = ErrorService