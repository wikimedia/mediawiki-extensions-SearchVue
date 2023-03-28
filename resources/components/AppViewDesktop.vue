<template>
	<quick-view
		v-if="visible"
		class="mw-app-view-desktop"
		@close="$emit('close', $event)"
		:style="quickViewDynamicStyles"
	>
		<template #loading-icon="{ loading }">
			<loading-dots
				:loading="loading"
			></loading-dots>
		</template>
	</quick-view>
</template>

<script>

const QuickView = require( './sections/QuickView.vue' ),
	mapActions = require( 'vuex' ).mapActions,
	mapState = require( 'vuex' ).mapState,
	mapGetters = require( 'vuex' ).mapGetters,
	LoadingDots = require( './generic/LoadingDots.vue' ),
	onDocumentScroll = require( '../composables/onDocumentScroll.js' ),
	onResizeObserver = require( '../composables/onResizeObserver.js' ),
	onDocumentResize = require( '../composables/onDocumentResize.js' );

// @vue/component
module.exports = exports = {
	name: 'SearchVue',
	components: {
		'quick-view': QuickView,
		'loading-dots': LoadingDots
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
					return this.pageContainer.offsetTop + 50;
				}
			},
			dynamicBottom() {
				// extend downward until either bottom of the search results,
				// or bottom of the screen; whichever is smaller
				const scrollBottom = this.scrollY + window.innerHeight;
				const searchContainerBottom = window.scrollY +
					this.searchContainer.getBoundingClientRect().bottom;

				return Math.max( 12, scrollBottom - searchContainerBottom );
			},
			dynamicRightMargin() {
				let rightMargin = 0;
				if ( this.width <= this.breakpoints.small ) {
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
		mapState( [
			'breakpoints'
		] ),
		mapGetters( [
			'visible'
		] )
	),
	methods: $.extend(
		{
			numberToPixel( value ) {
				return `${value}px`;
			}
		},
		mapActions( [
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
				if ( this.pageContainer.offsetTop >= scrollValue ) {
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
@import '../styles/SearchVue-result-hover.less';
@import '../../lib/mediawiki-ui-base.less';

.mw-app-view-desktop {
	position: fixed;
	border: solid 1px @wmui-color-base70;
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
