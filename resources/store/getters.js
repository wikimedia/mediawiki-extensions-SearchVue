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
			media: state.media,
			description: state.description,
			links: state.links
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
	 * Determine when the search preview is actually supposed to be visible.
	 * This is used to show the correct loading state.
	 *
	 * @param {Object} state
	 *
	 * @return {Object}
	 */
	visible: ( state ) => {
		const searchResultSelected = !!state.title;

		if ( !searchResultSelected ) {
			return false;
		} else if ( state.isMobile ) {
			return state.componentReady && state.requestStatus.query === state.requestStatuses.done;
		} else {
			return state.componentReady;
		}
	},
	/**
	 * Determine if there is enough data to show the search preview.
	 * This is used on mobile view only.
	 *
	 * @param {Object} _state
	 * @param {Object} getters
	 *
	 * @return {Object}
	 */
	showOnMobile( _state, getters ) {
		return getters.pageInfoAvailable;
	},
	/**
	 * Determine if page information are available for the selected result.
	 * This is used to determine when to display the extension
	 *
	 * @param {Object} _state
	 * @param {Object} getters
	 *
	 * @return {Object}
	 */
	pageInfoAvailable( _state, getters ) {
		const descriptionIsSet = !!getters.currentResult.description;
		const sectionIsSet = getters.currentResult.sections && getters.currentResult.sections.length !== 0;
		const thumbnailIsSet = !!getters.currentResult.thumbnail;

		return descriptionIsSet || sectionIsSet || thumbnailIsSet;
	}
};
