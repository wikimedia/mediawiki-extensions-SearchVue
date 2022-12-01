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

const setArticleSections = ( page, context ) => {
	if ( !page || !page.cirrusdoc || page.cirrusdoc.length === 0 ) {
		context.commit( 'SET_SECTIONS' );
		return;
	}

	const cirrusdoc = page.cirrusdoc[ 0 ];
	let sections = [];

	if ( cirrusdoc.source && cirrusdoc.source.heading ) {
		sections = cirrusdoc.source.heading;
	}

	context.commit( 'SET_SECTIONS', sections );

};

/**
 * Set thumbnail in the store using the result object provided
 *
 * @param {Object|undefined} thumbnail
 * @param {string} alt
 * @param {Object} context
 */
const setThumbnail = ( thumbnail, alt, context ) => {
	if ( !thumbnail ) {
		context.commit( 'SET_THUMBNAIL' );
		return;
	}

	const clone = Object.assign( {}, thumbnail );
	if ( alt ) {
		clone.alt = alt;
	}

	context.commit( 'SET_THUMBNAIL', clone );
};

/**
 * Set thumbnail in the store using the result object provided
 *
 * @param {Object} page
 * @param {Object} context
 */
const setDescription = ( page, context ) => {
	if ( !page.pageprops || !page.pageprops[ 'wikibase-shortdesc' ] ) {
		context.commit( 'SET_DESCRIPTION' );
		return;
	}

	context.commit( 'SET_DESCRIPTION', page.pageprops[ 'wikibase-shortdesc' ] );
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
 * @param {string} QID
 * @return {string}
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
		return;
	}

	if (
		!mw.config.get( 'wgQuickViewMediaRepositoryApiBaseUri' ) ||
		!mw.config.get( 'wgQuickViewSearchFilterForQID' ) ||
		!mw.config.get( 'wgQuickViewMediaRepositorySearchUri' )
	) {
		return;
	}

	const api = new mw.ForeignApi( mw.config.get( 'wgQuickViewMediaRepositoryApiBaseUri' ) );

	let gsrsearch = 'filetype:bitmap|drawing';
	gsrsearch += ' ' + generateSearchTerm( QID );

	// filter out images with resolution 0
	gsrsearch += ' -fileres:0';

	const numberOfImagesToLoad = context.state.isMobile ? 3 : 7;

	const options = {
		action: 'query',
		format: 'json',
		generator: 'search',
		gsrsearch: gsrsearch,
		gsrnamespace: 6, // NS_FILE
		gsrlimit: numberOfImagesToLoad,
		prop: 'imageinfo',
		iiprop: 'url',
		iiurlwidth: 400
	};

	context.commit( 'SET_REQUEST_STATUS', {
		type: 'commons',
		status: context.state.requestStatuses.inProgress
	} );

	api
		.get( options )
		.done( ( result ) => {
			if ( !result || !result.query || !result.query.pages || result.query.pages.length === 0 ) {

				context.commit( 'SET_REQUEST_STATUS', {
					type: 'commons',
					status: context.state.requestStatuses.done
				} );
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
			context.commit( 'SET_REQUEST_STATUS', {
				type: 'commons',
				status: context.state.requestStatuses.done
			} );
		} )
		.catch( () => {
			context.commit( 'SET_COMMONS' );

			context.commit( 'SET_REQUEST_STATUS', {
				type: 'commons',
				status: context.state.requestStatuses.error
			} );
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

	context.commit( 'SET_REQUEST_STATUS', {
		type: 'query',
		status: context.state.requestStatuses.inProgress
	} );
	const api = new mw.Api();
	const options = {
		action: 'query',
		format: 'json',
		titles: title,
		prop: 'pageimages|pageprops|cirrusdoc',
		formatversion: 2,
		pithumbsize: 400,
		pilicense: 'free',
		piprop: 'thumbnail|name|original',
		cdincludes: 'heading'
	};

	api
		.get( options )
		.done( ( result ) => {
			if ( !result || !result.query || !result.query.pages || result.query.pages.length === 0 ) {

				context.commit( 'SET_REQUEST_STATUS', {
					type: 'query',
					status: context.state.requestStatuses.done
				} );
				return;
			}

			// we select the first result that is the most relevant to our search term
			const page = result.query.pages[ 0 ];

			setThumbnail( page.thumbnail, page.pageimage || '', context );
			setCommonsInfo( page, context );
			setDescription( page, context );
			setArticleSections( page, context );

			context.commit( 'SET_REQUEST_STATUS', {
				type: 'query',
				status: context.state.requestStatuses.done
			} );
		} )
		.catch( () => {
			context.commit( 'SET_THUMBNAIL' );
			context.commit( 'SET_COMMONS' );
			context.commit( 'SET_DESCRIPTION' );
			context.commit( 'SET_SECTIONS' );

			context.commit( 'SET_REQUEST_STATUS', {
				type: 'query',
				status: context.state.requestStatuses.error
			} );
		} );
};

/**
 * Handle the addition and removal of classes to the body and other element to define
 * when the Search Preview is open. This classes are used to apply specific CSS properties.
 *
 * @param {boolean} open
 * @param {Element} currentElement
 */
const handleClassesToggle = ( open, currentElement ) => {
	if ( open ) {
		document.getElementsByTagName( 'body' )[ 0 ].classList.add( 'search-preview-open' );
		currentElement.classList.add( 'searchresult-with-quickview--open' );
	} else {
		document.getElementsByTagName( 'body' )[ 0 ].classList.remove( 'search-preview-open' );
		const openElement = document.getElementsByClassName( 'searchresult-with-quickview--open' )[ 0 ];
		if ( openElement ) {
			openElement.classList.remove( 'searchresult-with-quickview--open' );
		}
	}
};

module.exports = {

	/**
	 * Handles the visibility of the Search Preview definiting title, destination and visibility state.
	 * This action is most used on mobile where toggling between Search Previews has an animation transition
	 * and visibility need to be handled around its timing.
	 *
	 * @param {Object} context
	 * @param {Object} context.state
	 * @param {Function} context.commit
	 * @param {Object} payload
	 * @param {string} payload.title
	 * @param {Element} payload.element
	 * @param {boolean} payload.force
	 */
	toggleVisibily: ( context, { title, element, force } ) => {
		let destination = '.searchresults';
		if ( context.state.isMobile ) {
			// phpcs:disable Squiz.WhiteSpace.OperatorSpacing.NoSpaceBefore,Squiz.WhiteSpace.OperatorSpacing.NoSpaceAfter
			const dataTitleSelector = `[data-title='${title}']`;
			// phpcs:enable Squiz.WhiteSpace.OperatorSpacing.NoSpaceBefore,Squiz.WhiteSpace.OperatorSpacing.NoSpaceAfter
			if ( force ) {
				destination = title ? dataTitleSelector : false;
				context.commit( 'SET_NEXT_TITLE', null );
			} else if ( !context.state.title ) {
				destination = dataTitleSelector;
			} else if ( context.state.title ) {
				context.commit( 'SET_NEXT_TITLE', title );
				context.commit( 'SET_VISIBLE', false );
				return;
			}
		}
		context.commit( 'SET_DESTINATION', destination );
		context.dispatch( 'handleTitleChange', { newTitle: title, element: element } );
	},
	/**
	 * Handle the change in title by retrieving the information from server
	 * and managing the visibility of the panel
	 *
	 * @param {Object} context
	 * @param {Object} context.state
	 * @param {Function} context.commit
	 * @param {Function} context.dispatch
	 * @param {Object} payload
	 * @param {?string} payload.newTitle
	 * @param {?Element} payload.element
	 */
	handleTitleChange: ( context, { newTitle: newTitle, element: element } ) => {
		if ( !newTitle ) {
			return;
		}

		const currentTitle = context.state.title;

		// This invokes on each title change
		context.dispatch( 'closeQuickView' );

		if ( currentTitle !== newTitle ) {
			const selectedTitleIndex = context.state.results.findIndex( ( result ) => {
				return result.prefixedText === newTitle;
			} );
			setThumbnail( context.state.results[ selectedTitleIndex ].thumbnail, '', context );
			retrieveInfoFromQuery( context, newTitle );
			context.commit( 'SET_TITLE', newTitle );
			context.commit( 'SET_VISIBLE', true );
			pushTitleToHistoryState( newTitle );
			handleClassesToggle( true, element );

			context.commit( 'SET_SELECTED_INDEX', selectedTitleIndex );

			context.dispatch( 'events/logQuickViewEvent', { action: 'open-searchpreview', selectedIndex: context.state.selectedIndex }, { root: true } );
		}
	},
	/**
	 * Closes the quick view panel
	 *
	 * @param {Object} context
	 * @param {Function} context.commit
	 */
	closeQuickView: ( context ) => {
		if ( context.state.title !== null ) {
			context.dispatch( 'events/logQuickViewEvent', { action: 'close-searchpreview', selectedIndex: context.state.selectedIndex }, { root: true } );
		}
		context.commit( 'SET_TITLE', null );
		context.commit( 'SET_SELECTED_INDEX', -1 );
		context.commit( 'SET_THUMBNAIL' );
		context.commit( 'SET_COMMONS' );
		context.commit( 'SET_DESCRIPTION' );
		context.commit( 'SET_SECTIONS' );
		context.commit( 'SET_VISIBLE' );
		removeQuickViewFromHistoryState();
		handleClassesToggle( false );
	},
	/**
	 * Emit close event when page is closing/refreshing while QuickView is open
	 *
	 * @param {Object} context
	 * @param {Function} context.dispatch
	 */
	onPageClose: ( context ) => {
		context.dispatch( 'events/logQuickViewEvent', { action: 'close-searchpreview', selectedIndex: context.state.selectedIndex }, { root: true } );
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
