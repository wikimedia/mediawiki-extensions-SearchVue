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

const retrieveArticleSections = ( context, title ) => {
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
			if ( !result || !result.parse || !result.parse.sections || result.parse.sections.length === 0 ) {
				return;
			}

			const sections = result.parse.sections;
			context.commit( 'SET_SECTIONS', sections );
		} )
		.catch( () => {
			context.commit( 'SET_SECTIONS' );
		} );
};

/**
 * Set thumbnail in the store using the result object provided
 *
 * @param {Object} page
 * @param {Object} context
 */
const setThumbnail = ( page, context ) => {
	if ( !page.thumbnail ) {
		return;
	}

	const thumbnail = Object.assign( {}, page.thumbnail );
	thumbnail.altText = page.pageimage;

	context.commit( 'SET_THUMBNAIL', thumbnail );
};

/**
 * Retrieve the QID from the result object
 *
 * @param {Object} page
 * @return {string|undefined}
 */
const getQID = ( page ) => {
	if ( !page.pageprops || !page.pageprops.wikibase_item ) {
		return;
	}

	return page.pageprops.wikibase_item;
};

/**
 * Sort the object retrieved from the commons API. The images
 * are sorted using the 'index' property.
 *
 * @param {Object} result
 * @return {Array}
 */
const sortImagesArray = ( result ) => {
	const images = [];
	// Create an array from the query result
	for ( const key in result.query.pages ) {
		if ( Object.hasOwnProperty.call( result.query.pages, key ) ) {
			images.push( result.query.pages[ key ] );
		}
	}

	images.sort( ( a, b ) => {
		if ( a.index < b.index ) {
			return -1;
		}
		if ( a.index > b.index ) {
			return 1;
		}
		return 0;
	} );

	return images;
};

/**
 * @param {String} QID
 * @return {String}
 */
const generateSearchTerm = ( QID ) => {
	return mw.config.get( 'wgQuickViewSearchFilterForQID' ).replace( /%s/g, QID );
};

/**
 * Generate a URI that can be used to replicate the API request for the commons images
 *
 * @param {string} QID
 * @return {Object}
 */
const generateSearchLink = ( QID ) => {
	const searchTerm = encodeURIComponent( generateSearchTerm( QID ) );
	return new mw.Uri( mw.config.get( 'wgQuickViewMediaRepositorySearchUri' ).replace( /%s/g, searchTerm ) );
};

/**
 * Retrieved information from the Commons wiki using the foreignApi.
 * This method require two configuration settings to be set 'wgQuickViewMediaRepositoryApiBaseUri' and
 * 'wgQuickViewSearchFilterForQID'.
 *
 * @param {Object} page
 * @param {Object} context
 * @param {Function} context.commit
 */
const setCommonsInfo = ( page, context ) => {
	const QID = getQID( page );
	if ( !QID ) {
		context.commit( 'SET_COMMONS' );
	}

	if (
		!mw.config.get( 'wgQuickViewMediaRepositoryApiBaseUri' ) ||
		!mw.config.get( 'wgQuickViewSearchFilterForQID' )
	) {
		return;
	}

	const api = new mw.ForeignApi( mw.config.get( 'wgQuickViewMediaRepositoryApiBaseUri' ) );

	let gsrsearch = 'filetype:bitmap|drawing';
	gsrsearch += ' ' + generateSearchTerm( QID );

	// filter out images with resolution 0
	gsrsearch += ' -fileres:0';

	const options = {
		action: 'query',
		format: 'json',
		generator: 'search',
		gsrsearch: gsrsearch,
		gsrnamespace: 6, // NS_FILE
		gsrlimit: 7,
		prop: 'imageinfo',
		iiprop: 'url',
		iiurlwidth: 365
	};

	api
		.get( options )
		.done( ( result ) => {
			if ( !result || !result.query || !result.query.pages || result.query.pages.length === 0 ) {
				return;
			}

			const images = sortImagesArray( result );
			const hasMoreImages = !!result.continue;
			const mediaSearchLink = generateSearchLink( QID );

			const commonsInfo = {
				images: images.filter( ( image ) => {
					// drop the image if it's the same as the page image we're
					// already showing at the top
					return !image.imageinfo[ 0 ] ||
						!page.original ||
						page.original.source !== image.imageinfo[ 0 ].url;
				} ),
				hasMoreImages: hasMoreImages,
				searchLink: mediaSearchLink
			};

			context.commit( 'SET_COMMONS', commonsInfo );
		} )
		.catch( () => {
			context.commit( 'SET_COMMONS' );
		} );
};

/**
 * Fetch article information from the API. This method is going to update the aricle thumbnail
 * and initialize a follow up request to fetch commons information for the article.
 *
 * @param {Object} context
 * @param {string} title
 */
const retrieveInfoFromQuery = ( context, title ) => {
	const api = new mw.Api();
	const options = {
		action: 'query',
		format: 'json',
		titles: title,
		prop: 'pageimages|pageprops',
		formatversion: 2,
		pithumbsize: 420,
		piprop: 'thumbnail|name|original'
	};

	api
		.get( options )
		.done( ( result ) => {
			if ( !result || !result.query || !result.query.pages || result.query.pages.length === 0 ) {
				return;
			}

			// we select the first result that is the most relevant to our search term
			const page = result.query.pages[ 0 ];

			setThumbnail( page, context );
			setCommonsInfo( page, context );
		} )
		.catch( () => {
			context.commit( 'SET_THUMBNAIL' );
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
			retrieveArticleSections( context, title );
			retrieveInfoFromQuery( context, title );
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
		context.commit( 'SET_THUMBNAIL' );
		context.commit( 'SET_COMMONS' );
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
