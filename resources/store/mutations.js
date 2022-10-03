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
	}
};
