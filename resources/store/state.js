'use strict';

module.exports = {
	title: null,
	selectedIndex: -1,
	isMobile: mw.config.get( 'skin' ) === 'minerva',
	results: mw.config.values.wgSpecialSearchTextMatches || [],
	sections: [],
	thumbnail: null,
	description: null,
	commons: {
		images: [],
		hasMoreImages: false,
		searchLink: null
	}
};
