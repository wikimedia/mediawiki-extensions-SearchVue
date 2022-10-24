'use strict';

const requestStatuses = {
	notStarted: 'Not started',
	inProgress: 'In progress',
	done: 'Done',
	error: 'error'
};

module.exports = {
	title: null,
	selectedIndex: -1,
	isMobile: mw.config.get( 'skin' ) === 'minerva',
	results: mw.config.get( 'wgSpecialSearchTextMatches' ) || [],
	sections: [],
	thumbnail: null,
	description: null,
	commons: {
		images: [],
		hasMoreImages: false,
		searchLink: null
	},
	requestStatuses: requestStatuses,
	requestStatus: {
		query: requestStatuses.notStarted,
		commons: requestStatuses.notStarted
	}
};
