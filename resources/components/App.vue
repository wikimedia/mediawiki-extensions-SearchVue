<template>
	<Teleport :to="destination">
		<quick-view
			v-if="visible"
			ref="quick-view"
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
			'isMobile',
			'title'
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

					this.$nextTick()
						.then(
							() => {
								// Set the correct offset to align with the search results
								const bottomOfElement = element.offsetHeight + element.offsetTop;
								const quickViewheight = this.$refs[ 'quick-view' ].$el.offsetHeight;
								const offsetTop = bottomOfElement - quickViewheight;
								this.offsetTop = Math.max( offsetTop, 0 ) + 'px';
							}
						);
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
			getSearchResults() {
				// eslint-disable-next-line no-jquery/no-global-selector
				return $( '#mw-content-text .mw-search-result-ns-0' )
					.not( '#mw-content-text .mw-search-interwiki-results .mw-search-result-ns-0' );
			},
			listenToMainBodyResize() {
				const mainBodyElement = document.getElementById( 'bodyContent' );
				const resizeObserver = new ResizeObserver( () => {
					const firstResult = document.querySelector( '#mw-content-text .mw-search-result' );
					this.calculateOffsetTop( firstResult );
				} );
				resizeObserver.observe( mainBodyElement );
			},
			isEnabled() {
				let enable = !this.isMobile;
				if ( ( new mw.Uri() ).query.quickViewEnableMobile !== undefined ) {
					// casting with parseInt instead of Boolean to also consider
					// a (string) '0' as off
					enable = enable || parseInt( ( new mw.Uri() ).query.quickViewEnableMobile );
				} else {
					enable = enable || mw.config.get( 'wgQuickViewEnableMobile' );
				}
				return enable;
			}
		}
	),
	watch: {
		visible: {
			handler( visible ) {
				if ( visible ) {
					const currentElement = this.getSearchResults().find( `[title=${this.title}]` ).closest( 'li' )[ 0 ];
					this.calculateOffsetTop( currentElement );
				}
			},
			flush: 'post'
		}
	},
	mounted: function () {
		if ( !this.isEnabled() ) {
			return;
		}
		const searchResults = this.getSearchResults();
		for ( const searchResult of searchResults ) {
			searchResult.classList.add( 'searchresult-with-quickview' );
		}
		searchResults.find( '.searchresult, .mw-search-result-data' ).click( function ( event ) {
			const searchResultLink = event.currentTarget.parentElement.getElementsByTagName( 'a' )[ 0 ];

			if ( searchResultLink.hasAttribute( 'title' ) ) {
				event.stopPropagation();
				const resultTitle = searchResultLink.getAttribute( 'title' );
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
