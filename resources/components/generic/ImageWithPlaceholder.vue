<template>
	<div
		class="ImageWithPlaceholder"
		:class="{ 'ImageWithPlaceholder__loading': !loaded }"
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
 * @file ImageWithPlaceholder.vue
 *
 * Placeholder
 */

// @vue/component
module.exports = exports = {
	name: 'ImageWithPlaceholder',
	props: {
		src: {
			type: String,
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
.ImageWithPlaceholder {
	display: flex;
	flex: 1;
	&__loading {
		background-color: #F8F9FA;
		min-width: 120px;
		height: 100px;

		&::after {
			position: absolute;
			content: url( '../../assets/icons/image-placeholder.svg' );
			width: 20px;
			height: 20px;
			top: calc( 50% - 10px );
			left: calc( 50% - 10px );
		}
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
