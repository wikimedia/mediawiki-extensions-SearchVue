<template>
	<Teleport :to="destination">
		<quick-view
			v-if="visible"
			class="mw-search-quick-view"
			:class="{
				'mw-search-quick-view__mobile': isMobile,
				'mw-search-quick-view__desktop': !isMobile
			}"
			:style="{ top: offsetTop }"
		>
		</quick-view>
	</Teleport>
</template>

<script>
/**
 * @file App.vue
 *
 * Placeholder
 */
const QuickView = require( './sections/QuickView.vue' ),
	mapActions = require( 'vuex' ).mapActions,
	mapState = require( 'vuex' ).mapState,
	mapGetters = require( 'vuex' ).mapGetters;

// @vue/component
module.exports = exports = {
	name: 'SearchVue',
	components: {
		'quick-view': QuickView
	},
	data: function () {
		return {
			offsetTop: null
		};
	},
	computed: $.extend( {},
		mapGetters( [
			'visible'
		] ),
		mapState( [
			'isMobile'
		] ),
		{
			destination: function () {
				if ( this.isMobile ) {
					return '#content';
				} else {
					return '.searchresults';
				}
			}
		}
	),
	methods: $.extend( {},
		mapActions( [
			'handleTitleChange',
			'closeQuickView'
		] ),
		{
			calculateOffsetTop: function ( element ) {
				// TODO: Improve calculation of the QuickView after improvement of the search page
				if ( !this.isMobile ) {
					// Set the correct offset to align with the search results
					this.offsetTop = ( element.offsetTop || 0 ) + 'px';
				}
			},
			restoreQuickViewOnNavigation() {
				const mwUri = new mw.Uri();

				const queryHasQuickView = !!mwUri.query.quickView;

				if ( queryHasQuickView ) {
					const title = mwUri.query.quickView;
					this.handleTitleChange( title );
				}
			},
			listenToMainBodyResize() {
				const mainBodyElement = document.getElementById( 'bodyContent' );
				const resizeObserver = new ResizeObserver( () => {
					const firstResult = document.querySelector( '#mw-content-text .mw-search-result' );
					this.calculateOffsetTop( firstResult );
				} );
				resizeObserver.observe( mainBodyElement );
			}
		}
	),
	mounted: function () {
		// eslint-disable-next-line no-jquery/no-global-selector
		const searchResults = $( '#mw-content-text .mw-search-result' );
		for ( const searchResult of searchResults ) {
			searchResult.classList.add( 'searchresult-with-quickview' );
		}
		searchResults.find( '.searchresult, .mw-search-result-data' ).click( function ( event ) {
			const searchResultLink = event.currentTarget.parentElement.getElementsByTagName( 'a' )[ 0 ];

			if ( searchResultLink.hasAttribute( 'title' ) ) {
				const firstElement = searchResults[ 0 ].parentElement;
				event.stopPropagation();
				const resultTitle = searchResultLink.getAttribute( 'title' );
				if ( !this.isMobile ) {
					firstElement.scrollIntoView( { behavior: 'smooth' } );
				} else {
					const body = document.getElementsByTagName( 'body' )[ 0 ];
					body.scrollIntoView( { behavior: 'smooth' } );
				}
				this.handleTitleChange( resultTitle );
			}
		}.bind( this ) );

		// eslint-disable-next-line no-jquery/no-global-selector
		$( 'body' ).click( function () {
			if ( !this.isMobile ) {
				this.closeQuickView();
			}
		}.bind( this ) );

		// Restore the quick view in the case in which the user has navigated back to a page
		// that had a quickView open
		this.restoreQuickViewOnNavigation();
		this.listenToMainBodyResize();
	}
};
</script>

<style lang="less">
@import '../styles/Search-result-hover.less';

.mw-search-quick-view {

	position: absolute;
	background-color: white;
	font-family: -apple-system, 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Lato', 'Helvetica', 'Arial', sans-serif;

	&__desktop {
		border: solid 1px #c8CCd1;
		right: 0px;
		width: 30em;
		display: inline-block;
	}

	&__mobile {
		z-index: 1000;
		width: 100%;
		height: 100%;
		margin: 0;
		top: 0;
	}

	// we normalise the P tag by removing margin added by vector
	p {
		margin: 0;
	}
}
</style>
