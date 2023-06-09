'use strict';

const Pinia = require( 'pinia' );
const useRequestStatusStore = require( './RequestStatus.js' );
const useMediaStore = require( './Media.js' );

const restApi = new mw.Rest();

const HIGHLIGHTS_REGEX = /<span class="searchmatch">(.+?)<\/span>/g;
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
 * Returns the sections array from cirrusDoc.
 *
 * @param {Object} page
 * @param {Array} page.cirrusdoc
 * @return {Array}
 */
const getArticleSections = ( page ) => {
	if ( !page || !page.cirrusdoc || page.cirrusdoc.length === 0 ) {
		return [];
	}

	const cirrusdoc = page.cirrusdoc[ 0 ];
	if ( cirrusdoc.source && cirrusdoc.source.heading ) {
		return cirrusdoc.source.heading;
	}

	return [];
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
 * Handle the addition of ellipsis to the snippet. Ellipsis are just added if the
 * snippets is not in the extremities of the text.
 * On mobile ellipsis are added just at the end of the snippet.
 *
 * @param {string} fullContent
 * @param {string} snippet
 * @param {boolean} isMobile
 * @return {string}
 */
const addEllipsisIfNeeded = ( fullContent, snippet, isMobile ) => {
	const needsPrefixEllipsis = !fullContent.startsWith( snippet ) && !isMobile;
	const needsSuffixEllipsis = !fullContent.endsWith( snippet );
	let snippetWithEllipsis = '';
	if ( needsPrefixEllipsis ) {
		snippetWithEllipsis = mw.msg( 'ellipsis' );
	}
	snippetWithEllipsis += snippet;
	if ( needsSuffixEllipsis ) {
		snippetWithEllipsis += mw.msg( 'ellipsis' );
	}

	return snippetWithEllipsis;
};

/**
 * Given an input snippet text and a source text where the snippet is sourced from,
 * this will expand the snippet in both directions.
 *
 * @param {string} snippet
 * @param {string} fullContent
 * @param {boolean} isMobile
 * @return {string}
 */
const expandSnippet = ( snippet, fullContent, isMobile ) => {
	const SNIPPETS_EXTRA_CHARACTERS = 100;

	const startSnippetsIndex = fullContent.indexOf( snippet );

	// We calculate the expanding snippet by calculating the expected index value
	// Note: on top of SNIPPETS_EXTRA_CHARACTERS, we're fetching 1 additional character on both
	// sides to help us figure out whether the first/last characters are word boundaries
	// On Mobile we just expand the end of the snippet
	const expandedSnippetStartIndex = isMobile ?
		startSnippetsIndex :
		Math.max( 0, startSnippetsIndex - SNIPPETS_EXTRA_CHARACTERS - 1 );
	const expandedSnippetEndIndex = startSnippetsIndex + snippet.length + SNIPPETS_EXTRA_CHARACTERS + 1;
	let expandedSnippet = fullContent.slice(
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
	expandedSnippet = addEllipsisIfNeeded( fullContent, expandedSnippet, isMobile );

	return expandedSnippet;
};

/**
 * Handles the expansion of the snippets. The snippet expansion follow specitic rules
 * (such as the snippets position in the text and current user device).
 *
 * @param {Object} page
 * @param {Object} currentResult
 * @param {boolean} isMobile
 * @return {Object}
 */
const generateExpandedSnippet = ( page, currentResult, isMobile ) => {
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
			if ( element.indexOf( snippet ) !== -1 ) {
				cirrusFieldContent = element;
				break;
			}
		}
	} else {
		cirrusFieldContent = cirrusFieldValue;
	}

	if (
		!cirrusFieldContent ||
		cirrusFieldContent.indexOf( snippet ) === -1
	) {
		// Snippets is empty or cannot be found. Do no change anything†
		return {
			expandedSnippet: null
		};
	}

	// We just attempt to expand if the two string are different
	let expandedSnippet = ( cirrusFieldContent !== snippet ) ?
		expandSnippet( snippet, cirrusFieldContent, isMobile ) :
		snippet;
	// we remove the ellippsis that are at the end of the expanded snippets before comparing
	const isBeginningOfText = cirrusFieldContent.startsWith( expandedSnippet.slice( 0, -3 ) );

	// We add back the styling that is required to bold the highlighted text
	const highlights = extractHighlightsFromSnippet( currentResult.text );
	highlights.forEach( ( highlight ) => {
		// We assume separators to be Punctuation, Separators or others
		// We are not able to use the word bound '/W' as it does not work properly
		// with languages including non-ascii characters.
		// https://javascript.info/regexp-unicode#unicode-properties-p
		const separators = '[\\p{P}\\p{Z}\\p{C}]';

		// phpcs:disable
		const regexFormatHighlight = new RegExp( `(^|${separators})(${highlight})($|${separators})`, 'giu' );
		// phpcs:enable
		expandedSnippet = expandedSnippet.replace(
			regexFormatHighlight,
			'$1<span class="searchmatch">$2</span>$3'
		);
	} );

	return {
		expandedSnippet: expandedSnippet,
		isBeginningOfText: isBeginningOfText && cirrusField === 'text'
	};
};

/**
 * handled the modification of the main text snippets shown in the search result page.
 *
 * @param {string} title
 * @param {string} snippet
 * @param {boolean} isMobile
 */
const updateMainSearchResultSnippets = ( title, snippet, isMobile ) => {
	if ( !title || !snippet || !isMobile ) {
		return;
	}

	const selector = '[data-prefixedtext="' + title + '"] .searchresult';

	// Edge case in which the search result has no text within it (empty page)
	if ( document.querySelector( selector ) ) {
		document.querySelector( selector ).innerHTML = snippet;
	}
};

/**
 * Restore the main text snippets to its original value.
 *
 * @param {Object} currentResult
 * @param {boolean} isMobile
 */
const restoreMainSearchResultSnippets = ( currentResult, isMobile ) => {
	if ( !currentResult ) {
		return;
	}
	// The original snippet does not have ellipsis at the end of it
	const snippet = currentResult.text + mw.msg( 'ellipsis' );
	updateMainSearchResultSnippets( currentResult.prefixedText, snippet, isMobile );
};

/**
 * Set thumbnail in the store using the result object provided
 *
 * @param {Object} page
 * @param {boolean} snippetIsBeginningOfText
 * @param {boolean} isMobile
 * @return {string}
 */
const getDescription = ( page, snippetIsBeginningOfText, isMobile ) => {
	if (
		page.pageprops &&
		page.pageprops[ 'wikibase-shortdesc' ]
	) {
		return page.pageprops[ 'wikibase-shortdesc' ];
	} else if (
		page.terms &&
		page.terms.description &&
		page.terms.description[ 0 ]
	) {
		return page.terms.description[ 0 ];

	// In the absence of wikidata description, we show the beginning of the text
	// as long as it is not also the snippets. This just apply to desktop
	} else if (
		!isMobile &&
		!snippetIsBeginningOfText &&
		page.extract &&
		page.extract[ '*' ]
	) {
		return page.extract[ '*' ];
	} else {
		return '';
	}
};

/**
 * Set thumbnail in the store using the result object provided
 *
 * @param {Object|undefined} thumbnail
 * @param {string} alt
 * @return {Object|undefined}
 */
const getThumbnail = ( thumbnail, alt ) => {
	if ( !thumbnail ) {
		return;
	}

	const clone = Object.assign( {}, thumbnail );
	if ( alt ) {
		clone.alt = alt;
	}

	return clone;
};

const useQueryStore = Pinia.defineStore( 'query', {
	state: () => ( {
		thumbnail: null,
		sections: [],
		description: null,
		expandedSnippet: null
	} ),
	getters: {
	},
	actions: {
		/**
		 * Fetch article information from the API. This method is going to update the aricle thumbnail
		 * and initialize a follow up request to fetch commons information for the article.
		 *
		 * @param {string} title
		 * @param {number} selectedIndex
		 * @param {Array} results
		 * @param {boolean} isMobile
		 */
		retrieveInfoFromQuery( title, selectedIndex, results, isMobile ) {

			if ( results.length === 0 || selectedIndex === -1 || !title ) {
				return;
			}

			const requestStatusStore = useRequestStatusStore();
			const mediaStore = useMediaStore();
			requestStatusStore.setRequestStatus( {
				type: 'query',
				status: requestStatusStore.requestStatuses.inProgress
			} );
			// We need to do fetch the current result manually
			// because the selected result index has not been changed yet.
			const currentSelectedResult = results[ selectedIndex ];
			const encodedTitle = encodeURIComponent( title );
			const snippetField = getFieldFromSnippetField( currentSelectedResult.snippetField );
			const encodedSnippetField = encodeURIComponent( snippetField );

			restApi
				.get(
					'/searchvue/v0/page/' + encodedTitle + '/' + encodedSnippetField
				)
				.done( ( result ) => {
					if ( !result ) {
						requestStatusStore.setRequestStatus( {
							type: 'query',
							status: requestStatusStore.requestStatuses.done
						} );
						return;
					}

					const thumbnail = getThumbnail( result.thumbnail, result.pageimage || '' );
					mediaStore.setMediaInfo( result, isMobile );
					const sections = getArticleSections( result );
					const snippetObject = generateExpandedSnippet( result, currentSelectedResult, isMobile );
					updateMainSearchResultSnippets( title, snippetObject.expandedSnippet, isMobile );
					const description = getDescription( result, snippetObject.isBeginningOfText, isMobile );

					this.$patch( {
						thumbnail: thumbnail,
						description: description,
						expandedSnippet: snippetObject.expandedSnippet,
						sections: sections
					} );

					requestStatusStore.setRequestStatus( {
						type: 'query',
						status: requestStatusStore.requestStatuses.done
					} );
				} )
				.catch( () => {
					this.reset();
					requestStatusStore.setRequestStatus( {
						type: 'query',
						status: requestStatusStore.requestStatuses.error
					} );
				} );
		},
		reset( currentResult, isMobile ) {
			restoreMainSearchResultSnippets( currentResult, isMobile );
			this.$reset();
		},
		abort() {
			restApi.abort();
		}
	}
} );

module.exports = useQueryStore;
