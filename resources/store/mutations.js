'use strict';

module.exports = {
	/**
	 * Set the value of title
	 *
	 * @param {Object} state
	 * @param {?string} title
	 */
	SET_TITLE: ( state, title ) => {
		state.title = title;
	},
	/**
	 * Set the value of the selected result index
	 *
	 * @param {Object} state
	 * @param {number} index
	 */
	SET_SELECTED_INDEX: ( state, index ) => {
		state.selectedIndex = index;
	},
	/**
	 * Set the value of sections or reset to empty array
	 *
	 * @param {Object} state
	 * @param {Array} sections
	 */
	SET_SECTIONS: ( state, sections ) => {
		state.sections = sections || [];
	},
	/**
	 * Set the thumbnail object of the selected item
	 *
	 * @param {Object} state
	 * @param {Object|undefined} thumbnail
	 */
	SET_THUMBNAIL: ( state, thumbnail ) => {
		state.thumbnail = thumbnail || null;
	},
	/**
	 * Variable used to inform us that the component is ready to be shown.
	 * This is used to control the animation timing.
	 *
	 * @param {Object} state
	 * @param {boolean} show
	 */
	SET_COMPONENT_READY: ( state, show ) => {
		state.componentReady = show;
	},
	/**
	 * Set the next title. This value is used when transitioning between different Search Previews on mobile
	 *
	 * @param {Object} state
	 * @param {string} title
	 */
	SET_NEXT_TITLE: ( state, title ) => {
		state.nextTitle = title;
	},
	/**
	 * Set the destination for the app container, used by the teleport
	 *
	 * @param {Object} state
	 * @param {string} destination
	 */
	SET_DESTINATION: ( state, destination ) => {
		state.destination = destination;
	},
	/**
	 * Set the description of the selected item
	 *
	 * @param {Object} state
	 * @param {string} description
	 */
	SET_DESCRIPTION: ( state, description ) => {
		state.description = description || null;
	},
	/**
	 * Set the additional images retrieved from the commons API
	 *
	 * @param {Object} state
	 * @param {Object|undefined} commonsInfo
	 * @param {Array} commonsInfo.images
	 * @param {boolean} commonsInfo.continue
	 */
	SET_COMMONS: ( state, commonsInfo ) => {
		state.commons.images = !commonsInfo ? [] : commonsInfo.images;
		state.commons.hasMoreImages = commonsInfo && commonsInfo.hasMoreImages;
		state.commons.searchLink = !commonsInfo ? '' : commonsInfo.searchLink;
	},
	/**
	 * Updates the status of a current API requests
	 *
	 * @param {Object} state
	 * @param {Object} payload
	 * @param {string} payload.type
	 * @param {string} payload.status
	 */
	SET_REQUEST_STATUS: ( state, payload ) => {
		if ( state.requestStatus[ payload.type ] ) {
			state.requestStatus[ payload.type ] = payload.status;
		}
	},
	/**
	 * Updates the status of a current API requests
	 *
	 * @param {Object} state
	 */
	RESET_REQUEST_STATUS: ( state ) => {
		for ( const property in state.requestStatus ) {
			state.requestStatus[ property ] = state.requestStatuses.notStarted;
		}
	}
};
