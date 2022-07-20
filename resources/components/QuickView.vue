<template>
	<!-- eslint-disable -->
	<div @click.stop>
		<nav v-if="isMobile" class="mw-search-quick-view__mobile_nav">
			<button @click="closeQuickView">← Back to search</button>
			<button>＜</button>
			<button>＞</button>
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
			'closeQuickView'
		] )
	)
};
</script>

<style lang="less">
.mw-search-quick-view__mobile_nav {
	display: flex;
	justify-content: flex-end;

	button:first-child {
		// This is required to display the first button on the far left
		margin-right: auto;
	}
}
</style>
