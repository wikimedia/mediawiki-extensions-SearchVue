'use strict';

module.exports = {
	/**
	 * Returns the currently selected result.
	 *
	 * @param {Object} state
	 *
	 * @return {Object}
	 */
	currentResult: ( state ) => {

		if ( state.selectedIndex === -1 || !state.results[ state.selectedIndex ] ) {
			return {};
		}

		const additionalInfo = {
			sections: state.sections,
			thumbnail: state.thumbnail,
			commons: state.commons,
			description: state.description
		};

		return $.extend(
			state.results[ state.selectedIndex ],
			additionalInfo
		);

	},
	/**
	 * Define if any part of the search preview are still in a loading state
	 *
	 * @param {Object} state
	 *
	 * @return {Object}
	 */
	loading: ( state ) => {
		for ( const property in state.requestStatus ) {
			if ( state.requestStatus[ property ] === state.requestStatuses.inProgress ) {
				return true;
			}
		}

		return false;
	},
	/**
	 * Check if mobile version of quick view is enabled
	 *
	 * @param {Object} state
	 *
	 * @return {boolean}
	 */
	isEnabled: ( state ) => {
		let enable = !state.isMobile;
		if ( ( new mw.Uri() ).query.quickViewEnableMobile !== undefined ) {
			// casting with parseInt instead of Boolean to also consider
			// a (string) '0' as off
			enable = enable || parseInt( ( new mw.Uri() ).query.quickViewEnableMobile );
		} else {
			enable = enable || mw.config.get( 'wgQuickViewEnableMobile' );
		}
		return enable;
	}

};
