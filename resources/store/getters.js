'use strict';

module.exports = {
	/**
	 * Define the current visibility state of the quick view panel
	 *
	 * @param {Object} state
	 *
	 * @return {boolean}
	 */
	visible: ( state ) => {
		return state.title !== null;
	},
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
	}

};
