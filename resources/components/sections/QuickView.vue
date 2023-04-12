<template>
	<!-- eslint-disable -->
	<div
		@click.stop
		class="mw-search-quick-view"
		:class="{
			'mw-search-quick-view__mobile': isMobile,
		}"
	>
		<nav
			v-if="!isMobile"
			class="mw-search-quick-view__nav"
		>
			<button @click="$emit( 'close', $event )">
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
		<header :class="
			{
				'mw-search-quick-view__no-thumb': hideThumb
			}"
		>
			<quick-view-image
				v-if="currentResult.thumbnail"
				v-bind="currentResult.thumbnail"
				:is-mobile="isMobile"
				@close="closeQuickView"
				@log-event="onLogEvent"
			></quick-view-image>
		</header>
		<template v-if="requestStatus.query === requestStatuses.inProgress" >
			<content-skeleton></content-skeleton>
			<content-skeleton :lines="4"></content-skeleton>
		</template>
		<template v-if="requestStatus.query === requestStatuses.done" >
			<quick-view-description
				v-if="showDescription"
				:title="currentResult.prefixedText"
				:description="currentResult.description"
				:is-mobile="isMobile"
				@log-event="onLogEvent"
			></quick-view-description>
			<quick-view-snippet
				v-if="!isMobile"
				:text="textWithEllipsis"
				:title="currentResult.prefixedText"
				@log-event="onLogEvent"
			></quick-view-snippet>
			<quick-view-sections
				v-if="hasSections"
				:title="currentResult.prefixedText"
				:sections="currentResult.sections"
				@log-event="onLogEvent"
				:is-mobile="isMobile"
			></quick-view-sections>
		    <quick-view-links
			    v-if="hasLinks && isMobile"
			    :links="currentResult.links"
			    :is-mobile="isMobile"
			    @log-event="onLogEvent"
            ></quick-view-links>
		</template>
		<quick-view-commons
			v-if="hasCommonsImages"
			v-bind="currentResult.media"
			@log-event="onLogEvent"
		></quick-view-commons>
		<quick-view-links
			v-if="hasLinks && !isMobile"
			:links="currentResult.links"
			:is-mobile="isMobile"
			@log-event="onLogEvent"
		></quick-view-links>
		<slot
			name="loading-icon"
			:loading="loading"
		>
		</slot>
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
	QuickViewLinks = require( './QuickViewLinks.vue' ),
	ContentSkeleton = require( '../generic/ContentSkeleton.vue' ),
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
		'quick-view-links': QuickViewLinks,
		'content-skeleton': ContentSkeleton
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
				return this.currentResult.media &&
					this.currentResult.media.images &&
					this.currentResult.media.images.length > 0;
			},
			hasSections() {
				return this.currentResult.sections && this.currentResult.sections.length > 0;
			},
			hasLinks() {
				return this.currentResult.links &&
					Object.keys( this.currentResult.links ).length > 0;
			},
			textWithEllipsis() {

				if ( !this.currentResult.text ) {
					return '';
				} else if ( this.currentResult.expandedSnippet ) {
					return this.currentResult.expandedSnippet;
				} else {
					return this.currentResult.text + this.$i18n( 'ellipsis' ).text();
				}
			},
			hideThumb() {
				return !this.currentResult.thumbnail && this.isMobile;
			},
			showDescription() {
				if ( this.isMobile ) {
					// On mobile we just show this section if the description is set
					return !!this.currentResult.description;
				} else {
					// On desktop we show it even just with title
					return !!this.currentResult.prefixedText;
				}
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
@import '../../../lib/mediawiki-ui-base.less';

.mw-search-quick-view {
	background-color: @wmui-color-base100;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Lato', 'Helvetica', 'Arial', sans-serif;

	&__mobile {
		padding-right: 8px;
	}

	&__nav {
		position: absolute;
		left: 0;
		right: 0;
		width: 100%;
		display: flex;
		justify-content: flex-start;
		z-index: 10;

		button {
			padding: 12px;
			padding-inline-start: 12px;
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

	&__no-thumb {
		min-width: 0;

		& + div {
			margin-left: 0;
		}
	}
}
</style>
