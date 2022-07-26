'use strict';

module.exports = {
	title: null,
	selectedIndex: -1,
	isMobile: mw.config.get( 'skin' ) === 'minerva',
	results: mw.config.values.wgSpecialSearchTextMatches || []
};
