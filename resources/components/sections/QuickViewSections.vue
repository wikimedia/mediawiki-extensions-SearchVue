<template>
	<div class="quickViewSections">
		<h3>{{ headingText }}</h3>
		<ul
			ref="sections-container"
			class="quickViewSections__list"
			:class="{ 'quickViewSections__list--expanded': hiddenSectionsLength === 1 }"
		>
			<li
				v-for="section in sections"
				:key="section"
				ref="sections"
				class="quickViewSections__pill"
				:data-anchor="generateAnchor( section )"
			>
				<a :href="getSectionsUri( section )">
					{{ section }}
				</a>
			</li>
		</ul>
		<a
			v-if="hiddenSectionsLength > 1"
			:href="firstHiddenSectionsUrl"
		>
			{{ $i18n( 'searchvue-more-sections', hiddenSectionsLength ).text() }}
		</a>
	</div>
</template>

<script>
/**
 * @file QuickViewSections.vue
 *
 * Placeholder
 */

// @vue/component
module.exports = exports = {
	name: 'QuickViewSections',
	props: {
		title: {
			type: String,
			required: true
		},
		sections: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			hiddenSections: []
		};
	},
	computed: {
		hiddenSectionsLength() {
			return this.hiddenSections.length;
		},
		firstHiddenSectionsUrl() {
			// Props sections and Refs may have a different order
			// So we find the section using the sections props
			const firstHiddenSection = this.sections.find( ( section ) => {
				return this.hiddenSections.indexOf( section ) !== -1;
			} );

			if ( !firstHiddenSection ) {
				return;
			}
			return this.getSectionsUri( firstHiddenSection );
		},
		headingText() {
			const namespace = new mw.Title( this.title ).getNamespaceId();
			return this.$i18n( 'searchvue-article-sections-heading-ns' + namespace ).exists() ?
				this.$i18n( 'searchvue-article-sections-heading-ns' + namespace ).text() :
				this.$i18n( 'searchvue-article-sections-heading' ).text();
		}
	},
	methods: {
		getSectionsUri( fragment ) {
			const uri = new mw.Uri();
			uri.query = { title: this.title };
			uri.fragment = this.generateAnchor( fragment );

			return uri;
		},
		defineHiddenSection( sections, sectionsContainer ) {
			if ( !sections || !sectionsContainer ) {
				return;
			}
			const bottomOfContainer = sectionsContainer.offsetTop + sectionsContainer.offsetHeight;

			const hiddenSections = sections.filter( ( section ) => {
				return section.offsetTop >= bottomOfContainer;
			} );

			const hiddenSectionsAnchors = hiddenSections.map( ( section ) => {
				return section.dataset.anchor;
			} );

			this.hiddenSections = hiddenSectionsAnchors;
		},
		generateAnchor( name ) {

			// We replicate the logic defined in Sanitizer:escapeIdForLink
			// that is used by the parse API
			const formattedAnchor = name.replace( /[\t\n\f\r ]/g, '_' );
			return formattedAnchor.replace( '/%([a-fA-F0-9]{2})/g', '%25$1' );
		}
	},
	watch: {
		sections: {
			handler( newSections ) {
				if ( newSections.length === 0 ) {
					return;
				}

				this.$nextTick()
					.then(
						() => {
							this.defineHiddenSection( this.$refs.sections, this.$refs[ 'sections-container' ] );
						}
					);
			},
			immediate: true,
			flush: 'post'
		}
	},
	mounted() {
	}
};
</script>

<style lang="less">
@import 'mediawiki.ui/variables.less';

.quickViewSections{
	width: 365px;
	margin: 0 auto 20px;

	&__list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		margin: 0;
		margin-bottom: 8px;
		max-height: 100px;
		overflow: hidden;

		&--expanded{
			height: 136px;
		}
	}

	h3, &__pill {
		font-weight: 400;
		font-size: 1em;
		margin: 0;
		padding: 0;
		line-height: 1.571em;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	h3{
		margin-bottom: 8px;
	}

	&__pill{
		padding: 2px 8px;
		border-radius: 12px;
		border: 1px solid @colorGray10;
		a {
			font-size: 0.9285em;
			line-height: 1.286em;
			color: @colorGray2;
		}
	}
}
</style>
