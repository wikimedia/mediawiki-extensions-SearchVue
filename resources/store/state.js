'use strict';

const requestStatuses = {
	notStarted: 'Not started',
	inProgress: 'In progress',
	done: 'Done',
	error: 'error'
};

module.exports = {
	title: null,
	nextTitle: null,
	selectedIndex: -1,
	prevSelectedIndex: null,
	isMobile: mw.config.get( 'skin' ) === 'minerva',
	results: mw.config.get( 'wgSpecialSearchTextMatches' ) || [],
	sections: [],
	thumbnail: null,
	description: null,
	media: {
		images: [],
		hasMoreImages: false,
		searchLink: null
	},
	requestStatuses: requestStatuses,
	requestStatus: {
		query: requestStatuses.notStarted,
		media: requestStatuses.notStarted
	},
	componentReady: false,
	destination: '',
	breakpoints: {
		medium: 1000,
		large: 1440,
		small: 720
	},
	links: []
};
