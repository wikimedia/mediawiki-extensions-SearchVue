<template>
	<div
		class="QuickViewImage"
		:class="{
			'QuickViewImage__mobile': isMobile
		}"
		:style="dynamicSizingStyles"
	>
		<image-with-loading-background
			:key="source"
			:src="source"
			:alt="alt"
			class="QuickViewImage__container"
			:aspectratio="aspectRatio"
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
			aspectRatio: Math.max( 0.85, this.width / this.height ),
			mobileHeight: 174 // This is the height of the Search Preview in pixels
		};
	},
	computed: {
		dynamicSizingStyles() {
			let width = '100%';
			// We calculate the correct width of the image from the aspect ratio
			if ( this.isMobile ) {
				width = this.aspectRatio * this.mobileHeight + 'px';
			}

			return {
				'--imageWidth': width,
				'--imageHeight': this.isMobile ? '100%' : 'auto',
				'--aspectRatio': this.aspectRatio
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
	aspect-ratio: var( --aspectRatio );
	margin-bottom: 10px;
	overflow: hidden;
	background-color: @colorGray15;

	&__mobile {
		margin-bottom: 0;
	}

	&__container {
		width: inherit;
		height: inherit;
	}
}
</style>
