<template>
	<div
		class="quickViewDescription"
		:class="{
			// eslint-disable-next-line vue/camelcase
			quickViewDescription__mobile: isMobile,
			'quickViewDescription--small-font': showSmallFont
		}"
	>
		<h2 v-if="!isMobile">
			<a
				:href="url"
				@click.prevent="onClick"
			>
				{{ title }}
			</a>
		</h2>
		<p v-if="description" ref="paragraph-container">
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
		},
		isMobile: {
			type: Boolean,
			required: true
		}
	},
	emits: [
		'log-event'
	],
	data() {
		return {
			showSmallFont: false
		};
	},
	computed: {
		url() {
			const title = new mw.Title( this.title );
			return title.getUrl();
		}
	},
	methods: {
		textHasOverflow() {
			const textContainer = this.$refs[ 'paragraph-container' ];

			return textContainer && textContainer.scrollHeight > textContainer.clientHeight;
		},
		defineFontSizeAndOverflow() {
			const textHasOverflow = this.textHasOverflow();
			if ( textHasOverflow ) {
				// If text overflowing we reduce the font
				this.showSmallFont = true;
			}
		},
		onClick() {
			this.$emit(
				'log-event',
				{
					action: 'click-snippet',
					goTo: this.url
				} );
		}
	},
	mounted() {
		if ( this.isMobile ) {
			this.defineFontSizeAndOverflow();
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.quickViewDescription {
	h2 {
		font-family: inherit;
		font-size: 1.14285em;
		border: none;
		margin: 0;
	}

	&__mobile {
		width: 174px;
		flex-shrink: 0;

		p {
			height: 144px;
			font-size: 1.14285em;
			line-height: 1.6em;
			overflow: hidden;
			display: -webkit-box;
			-webkit-line-clamp: 8;
			-webkit-box-orient: vertical;
		}
	}

	&--small-font p {
		font-size: 1em;
		line-height: 1.285em;
	}
}
</style>
