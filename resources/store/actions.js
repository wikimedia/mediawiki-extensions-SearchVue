'use strict';

const restApi = new mw.Rest();

const HIGHLIGHTS_REGEX = /<span class="searchmatch">(.+?)<\/span>/g;

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
 * Returns the canonical name of the cirrus field where the snippet text is sourced from.
 *
 * @param {string} snippetField
 * @return {string}
 */
const getFieldFromSnippetField = ( snippetField ) => {
	// Cirrus Field can have mapping like .plain, .source that need removing
	return snippetField ? snippetField.split( '.' )[ 0 ] : 'text';
};

/**
 * Remove unwanted HTML from the text snippet returned by the search
 *
 * @param {string} snippet
 * @return {string}
 */
const stripHighlightsFromSnippet = ( snippet ) => {
	return snippet.replace( HIGHLIGHTS_REGEX, '$1' );
};

/**
 * Extract highlighted words from a snippet
 *
 * @param {string} snippet
 * @return {Array}
 */
const extractHighlightsFromSnippet = ( snippet ) => {
	const highlights = [];
	let match;
	while ( ( match = HIGHLIGHTS_REGEX.exec( snippet ) ) !== null ) {
		const highlight = match[ 1 ].toLowerCase();
		if ( highlights.indexOf( highlight ) < 0 ) {
			highlights.push( highlight );
		}
	}

	return highlights;
};

/**
 * Given an input snippet text and a source text where the snippet is sourced from,
 * this will expand the snippet in both directions.
 *
 * @param {string} snippet
 * @param {string} fullContent
 * @return {string}
 */
const expandSnippet = ( snippet, fullContent ) => {
	const SNIPPETS_EXTRA_CHARACTERS = 100;

	const startSnippetsIndex = fullContent.indexOf( snippet );

	// We calculate the expanding snippet by calculating the expected index value
	// Note: on top of SNIPPETS_EXTRA_CHARACTERS, we're fetching 1 additional character on both
	// sides to help us figure out whether the first/last characters are word boundaries
	const expandedSnippetStartIndex = Math.max( 0, startSnippetsIndex - SNIPPETS_EXTRA_CHARACTERS - 1 );
	const expandedSnippetEndIndex = startSnippetsIndex + snippet.length + SNIPPETS_EXTRA_CHARACTERS + 1;
	let expandedSnippet = fullContent.substring(
		expandedSnippetStartIndex,
		expandedSnippetEndIndex
	);

	// Try to optimize word boundaries by snipping out the first & last words (which are expected to
	// be partial), while making sure not to touch any of the original snippet.
	// We over-fetched by 1 character on either side; if that first/last is a word character, the
	// entire word should be trimmed (since it continues beyond the boundaries we've set); if,
	// however, there's a word break between the first/last and the next/previous character, then
	// that word can be kept (something we wouldn't otherwise have been able to determine without
	// over-fetching)
	const startExpansionLength = expandedSnippet.indexOf( snippet );
	const endExpansionLength = expandedSnippet.length - snippet.length - startExpansionLength;
	if ( startExpansionLength > SNIPPETS_EXTRA_CHARACTERS ) {
		const regexOptimizeStart = new RegExp( '^.{1,' + startExpansionLength + '}?\\s*\\b' );
		expandedSnippet = expandedSnippet.replace( regexOptimizeStart, '' );
	}
	if ( endExpansionLength > SNIPPETS_EXTRA_CHARACTERS ) {
		const regexOptimizeEnd = new RegExp( '(.*)\\b.{1,' + endExpansionLength + '}$' );
		expandedSnippet = expandedSnippet.replace( regexOptimizeEnd, '$1' );
	}
	expandedSnippet = expandedSnippet.trim();

	// Figure out whether we need to add an ellipsis at the start/end to indicate that there
	// is more known content available
	const needsPrefixEllipsis = !fullContent.startsWith( expandedSnippet );
	const needsSuffixEllipsis = !fullContent.endsWith( expandedSnippet );
	if ( needsPrefixEllipsis ) {
		expandedSnippet = mw.msg( 'ellipsis' ) + expandedSnippet;
	}
	if ( needsSuffixEllipsis ) {
		expandedSnippet += mw.msg( 'ellipsis' );
	}

	return expandedSnippet;
};

const generateExpandedSnippet = ( page, context, currentResult ) => {
	const cirrusField = getFieldFromSnippetField( currentResult.snippetField );

	if ( !page ||
		!page.cirrusdoc ||
		page.cirrusdoc.length === 0 ||
		!page.cirrusdoc[ 0 ].source ||
		!page.cirrusdoc[ 0 ].source[ cirrusField ]
	) {
		return {
			expandedSnippet: null
		};
	}

	const snippet = stripHighlightsFromSnippet( currentResult.text );
	if ( snippet.length === 0 ) {
		// No snippet = nothing to expand
		return {
			expandedSnippet: null
		};
	}

	const cirrusFieldValue = page.cirrusdoc[ 0 ].source[ cirrusField ];
	let cirrusFieldContent;

	// Some fields like auxiliary_text can be arrays, so we need to extract its value
	if ( Array.isArray( cirrusFieldValue ) && cirrusField.length > 0 ) {
		for ( let index = 0; index < cirrusFieldValue.length; index++ ) {
			const element = cirrusFieldValue[ index ];
			if ( cirrusFieldValue.indexOf( snippet ) !== -1 ) {
				cirrusFieldContent = element;
				break;
			}
		}
	} else {
		cirrusFieldContent = cirrusFieldValue;
	}

	if (
		snippet.length === cirrusFieldContent.length ||
		cirrusFieldContent.indexOf( snippet ) === -1
	) {
		// If the snippet matches the field's contents exactly, or if it can't be located in the
		// field, there's nothing to expand
		return {
			expandedSnippet: null
		};
	}

	let expandedSnippet = expandSnippet( snippet, cirrusFieldContent );
	const isBeginningOfText = cirrusFieldContent.startsWith( expandedSnippet );

	// We add back the styling that is required to bold the highlighted text
	const highlights = extractHighlightsFromSnippet( currentResult.text );
	highlights.forEach( ( highlight ) => {
		const regexFormatHighlight = new RegExp( `\\b(${highlight})\\b`, 'gi' );
		expandedSnippet = expandedSnippet.replace(
			regexFormatHighlight,
			'<span class="searchmatch">$1</span>'
		);
	} );

	return {
		expandedSnippet: expandedSnippet,
		isBeginningOfText: isBeginningOfText && cirrusField === 'text'
	};
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
 * @param {boolean} snippetIsBeginningOfText
 */
const setDescription = ( page, context, snippetIsBeginningOfText ) => {
	if (
		page.pageprops &&
		page.pageprops[ 'wikibase-shortdesc' ]
	) {
		context.commit( 'SET_DESCRIPTION', page.pageprops[ 'wikibase-shortdesc' ] );
	} else if (
		page.terms &&
		page.terms.description &&
		page.terms.description[ 0 ]
	) {
		context.commit( 'SET_DESCRIPTION', page.terms.description[ 0 ] );

	// In the absence of wikidata description, we show the beginning of the text
	// as long as it is not also the snippets
	} else if (
		!snippetIsBeginningOfText &&
		page.extract &&
		page.extract[ '*' ]
	) {
		context.commit( 'SET_DESCRIPTION', page.extract[ '*' ] );
	} else {
		context.commit( 'SET_DESCRIPTION' );
	}
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
 * Format the media information for usage within the search preview
 *
 * @param {Object} result
 * @param {Object} page
 * @param {Object} context
 * @return {Object}
 */
const formatMediaInfo = ( result, page, context ) => {
	let images = sortImagesArray( result );
	images = images.filter( ( image ) => {
		// drop the image if it's the same as the page image we're
		// already showing at the top
		return !image.imageinfo[ 0 ] ||
			!page.original ||
			page.original.source !== image.imageinfo[ 0 ].url;
	} );

	// API is always returning 7 images, but mobile only uses 3
	const numberOfImagesToLoad = context.state.isMobile ? 3 : 7;
	const hasMoreImages = images.length > numberOfImagesToLoad || !!result.continue;
	images = images.slice( 0, numberOfImagesToLoad );

	return {
		images: images,
		hasMoreImages: hasMoreImages,
		searchLink: result.searchlink
	};
};

/**
 * Retrieved media information from the internal API.
 *
 * @param {Object} page
 * @param {Object} context
 * @param {Function} context.commit
 */
const setMediaInfo = ( page, context ) => {
	const QID = getQID( page );

	if ( !QID ) {
		context.commit( 'SET_MEDIA' );
		return;
	}

	context.commit( 'SET_REQUEST_STATUS', {
		type: 'media',
		status: context.state.requestStatuses.inProgress
	} );

	restApi
		.get( '/searchvue/v0/media/' + QID )
		.done( ( result ) => {
			if (
				!result ||
				( !result.media && !result.links )
			) {
				context.commit( 'SET_REQUEST_STATUS', {
					type: 'media',
					status: context.state.requestStatuses.done
				} );
				return;
			}

			if (
				result.media &&
				result.media.query &&
				result.media.query.pages &&
				Object.keys( result.media.query.pages ).length > 0
			) {
				const mediaInfo = formatMediaInfo( result.media, page, context );
				context.commit( 'SET_MEDIA', mediaInfo );
			}

			if ( result.links && Object.keys( result.links ).length > 0 ) {
				context.commit( 'SET_LINKS', result.links );
			}

			context.commit( 'SET_REQUEST_STATUS', {
				type: 'media',
				status: context.state.requestStatuses.done
			} );
		} )
		.catch( () => {
			context.commit( 'SET_MEDIA' );
			context.commit( 'SET_LINKS' );

			context.commit( 'SET_REQUEST_STATUS', {
				type: 'media',
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
 * @param {number} selectedIndex
 */
const retrieveInfoFromQuery = ( context, title, selectedIndex ) => {

	context.commit( 'SET_REQUEST_STATUS', {
		type: 'query',
		status: context.state.requestStatuses.inProgress
	} );

	// We need to do fetch the current result manually
	// because the selected result index has not been changed yet.
	const currentSelectedResult = context.state.results[ selectedIndex ];
	const encodedTitle = encodeURIComponent( title );
	const encodedSnippetField = encodeURIComponent( currentSelectedResult.snippetField );
	restApi
		.get(
			'/searchvue/v0/page/' + encodedTitle + '/' + encodedSnippetField
		)
		.done( ( result ) => {
			if ( !result ) {

				context.commit( 'SET_REQUEST_STATUS', {
					type: 'query',
					status: context.state.requestStatuses.done
				} );
				return;
			}

			let thumbnail = null;
			if ( result.thumbnail ) {
				thumbnail = result.thumbnail;
			}
			setThumbnail( thumbnail, result.pageimage || '', context );
			setMediaInfo( result, context );
			setArticleSections( result, context );
			const snippetObject = generateExpandedSnippet( result, context, currentSelectedResult );
			context.commit( 'SET_EXPANDED_SNIPPET', snippetObject.expandedSnippet );
			setDescription( result, context, snippetObject.isBeginningOfText );

			context.commit( 'SET_REQUEST_STATUS', {
				type: 'query',
				status: context.state.requestStatuses.done
			} );
		} )
		.catch( () => {
			context.commit( 'SET_THUMBNAIL' );
			context.commit( 'SET_MEDIA' );
			context.commit( 'SET_DESCRIPTION' );
			context.commit( 'SET_SECTIONS' );
			context.commit( 'SET_LINKS' );
			context.commit( 'SET_EXPANDED_SNIPPET' );

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
			const dataTitleSelector = `[data-prefixedtext="${title}"]`;
			// phpcs:enable Squiz.WhiteSpace.OperatorSpacing.NoSpaceBefore,Squiz.WhiteSpace.OperatorSpacing.NoSpaceAfter
			if ( force ) {
				destination = title ? dataTitleSelector : false;
				context.commit( 'SET_NEXT_TITLE', null );
			} else if ( !context.state.title ) {
				destination = dataTitleSelector;
			} else if ( context.state.title && context.state.title !== title ) {
				context.commit( 'SET_NEXT_TITLE', title );
				context.commit( 'SET_COMPONENT_READY', false );
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
			let thumbnail = null;
			if ( context.state.results[ selectedTitleIndex ] && context.state.results[ selectedTitleIndex ].thumbnail ) {
				thumbnail = context.state.results[ selectedTitleIndex ].thumbnail;
			}
			setThumbnail( thumbnail, '', context );
			retrieveInfoFromQuery( context, newTitle, selectedTitleIndex );
			context.commit( 'SET_TITLE', newTitle );
			context.commit( 'SET_COMPONENT_READY', true );
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
		context.commit( 'SET_MEDIA' );
		context.commit( 'SET_DESCRIPTION' );
		context.commit( 'SET_SECTIONS' );
		context.commit( 'SET_LINKS' );
		context.commit( 'SET_COMPONENT_READY' );
		removeQuickViewFromHistoryState();
		context.commit( 'RESET_REQUEST_STATUS' );
		context.commit( 'SET_EXPANDED_SNIPPET' );
		restApi.abort();
		handleClassesToggle( false );
	},
	/**
	 * Emit close event when page is closing/refreshing while QuickView is open
	 *
	 * @param {Object} context
	 * @param {Function} context.dispatch
	 */
	onPageClose: ( context ) => {
		if ( context.state.selectedIndex !== -1 ) {
			context.dispatch( 'events/logQuickViewEvent', { action: 'close-searchpreview', selectedIndex: context.state.selectedIndex }, { root: true } );
		}
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
