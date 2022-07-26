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
			context.commit( 'SET_SELECTED_INDEX', -1 );
		} else {
			// TODO -> Retrieve snippets information and save them in the store
			context.commit( 'SET_TITLE', title );

			const selectedTitleIndex = context.state.results.findIndex( ( result ) => {
				return result.prefixedText === title;
			} );

			context.commit( 'SET_SELECTED_INDEX', selectedTitleIndex );
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
	},
	/**
	 * Navigate results
	 *
	 * @param {Object} context
	 * @param {Object} context.state
	 * @param {Function} context.commit
	 * @param {string} action
	 */
	navigate: ( context, action ) => {
		if ( [ 'next', 'previous' ].indexOf( action ) <= -1 ) {
			return;
		}

		let newIndex;

		switch ( action ) {
			case 'next':
				newIndex = context.state.selectedIndex + 1;
				break;

			case 'previous':
				newIndex = context.state.selectedIndex - 1;
				break;
		}

		if ( newIndex >= context.state.results.length || newIndex === -1 ) {
			return;
		}

		const title = context.state.results[ newIndex ].prefixedText;
		context.commit( 'SET_TITLE', title );
		context.commit( 'SET_SELECTED_INDEX', newIndex );
	}
};
