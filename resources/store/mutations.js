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
	 * Set the value of links or reset to empty arrays
	 *
	 * @param {Object} state
	 * @param {Object} links
	 */
	SET_LINKS: ( state, links ) => {
		state.links = links || {};
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
	 * Set the additional images retrieved from the media repository API
	 *
	 * @param {Object} state
	 * @param {Object|undefined} mediaInfo
	 * @param {Array} mediaInfo.images
	 * @param {boolean} mediaInfo.continue
	 */
	SET_MEDIA: ( state, mediaInfo ) => {
		state.media.images = !mediaInfo ? [] : mediaInfo.images;
		state.media.hasMoreImages = mediaInfo && mediaInfo.hasMoreImages;
		state.media.searchLink = !mediaInfo ? '' : mediaInfo.searchLink;
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
	},
	/**
	 * Set an expanded snippet. This is returned as part of the first API call
	 * and will replace the existing snippet included in the search results
	 *
	 * @param {Object} state
	 * @param {string} snippet
	 */
	SET_EXPANDED_SNIPPET: ( state, snippet ) => {
		state.expandedSnippet = snippet || null;
	}
};
