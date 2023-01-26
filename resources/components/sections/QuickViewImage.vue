<template>
	<div
		class="QuickViewImage"
		:style="dynamicSizingStyles"
	>
		<image-with-loading-background
			:key="source"
			:src="source"
			:alt="alt"
			class="QuickViewImage__container"
			:aspectratio="Math.max( minAspectRatio, width / height )"
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
	data() {
		return {
			minAspectRatio: 0.85
		};
	},
	computed: {
		dynamicSizingStyles() {
			return {
				'--imageWidth': this.isMobile ? 'auto' : '100%',
				'--imageHeight': this.isMobile ? '100%' : 'auto'
			};
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
	width: var( --imageWidth );
	height: var( --imageHeight );
	margin-bottom: 10px;
	overflow: hidden;
	background-color: @colorGray15;

	&__container {
		width: var( --imageWidth );
		height: var( --imageHeight );
	}

	img {
		width: auto;
		height: auto;
	}
}
</style>
