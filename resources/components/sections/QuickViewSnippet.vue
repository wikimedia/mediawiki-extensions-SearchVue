<template>
	<div class="quickViewSnippet">
		<!-- eslint-disable vue/no-v-html -->
		<p v-html="text"></p>
		<a :href="url" @click.prevent="onClick">{{ gotoFullPageText }}</a>
	</div>
</template>

<script>
/**
 * @file QuickViewSnippet.vue
 *
 * Placeholder
 */

// @vue/component
module.exports = exports = {
	name: 'QuickViewSnippet',
	compatConfig: { MODE: 3 },
	compilerOptions: { whitespace: 'condense' },
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
	emits: [
		'log-event'
	],
	computed: {
		url() {
			const title = new mw.Title( this.title );
			return title.getUrl();
		},
		gotoFullPageText() {
			const namespace = new mw.Title( this.title ).getNamespaceId();
			return this.$i18n( 'searchvue-snippet-gotofullpage-ns' + namespace ).exists() ?
				this.$i18n( 'searchvue-snippet-gotofullpage-ns' + namespace ).text() :
				this.$i18n( 'searchvue-snippet-gotofullpage' ).text();
		}
	},
	methods: {
		onClick() {
			this.$emit(
				'log-event',
				{
					action: 'click-snippet',
					goTo: this.url
				} );
		}
	}
};
</script>
