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
	}
};
