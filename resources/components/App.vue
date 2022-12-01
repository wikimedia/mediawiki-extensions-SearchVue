<template>
	<Teleport
		v-if="destination && ( isMobile || isLargeScreen)"
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
				:style="quickViewDynamicStyles"
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
	mapState = require( 'vuex' ).mapState,
	onDocumentResize = require( '../composables/onDocumentResize.js' ),
	onDocumentScroll = require( '../composables/onDocumentScroll.js' ),
	onResizeObserver = require( '../composables/onResizeObserver.js' );

// @vue/component
module.exports = exports = {
	name: 'SearchVue',
	components: {
		'quick-view': QuickView
	},
	setup() {
		const { width } = onDocumentResize();
		const { scrollY } = onDocumentScroll();
		const { elementWidth } = onResizeObserver( document.querySelector( '#bodyContent' ) );

		return {
			width: width,
			scrollY: scrollY,
			elementWidth: elementWidth
		};
	},
	data: function () {
		return {
			offsetTop: null,
			queryQuickViewTitle: null,
			pageContainer: document.querySelector( '#bodyContent' ),
			pageScrolled: false,
			breakpoints: {
				medium: 1000,
				large: 1440
			}
		};
	},
	computed: $.extend(
		{
			isLargeScreen() {
				return this.width >= this.breakpoints.medium;
			},
			columnWidth() {
				if ( this.width <= this.breakpoints.medium ) {
					return 0;
				}
				return this.elementWidth / 12;
			},
			dynamicTop() {
				if ( this.pageScrolled ) {
					return 12;
				} else {
					return this.pageContainer.offsetTop + 50;
				}
			},
			dynamicBottom() {
				// extend downward until either bottom of the search results,
				// or bottom of the screen; whichever is smaller
				const scrollBottom = this.scrollY + window.innerHeight;
				const pageContainerBottom = this.pageContainer.offsetTop + this.pageContainer.clientHeight;
				return Math.max( 12, scrollBottom - pageContainerBottom );
			},
			dynamicRightMargin() {
				let rightMargin = 0;
				if ( this.width <= this.breakpoints.medium ) {
					return rightMargin;
				}
				// we calculate the main container margin
				rightMargin = this.width - this.pageContainer.getBoundingClientRect().right;

				if ( this.width >= this.breakpoints.large ) {
					// We then set margin to be 1 column + container margin
					rightMargin += this.columnWidth;
				}

				return rightMargin;
			},
			dynamicWidth() {
				// We set the quickview to 4 column, but shrink it a little for the arrow to display
				// by the search result
				return ( this.columnWidth * 4 ) - 50;
			},
			quickViewDynamicStyles() {
				return {
					'--dynamicTop': this.numberToPixel( this.dynamicTop ),
					'--dynamicBottom': this.numberToPixel( this.dynamicBottom ),
					'--dynamicMarginRight': this.numberToPixel( this.dynamicRightMargin ),
					'--dynamicWidth': this.numberToPixel( this.dynamicWidth )
				};
			}
		},
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
			leaving() {
				// Emit QuickView closing event only if QuickView is present in url
				if ( this.queryQuickViewTitle ) {
					this.onPageClose();
				}
			},
			numberToPixel( value ) {
				return `${value}px`;
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
		isLargeScreen( newValue ) {
			const isSmallScreen = !newValue;
			if ( isSmallScreen && this.title ) {
				this.closeQuickView();
			}
		},
		scrollY: {
			handler( scrollValue ) {
				if ( this.isMobile ) {
					return;
				}

				// we apply a specific class to reduce the position top if the page is scrolled
				if ( this.pageContainer.offsetTop >= scrollValue ) {
					this.pageScrolled = false;
				} else {
					this.pageScrolled = true;
				}
			},
			immediate: true
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
@import '../styles/SearchVue-result-hover.less';
@import '../styles/SearchVue-result-mobile.less';
@import '../../lib/mediawiki-ui-base.less';

.mw-search-quick-view {
	background-color: @wmui-color-base100;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Lato', 'Helvetica', 'Arial', sans-serif;

	&__desktop {
		position: fixed;
		border: solid 1px #c8ccd1;
		right: 0;
		width: var( --dynamicWidth );
		display: inline-block;
		margin-right: var( --dynamicMarginRight );
		top: var( --dynamicTop );
		bottom: var( --dynamicBottom );
		transition: top 0.2s;
		overflow: auto;

		& > div {
			margin: 0 auto 20px;
			padding: 0 16px;
		}
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
		font-size: 0.875em;
		line-height: 1.6em;

		& > * {
			min-width: 300px;
		}

		& > div {
			margin-left: 8px;
			margin-bottom: 0;
			border-radius: 2px;
			border: 1px solid @wmui-color-base70;
			padding: 12px;
		}
	}

	// we normalise the P tag by removing margin added by vector
	p {
		margin: 0;
	}
}

// Vue transition classes.
.v-enter-active {
	transition: height 0.3s ease;

	&.mw-search-quick-view {
		visibility: hidden;
	}
}

.v-leave-active {
	transition: height 0.1s ease;

	&.mw-search-quick-view {
		visibility: hidden;
	}
}

.v-enter-from,
.v-leave-to {
	height: 0;

	&.mw-search-quick-view {
		visibility: hidden;
	}
}
</style>
