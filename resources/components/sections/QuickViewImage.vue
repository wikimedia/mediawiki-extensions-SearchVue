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
			required: true
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
@import 'mediawiki.ui/variables.less';

.QuickViewImage {
	position: relative;
	margin-bottom: 10px;
	overflow: hidden;
	background-color: @colorGray15;

	&__mobile {
		margin-bottom: 0;
	}
}
</style>
