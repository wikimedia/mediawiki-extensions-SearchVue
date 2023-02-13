<template>
	<div class="QuickViewLinks">
		<ul
			class="QuickViewLinks__list"
		>
			<li
				v-for="(link, interwikiName) in links"
				:key="interwikiName"
			>
				<a :href="link.url">
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
	</div>
</template>

<script>
/**
 * @file QuickViewLinks.vue
 *
 * Placeholder
 */

// @vue/component
module.exports = exports = {
	name: 'QuickViewLinks',
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
	methods: {
		generateInterwikiNote( friendlyName ) {
			return this.$i18n( 'searchvue-links-subheading', friendlyName ).parse();
		},
		generateStyles( url ) {
			return {
				'background-image': `url('${url}')`
			};
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.ui/variables.less';

.QuickViewLinks {
	& &__list {
		list-style: none;
		padding: 0;
		margin: 0;
		margin-bottom: 8px;

		li {
			margin-bottom: 16px;
		}
	}

	&__subheading {
		padding-left: 23px;
		background-repeat: no-repeat;
		background-position-y: center;
		background-size: 15px;
	}
}
</style>
