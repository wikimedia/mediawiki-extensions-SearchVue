<template>
	<Teleport
		v-if="destination"
		:to="destination">
		<p
			v-if="( !showOnMobile && !loading && visible )"
			class="mw-app-view-mobile__info-text"
		>
			{{ $i18n( 'searchvue-no-content' ).text() }}
		</p>
		<quick-view
			v-else-if="visible"
			v-bind="$attrs"
			:transitioning="transitioning"
			class="mw-app-view-mobile"
			@close="$emit( 'close', $event )"
		>
			<template #loading-icon="{ loading }">
				<div
					v-if="loading"
					v-spinner
					class="mw-app-view-mobile__loading-block"
				></div>
			</template>
			<template #loading-skeleton="{ show }">
				<Transition
					@leave="transitioning = true"
					@after-leave="transitioning = false"
				>
					<content-skeleton
						v-show="show"
						:lines="4"
					></content-skeleton>
				</Transition>
			</template>
		</quick-view>
	</Teleport>
</template>

<script>
const QuickView = require( './sections/QuickView.vue' ),
	spinner = require( '../directives/spinner.js' ),
	ContentSkeleton = require( './generic/ContentSkeleton.vue' ),
	mapState = require( 'pinia' ).mapState,
	useRootStore = require( '../stores/Root.js' ),
	useRequestStatusStore = require( '../stores/RequestStatus.js' );

// @vue/component
module.exports = exports = {
	name: 'SearchVue',
	compatConfig: { MODE: 3 },
	compilerOptions: { whitespace: 'condense' },
	directives: {
		spinner
	},
	components: {
		'quick-view': QuickView,
		'content-skeleton': ContentSkeleton
	},
	inheritAttrs: false,
	data() {
		return {
			transitioning: false
		};
	},
	computed: Object.assign(
		{},
		mapState( useRootStore, [
			'destination',
			'visible',
			'showOnMobile'
		] ),
		mapState( useRequestStatusStore, [
			'loading'
		] )
	)
};
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';
@import '../styles/SearchVue-result-mobile.less';

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
		border-radius: @border-radius-base;
		border: @border-subtle;
		padding: 12px;
	}

	&__info-text {
		position: relative;
		margin: 0;
		color: @color-subtle;

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
// skeleton animation
.v-enter-active,
.v-leave-active {
	transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>
