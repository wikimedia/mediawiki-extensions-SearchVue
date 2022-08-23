<template>
	<div class="quickViewSnippet">
		<!-- eslint-disable vue/no-v-html -->
		<p v-html="text"></p>
		<a :href="url">{{ $i18n( 'quickview-snippet-gotofullarticle' ).text() }}</a>
	</div>
</template>

<script>
/**
 * @file LeadText.vue
 *
 * Placeholder
 */

// @vue/component
module.exports = exports = {
	name: 'QuickViewSnippet',
	props: {
		title: {
			type: String,
			required: true
		},
		text: {
			type: String,
			required: true
		}
	},
	computed: {
		url() {
			const title = new mw.Title( this.title );
			return title.getUrl();
		}
	}
};
</script>

<style>
.quickViewSnippet{
	width: 365px;
	margin: 4px auto;
}
</style>
