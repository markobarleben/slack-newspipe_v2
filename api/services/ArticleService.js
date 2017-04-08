var ArticleService = {

	//extract news from respone json after user news request

	articleQuery: function(options) {

		var articleSendToUser = options.articles;
		var sourceSendToUser = options.sources;
		var article = {}

		if (articleSendToUser && articleSendToUser.length && sourceSendToUser && sourceSendToUser.length) {
			for (var i = 0; i <= options.counter; i++) {
				if (typeof articleSendToUser[i] !== 'undefined' && typeof articleSendToUser !== null) {
					article.title = articleSendToUser[i].title
					article.description = articleSendToUser[i].description
					article.url = articleSendToUser[i].url
					article.urlToImage = articleSendToUser[i].urlToImage
				}
			}

			for (var z = 0; z < sourceSendToUser.length; z++) {
				if (typeof sourceSendToUser[z] !== 'undefined' && typeof sourceSendToUser !== null) {

					if (options.sourceName === sourceSendToUser[z].id) {
						article.id = sourceSendToUser[z].id
						article.urlToLogo = sourceSendToUser[z].urlsToLogos.small
						article.category = sourceSendToUser[z].category
						article.language = sourceSendToUser[z].language
					}
				}
			}

			return article

		}

	},

	buildArticleMessageForSlack: function(options) {

		var articleQuery = options.articleQuery
		var source = options.responseSource

		var alternativeSource = []

		for (var i = 0; i < source.length; i++) {
			if (articleQuery.category === source[i].category && articleQuery.language === source[i].language && options.articleSource !== source[i].id) {
				alternativeSource.push(source[i])
			}
		}

		if (!alternativeSource || !alternativeSource.length) {
			alternativeSource.push(source[0])
		}

		var randomSource = alternativeSource[Math.floor(alternativeSource.length * Math.random())]

		// build message for user
		var articleForUser = {

			response_type: "ephemeral",

			attachments: [{
					fallback: 'logo',
					image_url: articleQuery.urlToLogo,
					color: '#f9f9f9'

				}, {
					replace_original: true,
					fallback: "Message",
					color: '#f9f9f9',
					title: articleQuery.title,
					title_link: articleQuery.url,
					text: articleQuery.description,
					image_url: articleQuery.urlToImage,
				}, {
					fallback: "Button Action",
					color: '#f9f9f9',
					callback_id: "next_article",

					actions: [{
						name: "next_article",
						text: "NEXT ARTICLE",
						type: "button",
						value: options.articleSource
					}, {
						name: "random_article",
						text: randomSource.id.toUpperCase(),
						type: "button",
						value: randomSource.id,
						style: 'primary'
					}, {
						name: 'share_article',
						text: 'SHARE',
						type: 'button',
						value: articleQuery
					}],

					footer: 'powered by www.NewsAPI.org and send with  ' + ':heart:' + '  from <https://github.com/markobarleben/slack-newspipe/blob/master/README.md|slack-newspipe>',
				}

			]

		};

		return articleForUser

	},

	shareMessageInChannel: function(options) {

		var articleToShareInChannel = options.share_article


		// share message in channel
		var shareMessage = {

			response_type: 'in_channel',
			replace_original: true,

			attachments: [{
					fallback: 'logo',
					image_url: articleToShareInChannel.urlToLogo,
					color: '#f9f9f9'
				}, {
					replace_original: true,
					fallback: "Message",
					color: '#f9f9f9',
					title: articleToShareInChannel.title,
					title_link: articleToShareInChannel.url,
					text: articleToShareInChannel.description,
					image_url: articleToShareInChannel.urlToImage,
				}

				footer: 'powered by www.NewsAPI.org and send with  ' + ':heart:' + '  from <https://github.com/markobarleben/slack-newspipe/blob/master/README.md|slack-newspipe>',

			]

		}


		sails.log(shareMessage)
		return shareMessage;

	}

};

module.exports = ArticleService;