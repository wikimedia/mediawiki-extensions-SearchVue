<template>
	<Teleport
		v-if="destination"
		:to="destination">
		<Transition
			:css="isMobile"
			@after-leave="() => toggleVisibily( {
				title: nextTitle,
				element: currentElement( nextTitle ),
				force: true
			} )"
			@after-enter="scrollScreenOnMobile">
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
		</Transition>
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
	mapState = require( 'vuex' ).mapState;

// @vue/component
module.exports = exports = {
	name: 'SearchVue',
	components: {
		'quick-view': QuickView
	},
	data: function () {
		return {
			offsetTop: null,
			queryQuickViewTitle: null
		};
	},
	computed: $.extend( {},
		mapState( [
			'isMobile',
			'title',
			'visible',
			'nextTitle',
			'destination'
		] )
	),
	methods: $.extend( {},
		mapActions( [
			'toggleVisibily',
			'closeQuickView',
			'onPageClose'
		] ),
		mapActions( 'events', [ 'setSearchResultPosition', 'setQuickViewEventProps' ] ),
		{
			setQueryQuickViewTitle: function () {
				const mwUri = new mw.Uri();
				if ( mwUri.query.quickView ) {
					this.queryQuickViewTitle = mwUri.query.quickView;
				}
			},
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
				return this.getSearchResults().find( `[title='${title}']` ).closest( 'li' )[ 0 ];
			},
			scrollScreenOnMobile: function () {
				if ( !this.isMobile ) {
					return;
				}
				const currentElement = this.currentElement( this.title );

				const docViewBottom = $( window ).scrollTop() + $( window ).height();
				const elemBottom = $( currentElement ).offset().top + $( currentElement ).height();

				if ( elemBottom >= docViewBottom ) {
					this.currentElement( this.title ).scrollIntoView( { behavior: 'smooth' } );
				}
			},
			isEnabled: function () {
				let enable = !this.isMobile;
				if ( ( new mw.Uri() ).query.quickViewEnableMobile !== undefined ) {
					// casting with parseInt instead of Boolean to also consider
					// a (string) '0' as off
					enable = enable || parseInt( ( new mw.Uri() ).query.quickViewEnableMobile );
				} else {
					enable = enable || mw.config.get( 'wgQuickViewEnableMobile' );
				}
				return enable;
			},
			leaving() {
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
					const currentElement = this.currentElement( title );
					this.calculateOffsetTop( currentElement );
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
		if ( !this.isEnabled() ) {
			return;
		}

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
				this.toggleVisibily( { title: resultTitle, element: currentElement } );
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
@import '../styles/Search-result-hover.less';
@import '../styles/Search-result-mobile.less';

.mw-search-quick-view {
	background-color: #fff;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Lato', 'Helvetica', 'Arial', sans-serif;

	&__desktop {
		position: absolute;
		border: solid 1px #c8ccd1;
		right: 0;
		width: 30em;
		display: inline-block;
	}

	&__mobile {
		z-index: 1000;
		width: 100%;
		display: flex;
		overflow: auto;
		height: 174px;
		overflow-y: hidden;
		margin: 0;
		top: 0;

		& > * {
			min-width: 300px;
		}

		& > div {
			margin-left: 8px;
			border-radius: 2px;
			border: 1px solid #c8ccd1;
			margin-bottom: 0;
		}
	}
	// we normalise the P tag by removing margin added by vector
	p {
		margin: 0;
	}
}

// Vue transition classes.
.v-enter-active,
.v-leave-active {
	transition: height 0.3s ease;
}

.v-enter-from,
.v-leave-to {
	height: 0;
}
</style>
