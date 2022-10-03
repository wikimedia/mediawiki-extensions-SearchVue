<template>
	<div class="QuickViewImage">
		<button @click="$emit( 'close' )">
			<svg
				width="30"
				height="30"
				viewBox="0 0 30 30"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>
					{{ $i18n( 'searchvue-close' ).text() }}
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
		<image-with-loading-background
			:src="source"
			:alt="alt"
			:aspectratio="Math.max( minAspectRatio, width / height )"
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
