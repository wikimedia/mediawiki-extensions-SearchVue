<template>
	<component
		:is="quickViewComponent"
		role="dialog"
		tabindex="-1"
		:title="$i18n( 'searchvue-dialog-title' ).text()"
		:aria-label="$i18n( 'searchvue-dialog-aria-label' ).text()"
		class="mw-search-quick-view"
		@close="closeAndFocus"
	>
	</component>
</template>

<script>

/**
 * @file App.vue
 *
 * Placeholder
 */
const AppViewMobile = require( './AppViewMobile.vue' ),
	AppViewDesktop = require( './AppViewDesktop.vue' ),
	mapVuexActions = require( 'vuex' ).mapActions,
	mapVuexGetters = require( 'vuex' ).mapGetters,
	mapVuexState = require( 'vuex' ).mapState,
	mapPiniaActions = require( 'pinia' ).mapActions,
	useEventStore = require( '../stores/Event.js' );

// @vue/component
module.exports = exports = {
	name: 'SearchVue',
	components: {
		'app-view-mobile': AppViewMobile,
		'app-view-desktop': AppViewDesktop
	},
	data: function () {
		return {
			queryQuickViewTitle: null,
			focusableElements: null
		};
	},
	computed: $.extend(
		{
			quickViewComponent() {
				if ( this.isMobile ) {
					return 'app-view-mobile';
				} else {
					return 'app-view-desktop';
				}
			},
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
		mapVuexState( [
			'isMobile',
			'title',
			'results'
		] ),
		mapVuexGetters( [
			'loading'
		] )
	),
	methods: $.extend( {},
		mapVuexActions( [
			'toggleVisibily',
			'closeQuickView',
			'onPageClose'
		] ),
		mapPiniaActions( useEventStore, [ 'initEventLoggingSession' ] ),
		{
			setQueryQuickViewTitle: function () {
				const mwUri = new mw.Uri();
				if ( mwUri.query.quickView ) {
					this.queryQuickViewTitle = mwUri.query.quickView;
				}
			},
			restoreQuickViewOnNavigation() {
				if ( this.queryQuickViewTitle ) {
					const currentElement = this.currentElement( this.queryQuickViewTitle );
					this.toggleVisibily( {
						title: this.queryQuickViewTitle,
						element: currentElement
					} );
				}
			},
			getSearchResults() {
				// eslint-disable-next-line no-jquery/no-global-selector
				return $( '#mw-content-text .mw-search-result-ns-0' )
					.not( '#mw-content-text .mw-search-interwiki-results .mw-search-result-ns-0' );
			},
			currentElement: function ( title ) {
				return this.getSearchResults().find( `[data-prefixedtext="${title}"]` ).closest( 'li' )[ 0 ];
			},
			leaving() {
				// Emit QuickView closing event only if QuickView is present in url
				if ( this.queryQuickViewTitle ) {
					this.onPageClose();
				}
			},
			generateAndInsertAriaButton( container ) {
				const ariaButton = document.createElement( 'BUTTON' );
				ariaButton.type = 'button';
				ariaButton.classList.add( 'quickView-aria-button' );
				ariaButton.ariaLabel = this.$i18n( 'searchvue-aria-button' ).text();
				container.insertBefore( ariaButton, null );
			},
			closeAndFocus( event ) {
				if ( !this.title ) {
					return;
				}

				// event.detail will be equal to 0 if triggered by keyboard
				if ( event.detail === 0 ) {
					this.currentElement( this.title ).querySelector( '.quickView-aria-button' ).focus();
				}
				this.closeQuickView();
			},
			handleResultEvent( event ) {
				const searchResultLink = event.currentTarget.parentElement.getElementsByTagName( 'a' )[ 0 ];

				if ( searchResultLink.hasAttribute( 'data-prefixedtext' ) ) {
					event.stopPropagation();
					const resultTitle = searchResultLink.getAttribute( 'data-prefixedtext' );
					const currentElement = this.currentElement( resultTitle );
					const payload = { title: resultTitle, element: currentElement };
					this.toggleVisibily( payload );
				}
			},
			focusDialog() {
				// This ensure that the focus is just triggered if the element is visible
				// On mobile loading is different and this may not always be the case
				if ( this.$el &&
					this.$el.focus &&
					typeof this.$el.focus === 'function'
				) {
					this.$el.focus();
				}
			},
			defineFocusableElements() {

				// We make sure the element is actually visible.
				// This may be due to different loading practices on mobile
				// or due to client quick interaction with the preview
				if ( !this.$el || !this.$el.querySelectorAll ) {
					return;
				}

				return this.$el.querySelectorAll(
					'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
				);

			},
			handleTabTrap( event ) {
				const activeElement = document.activeElement;

				// Make sure search preview is selected and all variable are correct
				if (
					this.title &&
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
			resultHasInfoToDisplay( prefixedText ) {
				const result = this.results.find( ( item ) => {
					return item.prefixedText === prefixedText;
				} );
				return result && ( result.text || result.thumbnail );
			},
			multimediaViewerIsOpen() {
				if ( mw.mmv && mw.mmv.viewer && !mw.mmv.viewer.isOpen ) {
					return false;
				}
				return true;
			}
		}
	),
	watch: {
		title: {
			handler( title ) {
				if ( title ) {
					this.setQueryQuickViewTitle();
				}
			},
			flush: 'post'
		},
		loading: {
			handler( loading ) {
				// We re-calculate the tabbable element everytime the loading is complete.
				if ( !loading ) {
					this.focusableElements = this.defineFocusableElements();
				}
			},
			flush: 'post'
		}
	},
	created() {
		this.initEventLoggingSession();
		// This event triggers only if user interacts with the page before closing
		window.addEventListener( 'beforeunload', this.leaving );
	},
	mounted: function () {

		const searchResults = this.getSearchResults();
		for ( const searchResultLi of searchResults ) {
			const searchResult = searchResultLi.querySelector( '.mw-search-result-heading' );

			// Search Result will ne undefined if an user would type in the searchbox quickly
			// before the results are fully mapped. Quite probably triggered by a BOT.
			if ( !searchResult ) {
				return;
			}

			const prefixedText = searchResult.querySelector( 'a' ).getAttribute( 'data-prefixedtext' );

			if ( this.resultHasInfoToDisplay( prefixedText ) ) {
				searchResultLi.classList.add( 'searchresult-with-quickview' );
				searchResultLi.dataset.prefixedtext = prefixedText;

				const searchResultContainer = searchResult.parentElement;
				this.generateAndInsertAriaButton( searchResultContainer );
			}
		}

		const searchResultWithQuickView = searchResults.filter( function ( resultIndex ) {
			return searchResults[ resultIndex ].classList.contains( 'searchresult-with-quickview' );
		} );
		// Mouse click
		searchResultWithQuickView.find( '.searchresult, .mw-search-result-data, .quickView-aria-button' )
			.click( function ( event ) {
				this.handleResultEvent( event );
			}.bind( this ) );

		// Keyboard navigation
		searchResultWithQuickView.find( '.quickView-aria-button' ).keydown( function ( event ) {
			if ( event.key === 'Enter' ) {
				this.handleResultEvent( event );
				this.$nextTick( function () {
					this.focusDialog();
				} );
			}
		}.bind( this ) );

		// eslint-disable-next-line no-jquery/no-global-selector
		$( 'body' ).click( function ( event ) {
			// We make sure the click is not happening within the multimedia viewer
			// We cannot use  multimediaViewerIsOpen as it return false in this instance.
			const isInMultimediaViewer = event.target.closest( '.mw-mmv-wrapper' );
			if ( !this.isMobile && !isInMultimediaViewer ) {
				this.closeQuickView();
			}
		}.bind( this ) );

		this.setQueryQuickViewTitle();

		// Restore the quick view in the case in which the user has navigated back to a page
		// that had a quickView open
		this.restoreQuickViewOnNavigation();

		window.addEventListener( 'keydown', function ( event ) {
			if ( !this.multimediaViewerIsOpen() ) {
				if ( event.key === 'Escape' ) {
					this.closeAndFocus( event );
				}
				if ( event.key === 'Tab' ) {
					this.handleTabTrap( event );
				}
			}
		}.bind( this ) );
	}
};
</script>

<style lang="less">
// This class is used by buttons that are dynamically added after the page loads.
// These buttons are added on a part of the page that is not handled by vue (search result list)
.quickView-aria-button {
	position: absolute;
	width: 0;
	height: 100%;
	top: 0;
	right: 0;
	padding-left: 0;
	border: none;
	background: transparent;
}
</style>
