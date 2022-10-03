<template>
	<div
		class="ImageWithLoadingBackground"
		:class="{ 'ImageWithLoadingBackground__loading': !loaded }"
		:style="aspectratio !== null ? { 'aspect-ratio': aspectratio } : null"
	>
		<img
			:src="src"
			:alt="alt"
			@load="onLoad"
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
		}
	},
	data() {
		return {
			loaded: false
		};
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

	&__loading {
		background-color: #F8F9FA;

		img {
			visibility: hidden;
		}
	}

	img {
		object-fit: cover;
		max-height: 100%;
		min-width: inherit;
		flex: 1;
	}
}
</style>
