<template>
	<div
		v-if="loading"
		class="loading-dots"
	>
		<div class="loading-dots__bounce"></div>
	</div>
</template>

<script>
// @vue/component
module.exports = exports = {
	name: 'LoadingDots',
	props: {
		loading: {
			type: Boolean
		}
	}
};

</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.loading-dots {
	// The following code has been inspired by https://codepen.io/Volker_E/pen/yqNXMe
	// Re-usable LESS project code.
	@width-bounce-dot: 0.858em;
	@margin-bounce-dot: @width-bounce-dot / 4;
	white-space: nowrap;
	display: block;
	width: 3 * @width-bounce-dot + 2 * @margin-bounce-dot;
	margin: 0 auto;

	&__bounce,
	&::before,
	&::after {
		content: '';
		background-color: @background-color-progressive;
		display: inline-block;
		width: @width-bounce-dot;
		height: @width-bounce-dot;
		border-radius: @border-radius-circle;
		animation: bounce-delay 1600ms infinite ease-in-out both;
		animation-delay: -160ms;
	}

	&::before {
		margin-right: @margin-bounce-dot;
		animation-delay: -330ms;
	}

	&::after {
		margin-left: @margin-bounce-dot;
		animation-delay: 0ms;
	}

	@keyframes bounce-delay {
		0%,
		50%,
		100% {
			transform: scale( 0.625 );
		}

		20% {
			opacity: 0.87;
			transform: scale( 1 );
		}
	}
}
</style>
