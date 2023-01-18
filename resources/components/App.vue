<template>
	<component
		:is="quickViewComponent"
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
		this.initEventLoggingSession();
		// This event triggers only if user interacts with the page before closing
		window.addEventListener( 'beforeunload', this.leaving );
	},
	mounted: function () {

		const searchResults = this.getSearchResults();
		for ( const searchResult of searchResults ) {
			searchResult.classList.add( 'searchresult-with-quickview' );
			const title = searchResult.querySelector( '.mw-search-result-heading a' ).getAttribute( 'title' );
			searchResult.dataset.title = title;
		}
		searchResults.find( '.searchresult, .mw-search-result-data' ).click( function ( event ) {
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
	}
};
</script>

<style lang="less">
@import '../../lib/mediawiki-ui-base.less';

.mw-search-quick-view {
	background-color: @wmui-color-base100;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Lato', 'Helvetica', 'Arial', sans-serif;
}
</style>
