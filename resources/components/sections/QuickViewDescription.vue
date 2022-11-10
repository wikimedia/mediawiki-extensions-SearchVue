<template>
	<div class="quickViewDescription">
		<h2><a :href="url">{{ title }}</a></h2>
		<p v-if="description">
			{{ description }}
		</p>
	</div>
</template>

<script>
/**
 * @file quickViewDescription.vue
 *
 * Placeholder
 */

// @vue/component
module.exports = exports = {
	name: 'QuickViewDescription',
	props: {
		title: {
			type: String,
			required: true
		},
		description: {
			type: String,
			required: false,
			default: null
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

<style lang="less">
@import 'mediawiki.ui/variables.less';

.quickViewDescription{
	width: 365px;
	margin: 0 auto 20px;

	h2 {
		font-family: inherit;
		font-size: 16px;
		border: none;
		margin: 0;
	}
}
</style>
