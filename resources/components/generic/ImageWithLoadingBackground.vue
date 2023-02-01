<template>
	<div
		ref="image-container"
		class="ImageWithLoadingBackground"
		:class="{ 'ImageWithLoadingBackground__loading': !loaded }"
		:style="inlineStyles"
	>
		<img
			:src="src"
			:alt="alt"
			:style="inlineStyles"
			@load="onLoad"
			@click="$emit('image-click')"
		>
	</div>
</template>

<script>
/**
 * @file ImageWithLoadingBackground.vue
 *
 * Placeholder
 */

// @vue/component
module.exports = exports = {
	name: 'ImageWithLoadingBackground',
	props: {
		src: {
			type: String,
			required: true
		},
		alt: {
			type: String,
			required: false,
			default: null
		},
		aspectratio: {
			type: Number,
			required: false,
			default: null
		},
		heightConstraints: {
			type: Number,
			required: false,
			default: null
		}
	},
	data() {
		return {
			loaded: false
		};
	},
	computed: {
		inlineStyles() {
			if ( !this.aspectratio ) {
				return null;
			}
			if ( !this.heightConstraints ) {
				return {
					'--aspect-ratio': this.aspectratio,
					'--image-height': '100%',
					'--image-width': '100%'
				};
			} else {
				return {
					'--aspect-ratio': this.aspectratio,
					'--image-height': '100%',
					'--image-width': this.heightConstraints * this.aspectratio + 'px'
				};
			}
		}
	},
	methods: {
		onLoad() {
			this.loaded = true;
			this.$emit( 'load' );

		}
	}
};
</script>

<style lang="less">
.ImageWithLoadingBackground {
	display: flex;
	flex: 1;
	aspect-ratio: var( --aspect-ratio );
	width: var( --image-width );
	height: var( --image-height );

	&__loading {
		background-color: #eaecf0;
		position: relative;
		overflow: hidden;

		img {
			visibility: hidden;
		}

		&::after {
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			transform: translateX( -100% );
			background-image: linear-gradient( 90deg, rgba( 255, 255, 255, 0 ) 0, rgba( 255, 255, 255, 0.2 ) 20%, rgba( 255, 255, 255, 0.6 ) 60%, rgba( 255, 255, 255, 0 ) );
			animation: shimmer 3s infinite;
			content: '';
		}
	}

	img {
		object-fit: cover;
		max-height: 100%;
		min-width: inherit;
		max-width: ~'calc( 100vw - 50px )';
		flex: 1;
		height: inherit;
		width: inherit;
	}

	@keyframes shimmer {
		100% {
			transform: translateX( 100% );
		}
	}
}
</style>
