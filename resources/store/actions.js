'use strict';
/**
 * Push the current provided title to the browser's session history stack
 *
 * @param {string} title
 */
const pushTitleToHistoryState = ( title ) => {
	const mwUri = new mw.Uri();
	// update mw URI query object with the one currently available within the store
	// In Vue 3, context.state.uriQuery is a Proxy, and passing it to replaceState()
	// causes an error saying it can't be cloned. Work around this by cloning the uriQuery
	// object ourselves, using JSON.parse( JSON.stringify() ) to convert the Proxy to Object.
	const existingQuery = JSON.parse( JSON.stringify( mwUri.query ) );
	mwUri.query = $.extend(
		{},
		existingQuery,
		{ quickView: title }
	);
	const queryString = '?' + mwUri.getQueryString();
	window.history.pushState( mwUri.query, null, queryString );
};
/**
 * Remove the value of QuickView from the history State.
 */
const removeQuickViewFromHistoryState = () => {
	const mwUri = new mw.Uri();
	// update mw URI query object with the one currently available within the store
	// In Vue 3, context.state.uriQuery is a Proxy, and passing it to replaceState()
	// causes an error saying it can't be cloned. Work around this by cloning the uriQuery
	// object ourselves, using JSON.parse( JSON.stringify() ) to convert the Proxy to Object.
	mwUri.query = JSON.parse( JSON.stringify( mwUri.query ) );
	delete mwUri.query.quickView;
	const queryString = '?' + mwUri.getQueryString();
	window.history.pushState( mwUri.query, null, queryString );
};

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

		// Close the quickview if the snippet clicked is current one
		if ( context.state.title === title ) {
			context.dispatch( 'closeQuickView' );
		} else {
			// TODO -> Retrieve snippet information and save them in the store
			context.commit( 'SET_TITLE', title );
			pushTitleToHistoryState( title );

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
		context.commit( 'SET_SELECTED_INDEX', -1 );
		removeQuickViewFromHistoryState();
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
