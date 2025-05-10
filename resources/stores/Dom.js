'use strict';

const Pinia = require( 'pinia' );

const useDomStore = Pinia.defineStore( 'dom', {
	state: () => ( {
		container: '.mw-search-quick-view',
		focusableElements: null,
		pageContainer: document.querySelector( '#bodyContent' ),
		searchContainer: document.querySelector( '.searchresults' ),
		// eslint-disable-next-line no-jquery/no-global-selector
		searchResults: $( '#mw-content-text .mw-search-result-ns-0' )
			.not( '#mw-content-text .mw-search-interwiki-results .mw-search-result-ns-0' )
	} ),
	getters: {
		firstFocusableElement( state ) {
			if ( state.focusableElements && state.focusableElements.length > 0 ) {
				return state.focusableElements[ 0 ];
			}
		},
		lastFocusableElement( state ) {
			if ( state.focusableElements && state.focusableElements.length > 0 ) {
				return state.focusableElements[ state.focusableElements.length - 1 ];
			}
		},
		currentSelectedResults( state ) {
			return ( title ) => {
				if ( title ) {
					return state.searchResults.find( `[data-prefixedtext="${ title }"]` ).closest( 'li' )[ 0 ];
				}
			};
		}
	},
	actions: {
		/**
		 * This method trigger an updae on the tabbable elements on the main dialog.
		 * This is used to ensure the mousetrap is handled correctly
		 */
		updateTabbableElements() {
			// We make sure the element is actually visible.
			// This may be due to different loading practices on mobile
			// or due to client quick interaction with the preview
			const containerElement = document.querySelector( this.container );
			if ( !containerElement || !containerElement.querySelectorAll ) {
				return;
			}
			this.focusableElements = containerElement.querySelectorAll(
				'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
			);
		},
		/**
		 * Assign the focus on the search preview dialog.
		 */
		focusDialog() {
			// This ensure that the focus is just triggered if the element is visible
			// On mobile loading is different and this may not always be the case
			const containerElement = document.querySelector( this.container );
			if ( containerElement &&
				containerElement.focus &&
				typeof containerElement.focus === 'function'
			) {
				containerElement.focus();
			}
		},
		/**
		 * This method ensure the focus-trap for users navigating the preview using the keyboard
		 *
		 * @param {Event} event
		 * @param {HTMLElement} activeElement
		 */
		handleTabTrap( event, activeElement ) {
			// Make sure search preview is selected and all variable are correct
			if (
				event.key === 'Tab' &&
				this.lastFocusableElement &&
				this.firstFocusableElement
			) {
				// If it is the last element, move focus back to the first
				if ( !event.shiftKey && activeElement === this.lastFocusableElement ) {
					this.firstFocusableElement.focus();
					event.preventDefault();
				}

				// If it is the first element and going backward, go back to the last element
				if ( event.shiftKey && activeElement === this.firstFocusableElement ) {
					this.lastFocusableElement.focus();
					event.preventDefault();
				}

			}
		},
		/**
		 * Handle the addition and removal of classes to the body and other element to define
		 * when the Search Preview is open. This classes are used to apply specific CSS properties.
		 *
		 * @param {string} title
		 */
		handleClassesToggle( title ) {
			if ( title ) {
				document.getElementsByTagName( 'body' )[ 0 ].classList.add( 'search-preview-open' );
				this.currentSelectedResults( title ).classList.add( 'searchresult-with-quickview--open' );
			} else {
				document.getElementsByTagName( 'body' )[ 0 ].classList.remove( 'search-preview-open' );
				const openElement = document.getElementsByClassName( 'searchresult-with-quickview--open' )[ 0 ];
				if ( openElement ) {
					openElement.classList.remove( 'searchresult-with-quickview--open' );
				}
			}
		},
		/**
		 * Moves the focus to the main search result element. This action is usually triggered after
		 * the search view container is closed using keyboard navigation.
		 *
		 * @param {string} title
		 */
		focusCurrentResult( title ) {
			this.currentSelectedResults( title ).querySelector( '.quickView-aria-button' ).focus();
		},
		/**
		 * handled the modification of the main text snippets shown in the search result page.
		 *
		 * @param {string} title
		 * @param {string} snippet
		 * @param {boolean} isMobile
		 */
		updateMainSearchResultSnippets: ( title, snippet, isMobile ) => {
			if ( !title || !snippet || !isMobile ) {
				return;
			}

			const selector = '[data-prefixedtext="' + title + '"] .searchresult';

			// Edge case in which the search result has no text within it (empty page)
			if ( document.querySelector( selector ) ) {
				document.querySelector( selector ).innerHTML = snippet;
			}
		},
		generateAndInsertAriaButton( container, ariaLabel ) {
			const ariaButton = document.createElement( 'BUTTON' );
			ariaButton.type = 'button';
			ariaButton.classList.add( 'quickView-aria-button' );
			ariaButton.ariaLabel = ariaLabel;
			container.insertBefore( ariaButton, null );
		}
	}
} );

module.exports = useDomStore;
