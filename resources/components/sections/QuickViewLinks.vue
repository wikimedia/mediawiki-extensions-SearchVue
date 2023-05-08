<template>
	<div
		class="QuickViewLinks"
		:class="{
			// eslint-disable-next-line vue/camelcase
			QuickViewLinks__mobile: isMobile
		}"
	>
		<h3 v-if="isMobile">
			{{ $i18n( 'searchvue-links-heading' ).text() }}
		</h3>
		<ul
			class="QuickViewLinks__list"
		>
			<li
				v-for="( link, interwikiName ) in linksToShow"
				:key="interwikiName"
			>
				<a
					:href="link.url"
					@click.prevent="onClick( link.url )"
				>
					{{ link.title }}
				</a>
				<p
					class="QuickViewLinks__subheading"
					:style="generateStyles( link.icon )"
				>
					{{ generateInterwikiNote( link.localizedName ) }}
				</p>
			</li>
		</ul>
		<a
			v-if="displayShowmore"
			class="QuickViewLinks__footnote"
			href="#"
			@click.prevent="onShowMoreClick"
		>
			<cdx-icon :icon="cdxIconExpand"></cdx-icon>
			{{ $i18n( 'searchvue-links-showmore' ).text() }}
		</a>
	</div>
</template>

<script>
/**
 * @file QuickViewLinks.vue
 *
 * Placeholder
 */
const { cdxIconExpand } = require( '../../../codex-icons.json' ),
	{ CdxIcon } = require( '@wikimedia/codex' );

// @vue/component
module.exports = exports = {
	name: 'QuickViewLinks',
	components: {
		'cdx-icon': CdxIcon
	},
	props: {
		links: {
			type: Object,
			required: true
		},
		isMobile: {
			type: Boolean,
			required: true
		}
	},
	emits: [
		'log-event'
	],
	data() {
		return {
			currentShownLinkIndex: 0,
			cdxIconExpand
		};
	},
	computed: {
		linksKeysArray() {
			return Object.keys( this.links );
		},
		linksToShow() {
			if ( !this.isMobile ) {
				return this.links;
			} else {
				return this.linksKeysArray.slice(
					this.currentShownLinkIndex,
					this.currentShownLinkIndex + 2
				).map(
					( linkKey ) => {
						return this.links[ linkKey ];
					}
				);
			}
		},
		displayShowmore() {
			const moreThanTwoLinks = this.linksKeysArray.length > 2;

			return this.isMobile && moreThanTwoLinks;
		}
	},
	methods: {
		onClick( url ) {
			this.$emit(
				'log-event',
				{
					action: 'click-interwiki-links',
					goTo: url
				} );
		},
		generateInterwikiNote( friendlyName ) {
			return this.$i18n( 'searchvue-links-subheading', friendlyName ).parse();
		},
		generateStyles( url ) {
			return {
				'background-image': `url('${url}')`
			};
		},
		onShowMoreClick() {
			const nextIndex = this.currentShownLinkIndex + 2;
			const maxIndex = this.linksKeysArray.length - 1;

			if ( nextIndex > maxIndex ) {
				this.currentShownLinkIndex = 0;
			} else {
				this.currentShownLinkIndex = nextIndex;
			}
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.QuickViewLinks {
	& &__list {
		list-style: none;
		padding: 0;
		margin: 0;
		margin-bottom: 8px;

		a {
			display: inherit;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			font-size: 1em;
			line-height: 1.571em;
		}

		p {
			font-size: 0.857em;
			line-height: 1.428em;
		}

		li {
			margin-bottom: 12px;
		}
	}

	h3 {
		font-weight: normal;
		margin: 0;
		padding: 0;
		font-size: 1em;
		line-height: 1.571em;
		margin-bottom: 8px;
	}

	&__subheading {
		padding-left: 23px;
		background-repeat: no-repeat;
		background-position-y: center;
		background-size: 15px;
	}

	&__mobile {
		position: relative;
		min-width: 300px;

		a.QuickViewLinks__footnote {
			position: absolute;
			bottom: 5px;
			left: 8px;
			font-size: 0.855em;

			svg {
				width: 15px;
				height: 11px;
				margin: 0;
				margin-top: 7px;
				fill: @color-progressive;
			}
		}
	}
}
</style>
