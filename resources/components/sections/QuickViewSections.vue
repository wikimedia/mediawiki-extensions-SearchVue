<template>
	<div class="quickViewSections">
		<h3>{{ headingText }}</h3>
		<ul
			ref="sections-container"
			class="quickViewSections__list"
			:class="{ 'quickViewSections__list--expanded': hiddenSectionsLength === 1 }"
		>
			<li
				v-for="(section, i) in sections"
				:key="section"
				ref="sections"
				class="quickViewSections__pill"
				:data-anchor="section"
			>
				<a :href="getSectionsUri( section, i )"
					@click.prevent="onSectionClick( getSectionsUri( section, i ) )"
				>
					{{ section }}
				</a>
			</li>
		</ul>
		<a
			v-if="hiddenSectionsLength > 1"
			:href="firstHiddenSectionsUrl"
			@click.prevent="onSectionClick( firstHiddenSectionsUrl )"
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
			const firstHiddenSectionIndex = this.sections.findIndex( ( section ) => {
				return this.hiddenSections.indexOf( section ) !== -1;
			} );

			if ( firstHiddenSectionIndex < 0 ) {
				return;
			}

			return this.getSectionsUri( this.sections[ firstHiddenSectionIndex ], firstHiddenSectionIndex );
		},
		headingText() {
			const namespace = new mw.Title( this.title ).getNamespaceId();
			return this.$i18n( 'searchvue-article-sections-heading-ns' + namespace ).exists() ?
				this.$i18n( 'searchvue-article-sections-heading-ns' + namespace ).text() :
				this.$i18n( 'searchvue-article-sections-heading' ).text();
		}
	},
	methods: {
		getSectionsUri( fragment, index ) {
			// Known issue: vertical tab html entity (&#x0B;) ends up being
			// a space in cirrusdoc output

			let hash = fragment
				// mw.Title already does this transformation, but we'll also
				// roundtrip through URL, which would otherwise end up
				// encoding these as %20
				.replace( / /g, '_' )
				// We replicate the logic defined in Sanitizer:escapeIdForLink
				// that is used by the parse API
				.replace( /%([a-fA-F0-9]{2})/g, '%25$1' );

			// In the case of duplicate sections, they get a _X suffix
			const priorOccurences = this.sections
				.slice( 0, index )
				.filter( ( section ) => section === fragment )
				.length;
			if ( priorOccurences > 0 ) {
				hash += '_' + ( priorOccurences + 1 );
			}

			// Roundtrip fragment through URL to ensure it's properly en-/decoded
			// before feeding it into mw.Title
			const url = new URL( '#' + hash, mw.config.get( 'wgServer' ) );
			const title = new mw.Title( this.title + url.hash );
			return title.getUrl();
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
		onSectionClick( url ) {
			this.$emit(
				'log-event',
				{
					action: 'click-article-section',
					goTo: url
				} );
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

.quickViewSections {
	& &__list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		padding: 0;
		margin: 0;
		margin-bottom: 8px;
		max-height: 94px;
		overflow: hidden;

		&--expanded {
			max-height: 125px;
		}
	}

	h3,
	&__pill {
		font-weight: normal;
		margin: 0;
		padding: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	h3 {
		font-size: 1em;
		line-height: 1.571em;
		margin-bottom: 8px;
	}

	& &__pill {
		padding: 2px 8px;
		border-radius: 12px;
		border: 1px solid @colorGray10;
		font-size: 0.9285em;
		line-height: 1.385em;
		margin-bottom: 0;

		a {
			color: @colorGray2;
		}
	}
}
</style>
