<template>
	<div class="QuickViewImage">
		<image-with-loading-background
			:src="source"
			:alt="alt"
			:aspectratio="Math.max( minAspectRatio, width / height )"
			:key="source"
		></image-with-loading-background>
	</div>
</template>

<script>
/**
 * @file QuickViewImage.vue
 *
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
		}
	},
	data() {
		return {
			minAspectRatio: 0.85
		};
	}
};

</script>

<style lang="less">
@import 'mediawiki.ui/variables.less';

.QuickViewImage {
	position: relative;
	width: 100%;
	margin-bottom: 10px;
	overflow: hidden;
	background-color: @colorGray15;

	img {
		width: 100%;
		height: auto;
	}
}
</style>
