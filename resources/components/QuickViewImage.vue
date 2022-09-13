<template>
	<div
		class="QuickViewImage"
		:class="{ 'QuickViewImage--portrait': isPortrait }"
	>
		<button @click="$emit( 'close' )">
			<svg
				width="30"
				height="30"
				viewBox="0 0 30 30"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>
					{{ $i18n( 'quickview-close' ).text() }}
				</title>
				<circle
					cx="15"
					cy="15"
					r="15"
					fill="white"
				/>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M16.4122 14.998L22.7762 8.634L21.3622 7.22L14.9982 13.584L8.63621 7.222L7.22221 8.636L13.5842 14.998L7.22021 21.362L8.63421 22.776L14.9982 16.412L21.3642 22.778L22.7782 21.364L16.4122 14.998Z"
					fill="#202122"
				/>
			</svg>
		</button>
		<img
			:src="source"
			:alt="altText"
		>
	</div>
</template>

<script>
/**
 * @file LeadImage.vue
 *
 * Placeholder
 */

// @vue/component
module.exports = exports = {
	name: 'QuickViewImage',
	props: {
		source: {
			type: Object,
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
		altText: {
			type: String,
			required: false,
			default: null
		}
	},
	computed: {
		isPortrait() {
			return ( this.height > this.width );
		}
	}
};

</script>

<style lang="less">
.QuickViewImage {
	position: relative;
	width: 100%;
	max-height: 268px;
	margin-bottom: 10px;
	overflow: hidden;

	&--portrait {
		height: 100%;
		max-height: 486px;
	}

	img {
		width: 100%;
		height: auto;
	}

	button {
		position: absolute;
		top: 12px;
		left: 12px;
		background: none;
		border: none;
		cursor: pointer;

		svg {
			fill: #fff;
		}
	}
}
</style>
