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
			sections: state.sections
		};

		return $.extend(
			state.results[ state.selectedIndex ],
			additionalInfo
		);

	}

};
