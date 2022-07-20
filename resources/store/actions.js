'use strict';
module.exports = {

	/**
	 * Handle the change in title by retrieving the information from server
	 * and managing the visibility of the panel
	 *
	 * @param {Object} context
	 * @param {Object} context.state
	 * @param {Function} context.commit
	 * @param {?string} title
	 */
	handleTitleChange: ( context, title ) => {
		if ( !title ) {
			return;
		}

		// Close the quickview if the snippets clicked is current one
		if ( context.state.title === title ) {
			context.commit( 'SET_TITLE', null );
		} else {
			// TODO -> Retrieve snippets information and save them in the store
			context.commit( 'SET_TITLE', title );
		}
	},
	/**
	 * Closes the quick view panel
	 *
	 * @param {Object} context
	 * @param {Function} context.commit
	 */
	closeQuickView: ( context ) => {
		context.commit( 'SET_TITLE', null );
	}
};
