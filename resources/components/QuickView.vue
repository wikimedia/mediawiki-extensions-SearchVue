<template>
	<!-- eslint-disable -->
	<div class="mw-search-quick-view">
		<header>
			<lead-image></lead-image>
		</header>
		<lead-text></lead-text>
	</div>
</template>

<script>
/**
 * @file SpecialSearchQuickView.vue
 *
 * Placeholder
 */
var LeadImage = require( './LeadImage.vue' ),
	LeadText = require( './LeadText.vue' );

// @vue/component
module.exports = exports = {
	name: 'SpecialSearchQuickView',
	components: {
		'lead-image': LeadImage,
		'lead-text': LeadText
	},
	data: function () {
		return {};
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.mw-search-quick-view {
    display: block;
    border: solid 1px #c8CCd1;
    margin: 10px;
    max-width: 30em;
    position: absolute;
    right: 0px;
    background: white;
}
</style>
