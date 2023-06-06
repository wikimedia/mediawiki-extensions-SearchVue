<template>
	<section :class="QuickViewTutorialPopupClass">
		<div class="QuickViewTutorialPopup__triangle">
		</div>
		<div class="QuickViewTutorialPopup__heading">
			<div class="QuickViewTutorialPopup__article--icon">
			</div>
			<div class="QuickViewTutorialPopup__title">
				<h4>{{ $i18n( 'tutorial-popup-title' ).text() }}</h4>
			</div>
			<div
				class="QuickViewTutorialPopup__close--icon"
				@click="$emit( 'close' )"
			>
				<svg
					width="11"
					height="11"
					viewBox="0 0 11 11"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>
						{{ $i18n( 'tutorial-popup-close' ).text() }}
					</title>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M6.98811 5.9986L11.4429 1.5438L10.4531 0.554001L5.99831 5.0088L1.54491 0.555401L0.555111 1.5452L5.00851 5.9986L0.553711 10.4534L1.54351 11.4432L5.99831 6.9884L10.4545 11.4446L11.4443 10.4548L6.98811 5.9986Z"
						fill="#202122"
					/>
				</svg>
			</div>
		</div>
		<div class="QuickViewTutorialPopup__content">
			<template v-if="isMobile">
				<p>
					{{ $i18n( 'tutorial-popup-text-mobile' ).text() }}
				</p>
			</template>
			<template v-else>
				<p>
					{{ $i18n( 'tutorial-popup-text1' ).text() }}
				</p>
				<!-- eslint-disable vue/no-v-html -->
				<p v-html="$i18n( 'tutorial-popup-text3', url ).text()"></p>
			</template>
		</div>
	</section>
</template>

<script>
/**
 * @file QuickViewTutorialPopup.vue
 *
 * Placeholder
 */

// @vue/component
module.exports = exports = {
	name: 'QuickViewTutorialPopup',
	props: {
		url: {
			type: String,
			required: true
		},
		isMobile: {
			type: Boolean,
			required: true
		}
	},
	computed: {
		QuickViewTutorialPopupClass() {
			return this.isMobile ? 'QuickViewTutorialPopup__mobile' : 'QuickViewTutorialPopup';
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

@pulse-dot-color: @background-color-progressive;
@pulse-dot-fading: fade(@pulse-dot-color, 40%);
@pulse-dot-transparent: fade(@pulse-dot-color, 0);

.QuickViewTutorialPopup {
	left: 310px;
}

.QuickViewTutorialPopup__mobile {
	left: 0;
	right: 0;
	margin: 0 auto;

	@media ( max-width: 360px ) {
		& {
			margin-left: 8px;
		}
	}
}

.QuickViewTutorialPopup,
.QuickViewTutorialPopup__mobile {
	position: absolute;
	box-sizing: border-box;
	background: #fff;
	border: @border-base;
	border-radius: @border-radius-base;
	padding: 12px;
	width: 320px;

	&__triangle {
		top: 0;
		left: 50%;
		margin-left: -8px;
		margin-top: -16px;
		width: 0;
		height: 0;
		border-top: 8px solid transparent;
		border-bottom: 8px solid @border-color-base;
		border-right: 8px solid transparent;
		border-left: 8px solid transparent;
		position: absolute;

		&::after {
			content: '';
			width: 0;
			height: 0;
			border-top: 8px solid transparent;
			border-bottom: 8px solid #fff;
			border-right: 8px solid transparent;
			border-left: 8px solid transparent;
			position: absolute;
			top: -7px;
			left: -8px;
		}

		&::before {
			top: -8px;
			left: -6px;
			position: absolute;
			content: '';
			width: 12px;
			height: 12px;
			background: @pulse-dot-color;
			border-radius: @border-radius-circle;
			box-shadow: 0 0 0 @pulse-dot-fading;
			animation: pulse 2s infinite;
			z-index: 10;
		}

		@keyframes pulse {
			0% {
				box-shadow: 0 0 0 0 @pulse-dot-fading;
			}

			70% {
				box-shadow: 0 0 0 10px @pulse-dot-transparent;
			}

			100% {
				box-shadow: 0 0 0 0 @pulse-dot-transparent;
			}
		}
	}

	&__heading {
		display: flex;
	}

	&__title {
		h4 {
			font-size: 16px;
			margin-top: 0;
			margin-left: 11px;
			padding-top: 0;
			line-height: 1.2;
			text-transform: capitalize;
		}
	}

	&__article--icon {
		background-image: url( ../assets/icons/article.svg );
		background-repeat: no-repeat;
		width: 14px;
	}

	&__close--icon {
		cursor: pointer;
		margin-left: auto;
		line-height: 1;
	}

	&__content {
		padding-top: 25px;

		p {
			padding: 0;
			margin: 0;
			line-height: 1.45;

			&:first-child {
				margin-bottom: 16px;
			}
		}
	}
}
</style>
