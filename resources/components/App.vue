<template>
	<component
		:is="quickViewComponent"
		role="dialog"
		tabindex="-1"
		:title="$i18n( 'searchvue-dialog-title' ).text()"
		:aria-label="$i18n( 'searchvue-dialog-aria-label' ).text()"
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
			queryQuickViewTitle: null
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
			}
		},
		mapState( [
			'isMobile',
			'title'
		] ),
		mapGetters( [
			'showOnMobile'
		] )
	),
	methods: $.extend( {},
		mapActions( [
			'toggleVisibily',
			'closeQuickView',
			'onPageClose'
		] ),
		mapActions( 'events', [ 'setQuickViewEventProps' ] ),
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
			closeOnEscapeAndFocus( event ) {
				if ( event.key === 'Escape' && this.title ) {
					this.currentElement( this.title ).querySelector( '.quickView-aria-button' ).focus();
					this.closeQuickView();
				}
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
				this.$el.focus();
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
		}
	},
	created() {
		this.setQuickViewEventProps().then( () => {
			// This event triggers only if user interacts with the page before closing
			window.addEventListener( 'beforeunload', this.leaving );
		} );
	},
	mounted: function () {

		const searchResults = this.getSearchResults();
		for ( const searchResultLi of searchResults ) {
			searchResultLi.classList.add( 'searchresult-with-quickview' );
			const title = searchResultLi.querySelector( '.mw-search-result-heading a' ).getAttribute( 'title' );
			searchResultLi.dataset.title = title;

			const searchResultContainer = searchResultLi.querySelector( '.searchresult' ).parentElement;
			this.generateAndInsertAriaButton( searchResultContainer );
		}

		// Mouse click
		searchResults.find( '.searchresult, .mw-search-result-data' ).click( function ( event ) {
			this.handleResultEvent( event );
		}.bind( this ) );

		// Keyboard navigation
		searchResults.find( '.quickView-aria-button' ).keyup( function ( event ) {
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

		window.addEventListener( 'keyup', this.closeOnEscapeAndFocus );
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
