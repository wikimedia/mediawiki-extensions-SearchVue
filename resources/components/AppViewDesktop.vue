<template>
	<quick-view
		v-if="visible"
		class="mw-app-view-desktop"
		:style="quickViewDynamicStyles"
		@close="$emit( 'close', $event )"
	>
		<template #loading-icon="{ loading }">
			<loading-dots
				:loading="loading"
			></loading-dots>
		</template>
		<template #loading-skeleton="{ show }">
			<content-skeleton
				v-show="show"
				:lines="4"
			></content-skeleton>
			<content-skeleton
				v-show="show"
			></content-skeleton>
		</template>
	</quick-view>
</template>

<script>

const QuickView = require( './sections/QuickView.vue' ),
	ContentSkeleton = require( './generic/ContentSkeleton.vue' ),
	mapActions = require( 'pinia' ).mapActions,
	mapState = require( 'pinia' ).mapState,
	LoadingDots = require( './generic/LoadingDots.vue' ),
	onDocumentScroll = require( '../composables/onDocumentScroll.js' ),
	onResizeObserver = require( '../composables/onResizeObserver.js' ),
	onDocumentResize = require( '../composables/onDocumentResize.js' ),
	useRootStore = require( '../stores/Root.js' );

// @vue/component
module.exports = exports = {
	name: 'SearchVue',
	components: {
		'quick-view': QuickView,
		'loading-dots': LoadingDots,
		'content-skeleton': ContentSkeleton
	},
	setup() {
		const { scrollY } = onDocumentScroll();
		const { elementWidth } = onResizeObserver( document.querySelector( '#bodyContent' ) );
		const { width } = onDocumentResize();

		return {
			scrollY: scrollY,
			elementWidth: elementWidth,
			width: width
		};
	},
	data: function () {
		return {
			pageContainer: document.querySelector( '#bodyContent' ),
			searchContainer: document.querySelector( '.searchresults' ),
			pageScrolled: false
		};
	},
	computed: $.extend(
		{
			isLargeScreen() {
				return this.width >= this.breakpoints.small;
			},
			columnWidth() {
				if ( this.width <= this.breakpoints.small ) {
					return 0;
				}
				return this.elementWidth / 12;
			},
			dynamicTop() {
				if ( this.pageScrolled ) {
					return 12;
				} else {
					let pageContainerOffset = 0;

					// Page container could be null while navigating away from the page
					if ( this.pageContainer ) {
						// Due to the position absolute of the heading we cannot use offsetTop
						pageContainerOffset =
							this.pageContainer.getBoundingClientRect().top + window.scrollY;
					}
					return pageContainerOffset + 50;
				}
			},
			dynamicBottom() {
				// extend downward until either bottom of the search results,
				// or bottom of the screen; whichever is smaller
				const scrollBottom = this.scrollY + window.innerHeight;

				// SearchContainer could be null while navigating away from the page
				const searchResultBottom = this.searchContainer ?
					this.searchContainer.getBoundingClientRect().bottom :
					0;
				const searchContainerBottom = window.scrollY + searchResultBottom;

				return Math.max( 12, scrollBottom - searchContainerBottom );
			},
			dynamicRightMargin() {
				let rightMargin = 0;
				if ( this.width <= this.breakpoints.small ) {
					return rightMargin;
				}
				// Page container could be null while navigating away from the page
				const pageConteinerRight = this.pageContainer ?
					this.pageContainer.getBoundingClientRect().right :
					0;
				// we calculate the main container margin
				rightMargin = this.width - pageConteinerRight;

				if ( this.width >= this.breakpoints.large ) {
					// We then set margin to be 1 column + container margin
					rightMargin += this.columnWidth;
				}

				return rightMargin;
			},
			dynamicWidth() {
				let numberOfColumn = 4;
				if ( this.width <= this.breakpoints.large ) {
					numberOfColumn = 5;
				}

				// We remove a few pixels (50) from the QuickView width
				// this is done to show the arrow from the searchResult
				return ( this.columnWidth * numberOfColumn ) - 50;
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
		mapState( useRootStore, [
			'breakpoints',
			'visible'
		] )
	),
	methods: $.extend(
		{
			numberToPixel( value ) {
				return `${value}px`;
			}
		},
		mapActions( useRootStore, [
			'closeQuickView'
		] )
	),
	watch: {
		scrollY: {
			handler( scrollValue ) {
				if ( this.isMobile ) {
					return;
				}

				// we apply a specific class to reduce the position top if the page is scrolled
				if ( this.pageContainer && this.pageContainer.offsetTop >= scrollValue ) {
					this.pageScrolled = false;
				} else {
					this.pageScrolled = true;
				}
			},
			immediate: true
		},
		isLargeScreen( newValue ) {
			const isSmallScreen = !newValue;
			if ( isSmallScreen && this.title ) {
				this.closeQuickView();
			}
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';
@import '../styles/SearchVue-result-hover.less';

.mw-app-view-desktop {
	position: fixed;
	border: @border-subtle;
	right: 0;
	width: var( --dynamicWidth );
	display: inline-block;
	margin-right: var( --dynamicMarginRight );
	top: var( --dynamicTop );
	bottom: var( --dynamicBottom );
	transition: top 0.2s;
	overflow: auto;

	& > div {
		margin: 0 auto 32px;
		padding: 0 16px;
	}

	// we normalise the P tag by removing margin added by vector
	p {
		margin: 0;
	}
}
</style>
