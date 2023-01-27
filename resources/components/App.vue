<template>
	<component
		:is="quickViewComponent"
		role="dialog"
		tabindex="-1"
		:title="$i18n( 'searchvue-dialog-title' ).text()"
		:aria-label="$i18n( 'searchvue-dialog-aria-label' ).text()"
		@close="closeAndFocus"
		class="mw-search-quick-view"
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
	mapActions = require( 'vuex' ).mapActions,
	mapGetters = require( 'vuex' ).mapGetters,
	mapState = require( 'vuex' ).mapState;

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
		mapState( [
			'isMobile',
			'title'
		] ),
		mapGetters( [
			'showOnMobile',
			'loading'
		] )
	),
	methods: $.extend( {},
		mapActions( [
			'toggleVisibily',
			'closeQuickView',
			'onPageClose'
		] ),
		mapActions( 'events', [ 'initEventLoggingSession' ] ),
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
						element: currentElement,
						force: true
					} );
				}
			},
			getSearchResults() {
				// eslint-disable-next-line no-jquery/no-global-selector
				return $( '#mw-content-text .mw-search-result-ns-0' )
					.not( '#mw-content-text .mw-search-interwiki-results .mw-search-result-ns-0' );
			},
			currentElement: function ( title ) {
				return this.getSearchResults().find( `[title="${title}"]` ).closest( 'li' )[ 0 ];
			},
			leaving() {
				this.handleEventTimeout( true );
				// Emit QuickView closing event only if QuickView is present in url
				if ( this.queryQuickViewTitle ) {
					this.onPageClose();
				}
			},
			generateAndInsertAriaButton( container ) {
				const ariaButton = document.createElement( 'BUTTON' );
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

				if ( searchResultLink.hasAttribute( 'title' ) ) {
					event.stopPropagation();
					const resultTitle = searchResultLink.getAttribute( 'title' );
					const currentElement = this.currentElement( resultTitle );
					const payload = { title: resultTitle, element: currentElement };

					// If the previous result did not have enough data to be shown
					// (showOnMobile = false) Then we have to force toggleVisibility.
					// Because the transition effect is not going to be called.
					if ( this.isMobile ) {
						payload.force = !this.showOnMobile;
					}

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

			// This is a failsafe to just add the search preview in result that have a body
			if ( searchResultLi.querySelector( '.searchresult' ) ) {
				searchResultLi.classList.add( 'searchresult-with-quickview' );
				const title = searchResultLi.querySelector( '.mw-search-result-heading a' ).getAttribute( 'title' );
				searchResultLi.dataset.title = title;

				const searchResultContainer = searchResultLi.querySelector( '.mw-search-result-heading' ).parentElement;
				this.generateAndInsertAriaButton( searchResultContainer );
			}
		}

		const searchResultWithQuickView = searchResults.filter( function ( resultIndex ) {
			return searchResults[ resultIndex ].classList.contains( 'searchresult-with-quickview' );
		} );
		// Mouse click
		searchResultWithQuickView.find( '.searchresult, .mw-search-result-data' )
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
		$( 'body' ).click( function () {
			if ( !this.isMobile ) {
				this.closeQuickView();
			}
		}.bind( this ) );

		this.setQueryQuickViewTitle();

		// Restore the quick view in the case in which the user has navigated back to a page
		// that had a quickView open
		this.restoreQuickViewOnNavigation();

		window.addEventListener( 'keydown', function ( event ) {
			if ( event.key === 'Escape' ) {
				this.closeAndFocus( event );
			}
			if ( event.key === 'Tab' ) {
				this.handleTabTrap( event );
			}

		}.bind( this ) );
	}
};
</script>

<style lang="less">
@import '../../lib/mediawiki-ui-base.less';

.mw-search-quick-view {
	background-color: @wmui-color-base100;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Lato', 'Helvetica', 'Arial', sans-serif;
}

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
