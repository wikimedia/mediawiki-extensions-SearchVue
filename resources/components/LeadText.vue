<template>
	<p>{{ title }}</p>
</template>

<script>
/**
 * @file LeadText.vue
 *
 * Placeholder
 */
const mapState = require( 'vuex' ).mapState;

// @vue/component
module.exports = exports = {
	name: 'LeadImage',
	computed: $.extend( {},
		mapState( [
			'title'
		] )
	)
};
</script>
