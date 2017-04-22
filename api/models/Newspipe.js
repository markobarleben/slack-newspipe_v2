/**
 * Newspipe.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const uuidV1 = require('uuid/v1');

module.exports = {

	autoPK: false,

	attributes: {

		id: {
			type: 'string',
			primaryKey: true,
			required: true,
			defaultsTo: function() {
				return uuidV1();
			},
			unique: true,
			index: true,
			uuid: true
		},

		team_id: {
			type: 'string',
			required: true
		},

		user_id: {
			type: 'string',
			required: true,
			unique: true
		},
		oauth_token: {
			type: 'string',
			required: true,
			unique: true
		}
	},


	// if user in DB get oauth_token
	checkUser: function(option, cb) {

		var user_id = option.user_id;
		var team_id = option.team_id;

		Newspipe.find({
				user_id: user_id,
				team_id: team_id
			})
			.exec(function(err, user) {
				if (err) return cb(err);
				cb(null, user);
			})
	},

	// is user not in db create a new user  
	createUser: function(option, cb) {

		var user_id = option.user_id;
		var team_id = option.team_id;
		var oauth_token = option.oauth_token;

		Newspipe.create({
			user_id: user_id,
			team_id: team_id,
			oauth_token: oauth_token
		}).exec(function(err, user) {
			if (err) return cb(err);
			return cb(null, user);
		})
	},

};