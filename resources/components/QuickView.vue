<template>
	<!-- eslint-disable -->
	<div @click.stop>
		<nav v-if="isMobile" class="mw-search-quick-view__mobile_nav">
			<button @click="closeQuickView">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
					<title>
						{{ $i18n( 'quickview-close' ).text()  }}
					</title>
					<path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm5.66 14.24-1.41 1.41L10 11.41l-4.24 4.25-1.42-1.42L8.59 10 4.34 5.76l1.42-1.42L10 8.59l4.24-4.24 1.41 1.41L11.41 10z"/>
				</svg>
			</button>
			<button @click="navigate( 'previous' )">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<title>
						{{ $i18n( 'quickview-previous' ).text()  }}
					</title>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M9.75 0L0.75 9L9.75 18L11.25 16.5L3.75 9L11.25 1.5L9.75 0Z" fill="#202122"/>
				</svg>
			</button>
			<button @click="navigate( 'next' )">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<title>
						{{ $i18n( 'quickview-next' ).text()  }}
					</title>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M6.25 1L4.75 2.5L12.249 10L4.75 17.5L6.25 19L15.25 10L6.25 1Z" fill="#202122"/>
				</svg>
			</button>
		</nav>
		<header>
			<lead-image></lead-image>
		</header>
		<lead-text></lead-text>
	</div>
</template>

<script>
/**
 * @file QuickView.vue
 *
 * Placeholder
 */
const LeadImage = require( './LeadImage.vue' ),
	LeadText = require( './LeadText.vue' ),
	mapActions = require( 'vuex' ).mapActions,
	mapState = require( 'vuex' ).mapState;

// @vue/component
module.exports = exports = {
	name: 'QuickView',
	components: {
		'lead-image': LeadImage,
		'lead-text': LeadText
	},
	data: function () {
		return {};
	},
	computed: $.extend( {},
		mapState( [
			'isMobile'
		] )
	),
	methods: $.extend( {},
		mapActions( [
			'closeQuickView',
			'navigate'
		] )
	)
};
</script>

<style lang="less">
.mw-search-quick-view__mobile_nav {
	display: flex;
	justify-content: flex-end;
	height: 48px;
	box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.1), inset 0px -1px 0px #C8CCD1;

	button {
		padding: 14px;
	}

	button:first-child {
		// This is required to display the first button on the far left
		margin-right: auto;
	}
}
</style>
