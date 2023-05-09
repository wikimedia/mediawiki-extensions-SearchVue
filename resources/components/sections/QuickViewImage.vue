<template>
	<div
		class="QuickViewImage"
		:class="{
			QuickViewImage__mobile: isMobile
		}"
	>
		<image-with-loading-background
			:key="source"
			:src="source"
			:alt="alt"
			class="QuickViewImage__container"
			:aspectratio="aspectRatio"
			:height-constraints=" isMobile ? 172 : null"
			@image-click="onImageClick"
		></image-with-loading-background>
	</div>
</template>

<script>
/**
 * @file QuickViewImage.vue
 * Placeholder
 */
const ImageWithLoadingBackground = require( '../generic/ImageWithLoadingBackground.vue' );

// @vue/component
module.exports = exports = {
	name: 'QuickViewImage',
	components: {
		'image-with-loading-background': ImageWithLoadingBackground
	},
	props: {
		source: {
			type: String,
			required: false,
			default: null
		},
		height: {
			type: Number,
			required: true
		},
		width: {
			type: Number,
			required: true
		},
		alt: {
			type: String,
			required: false,
			default: null
		},
		isMobile: {
			type: Boolean,
			require: true
		}
	},
	computed: {
		aspectRatio() {
			return Math.max( 0.85, this.width / this.height );
		}
	},
	methods: {
		onImageClick() {
			this.$emit( 'log-event', { action: 'click-image' } );
		}
	}
};

</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.QuickViewImage {
	position: relative;
	margin-bottom: 10px;
	overflow: hidden;
	// TODO: Remove this when we have an equivalent design token in near-future Codex release
	// via skin variables. See T334790.
	background-color: #f8f9fa;

	&__mobile {
		margin-bottom: 0;
	}
}
</style>
