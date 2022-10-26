<template>
	<!-- eslint-disable -->
	<div @click.stop>
		<nav 
			v-if="!isMobile"
			class="mw-search-quick-view__nav"
		>
			<button @click="closeQuickView">
				<svg
					width="30"
					height="30"
					viewBox="0 0 30 30"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>
						{{ $i18n( 'searchvue-close' ).text() }}
					</title>
					<circle
						cx="15"
						cy="15"
						r="15"
						fill="white"
					/>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M16.4122 14.998L22.7762 8.634L21.3622 7.22L14.9982 13.584L8.63621 7.222L7.22221 8.636L13.5842 14.998L7.22021 21.362L8.63421 22.776L14.9982 16.412L21.3642 22.778L22.7782 21.364L16.4122 14.998Z"
						fill="#202122"
					/>
				</svg>
			</button>
		</nav>
		<header>
			<quick-view-image
				v-if="currentResult.thumbnail"
				v-bind="currentResult.thumbnail"
				@close="closeQuickView"
				@log-event="onLogEvent"
			></quick-view-image>
		</header>
		<template v-if="requestStatus.query === requestStatuses.inProgress" >
			<content-skeleton></content-skeleton>
			<content-skeleton :lines="4"></content-skeleton>
		</template>
		<template v-else-if="requestStatus.query === requestStatuses.done" >
			<quick-view-description
				:title="currentResult.prefixedText"
				:description="currentResult.description"
			></quick-view-description>
			<quick-view-snippet
				:text="textWithEllipsis"
				:title="currentResult.prefixedText"
				@log-event="onLogEvent"
			></quick-view-snippet>
			<quick-view-sections
				v-if="hasSections"
				:title="currentResult.prefixedText"
				:sections="currentResult.sections"
				@log-event="onLogEvent"
			></quick-view-sections>
		</template>
		<quick-view-commons
			v-if="hasCommonsImages"
			v-bind="currentResult.commons"
			@log-event="onLogEvent"
		></quick-view-commons>
		<loading-dots :loading="loading" />
	</div>
</template>

<script>
/**
 * @file QuickView.vue
 *
 * Placeholder
 */
const QuickViewImage = require( './QuickViewImage.vue' ),
	QuickViewDescription = require( './QuickViewDescription.vue' ),
	QuickViewSnippet = require( './QuickViewSnippet.vue' ),
	QuickViewSections = require( './QuickViewSections.vue' ),
	QuickViewCommons = require( './QuickViewCommons.vue' ),
	ContentSkeleton = require( '../generic/ContentSkeleton.vue' ),
	LoadingDots = require( '../generic/LoadingDots.vue' ),
	mapActions = require( 'vuex' ).mapActions,
	mapGetters = require( 'vuex' ).mapGetters,
	mapState = require( 'vuex' ).mapState;

// @vue/component
module.exports = exports = {
	name: 'QuickView',
	components: {
		'quick-view-image': QuickViewImage,
		'quick-view-description': QuickViewDescription,
		'quick-view-snippet': QuickViewSnippet,
		'quick-view-sections': QuickViewSections,
		'quick-view-commons': QuickViewCommons,
		'content-skeleton': ContentSkeleton,
		'loading-dots': LoadingDots
	},
	data: function () {
		return {};
	},
	computed: $.extend( {},
		mapState( [
			'isMobile',
			'requestStatus',
			'requestStatuses',
			'selectedIndex'
		] ),
		mapGetters( [
			'currentResult',
			'loading'
		] ),
		{
			hasCommonsImages() {
				return this.currentResult.commons &&
					this.currentResult.commons.images &&
					this.currentResult.commons.images.length > 0;
			},
			hasSections() {
				return this.currentResult.sections && this.currentResult.sections.length > 0;
			},
			textWithEllipsis() {
				return this.currentResult.text + this.$i18n( 'ellipsis' ).text();
			}
		}
	),
	methods: $.extend(
		{
			onLogEvent( { action, goTo } ) {
				this.logQuickViewEvent( {
					action: action,
					selectedIndex: this.selectedIndex
				} ).then( function () {
					if ( goTo ) {
						window.location.href = goTo;
					}
				} );
			}
		},
		mapActions( [
			'closeQuickView',
			'navigate'
		] ),
		mapActions( 'events', [ 'logQuickViewEvent' ] )
	)
};
</script>

<style lang="less">
.mw-search-quick-view {
	&__nav {
		position: absolute;
		left: 0;
		right: 0;
		width: 100%;
		display: flex;
		justify-content: flex-start;
		z-index: 10;

		button {
			padding: 14px;
			padding-inline-start: 20px;
			background-color: transparent;
			border: none;
			cursor: pointer;

			svg {
				fill: #fff;
			}
		}
	}

	header {
		padding-bottom: 20px;
		min-height: 32px;
	}

}
</style>
