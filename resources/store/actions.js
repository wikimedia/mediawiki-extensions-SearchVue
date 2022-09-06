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

const retriveArticleSections = ( context, title ) => {
	const api = new mw.Api();
	const options = {
		action: 'parse',
		format: 'json',
		page: title,
		prop: 'sections'
	};

	api
		.get( options )
		.done( ( result ) => {
			if ( !result || !result.parse || result.parse.sections.length === 0 ) {
				return;
			}

			const sections = result.parse.sections;
			context.commit( 'SET_SECTIONS', sections );
		} )
		.catch( () => {
			context.commit( 'SET_SECTIONS' );
		} );
};

module.exports = {

	/**
	 * Handle the change in title by retrieving the information from server
	 * and managing the visibility of the panel
	 *
	 * @param {Object} context
	 * @param {Object} context.state
	 * @param {Function} context.commit
	 * @param {Function} context.dispatch
	 * @param {?string} title
	 */
	handleTitleChange: ( context, title ) => {
		if ( !title ) {
			return;
		}

		context.dispatch( 'closeQuickView' );

		if ( context.state.title !== title ) {
			retriveArticleSections( context, title );
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
		context.commit( 'SET_SECTIONS' );
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
