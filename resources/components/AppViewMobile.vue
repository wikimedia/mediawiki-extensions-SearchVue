<template>
	<Teleport
		v-if="destination"
		:to="destination">
		<p
			v-if="!visible && loading"
			v-spinner
			class="mw-app-view-mobile__info-text"
		>
			{{ $i18n( 'searchvue-loading' ).text() }}
		</p>
		<p
			v-else-if="( !showOnMobile && visible )"
			class="mw-app-view-mobile__info-text"
		>
			{{ $i18n( 'searchvue-no-content' ).text() }}
		</p>
		<Transition
			@after-leave="() => toggleVisibily( {
				title: nextTitle,
				element: currentElement( nextTitle ),
				force: true
			} )">
			<quick-view
				v-if="visible && showOnMobile"
				ref="quick-view"
				class="mw-app-view-mobile"
			>
				<template #loading-icon="{ loading }">
					<div
						v-if="loading"
						v-spinner
						class="mw-app-view-mobile__loading-block"
					></div>
				</template>
			</quick-view>
		</Transition>
	</Teleport>
</template>

<script>
const mapGetters = require( 'vuex' ).mapGetters;

const QuickView = require( './sections/QuickView.vue' ),
	spinner = require( '../directives/spinner.js' ),
	mapActions = require( 'vuex' ).mapActions,
	mapState = require( 'vuex' ).mapState;

// @vue/component
module.exports = exports = {
	name: 'SearchVue',
	directives: {
		spinner
	},
	components: {
		'quick-view': QuickView
	},
	computed: $.extend(
		{},
		mapState( [
			'title',
			'nextTitle',
			'destination'
		] ),
		mapGetters( [
			'visible',
			'loading',
			'showOnMobile'
		] )
	),
	methods: $.extend( {},
		mapActions( [
			'toggleVisibily'
		] ),
		{
			getSearchResults() {
				// eslint-disable-next-line no-jquery/no-global-selector
				return $( '#mw-content-text .mw-search-result-ns-0' )
					.not( '#mw-content-text .mw-search-interwiki-results .mw-search-result-ns-0' );
			},
			currentElement: function ( title ) {
				return this.getSearchResults().find( `[data-prefixedtext="${title}"]` ).closest( 'li' )[ 0 ];
			}
		}
	)
};
</script>

<style lang="less">
@import '../styles/SearchVue-result-mobile.less';
@import '../../lib/mediawiki-ui-base.less';

.mw-app-view-mobile {
	z-index: 1000;
	display: flex;
	overflow: auto;
	height: 174px;
	overflow-y: hidden;
	margin: 8px 0 20px;
	top: 0;
	font-size: 0.875em;
	line-height: 1.6em;

	& > div {
		margin-left: 8px;
		margin-bottom: 0;
		border-radius: 2px;
		border: 1px solid @wmui-color-base70;
		padding: 12px;
	}

	&__info-text {
		position: relative;
		margin: 0;
		color: @wmui-color-base30;

		// we set some spacing between text and loading icon
		& .mw-spinner {
			margin-left: 12px;
		}
	}

	& &__loading-block {
		height: 100%;
		display: flex;
		align-items: center;
		border: none;
	}

	// we normalise the P tag by removing margin added by vector
	p {
		margin: 0;
	}
}

// Vue transition classes.
.v-enter-active {
	transition: height 0.3s ease;

	&.mw-app-view-mobile {
		visibility: hidden;
	}
}

.v-leave-active {
	transition: height 0.1s ease;

	&.mw-app-view-mobile {
		visibility: hidden;
	}
}

.v-enter-from,
.v-leave-to {
	height: 0;

	&.mw-app-view-mobile {
		visibility: hidden;
	}
}
</style>
