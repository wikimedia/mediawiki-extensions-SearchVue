<template>
	<div
		class="quickViewDescription"
		:class="{
			'quickViewDescription__mobile': isMobile,
			'quickViewDescription--small-font': showSmallFont
		}"
	>
		<template v-if="!isMobile">
			<h2>
				<a
					:href="url"
					@click.prevent="onClick"
				>
					{{ title }}
				</a>
			</h2>
			<p v-if="description">
				{{ description }}
			</p>
		</template>
		<template v-else>
			<p ref="paragraph-container">
				{{ mobileDescription }}
			</p>
		</template>
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
	data() {
		return {
			showSmallFont: false,
			removeTitleOnMobile: false
		};
	},
	computed: {
		url() {
			const title = new mw.Title( this.title );
			return title.getUrl();
		},
		mobileDescription() {
			if ( this.removeTitleOnMobile ) {
				return this.description;
			} else {
				return mw.message( 'searchvue-description-mobile', this.title, this.description );
			}
		}
	},
	methods: {
		textHasOverflow() {
			const textContainer = this.$refs[ 'paragraph-container' ];

			return textContainer && textContainer.scrollHeight > textContainer.clientHeight;
		},
		defineFontSizeAndOverflow() {
			let textHasOverflow = this.textHasOverflow();
			if ( textHasOverflow ) {
				// If text overflowing we reduce the font
				this.showSmallFont = true;
				this.$nextTick( function () {
					// If small font is still overflowing, we remove the title
					textHasOverflow = this.textHasOverflow();
					if ( textHasOverflow ) {
						this.removeTitleOnMobile = true;
					}
				} );
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
		this.defineFontSizeAndOverflow();
	}
};
</script>

<style lang="less">
@import 'mediawiki.ui/variables.less';

.quickViewDescription {
	h2 {
		font-family: inherit;
		font-size: 1.14285em;
		border: none;
		margin: 0;
	}

	&__mobile {
		min-width: 174px;

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
