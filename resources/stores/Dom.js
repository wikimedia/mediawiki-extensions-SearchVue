'use strict';

const Pinia = require( 'pinia' );

const useDomStore = Pinia.defineStore( 'dom', {
	state: () => ( {
		container: '.mw-search-quick-view',
		focusableElements: null
	} ),
	getters: {
		firstFocusableElement() {
			if ( this.focusableElements && this.focusableElements.length > 0 ) {
				return this.focusableElements[ 0 ];
			}
		},
		lastFocusableElement() {
			if ( this.focusableElements && this.focusableElements.length > 0 ) {
				return this.focusableElements[ this.focusableElements.length - 1 ];
			}
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
		}
	}
} );

module.exports = useDomStore;
