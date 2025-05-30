<template>
	<div
		class="quickViewSections"
		:class="{
			// eslint-disable-next-line vue/camelcase
			quickViewSections__mobile: isMobile
		}"
	>
		<h3>{{ headingText }}</h3>
		<ul
			ref="sections-container"
			class="quickViewSections__list"
			:class="{ 'quickViewSections__list--expanded': hiddenSectionsLength === 1 }"
		>
			<li
				v-for="( section, i ) in sections"
				:key="section"
				ref="sections"
				class="quickViewSections__pill"
				:data-anchor="section"
			>
				<a
					:href="getSectionsUri( section, i )"
					@click.prevent="onSectionClick( getSectionsUri( section, i ) )"
				>
					{{ section }}
				</a>
			</li>
		</ul>
		<a
			v-if="hiddenSectionsLength > 1"
			class="quickViewSections__footnote"
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
	compatConfig: { MODE: 3 },
	compilerOptions: { whitespace: 'condense' },
	props: {
		title: {
			type: String,
			required: true
		},
		sections: {
			type: Array,
			required: true
		},
		isMobile: {
			type: Boolean,
			required: true
		}
	},
	emits: [
		'log-event',
		'dom-updated'
	],
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
			const firstHiddenSectionIndex = this.sections.findIndex( ( section ) => this.hiddenSections.indexOf( section ) !== -1 );

			if ( firstHiddenSectionIndex < 0 ) {
				return;
			}

			return this.getSectionsUri(
				this.sections[ firstHiddenSectionIndex ],
				firstHiddenSectionIndex
			);
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
			// Note: the 2nd argument for the `URL` constructor is required, even
			// though we will not actually use it; we're just going to use a stub
			// value that we know will be valid to construct `URL` with
			const url = new URL( '#' + hash, 'http://localhost' );
			const title = new mw.Title( this.title + url.hash );
			return title.getUrl();
		},
		defineHiddenSection( sections, sectionsContainer ) {
			if ( !sections || !sectionsContainer ) {
				return;
			}
			const bottomOfContainer = sectionsContainer.offsetTop + sectionsContainer.offsetHeight;

			// We create an array of all sections that go beyond the visible area
			const hiddenSections = sections.filter( ( section ) => section.offsetTop >= bottomOfContainer );

			// We create an array of anchor urls for this hidden sections
			// and make them aria-hidden
			const hiddenSectionsAnchors = [];
			hiddenSections.forEach( ( section ) => {
				hiddenSectionsAnchors.push( section.dataset.anchor );
				section.querySelector( 'a' ).tabIndex = -1;
			} );

			this.hiddenSections = hiddenSectionsAnchors;
			this.$emit( 'dom-updated' );
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
	mounted() {
		if ( this.sections.length !== 0 ) {
			this.$nextTick()
				.then(
					() => {
						this.defineHiddenSection( this.$refs.sections, this.$refs[ 'sections-container' ] );
					}
				);
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

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
		border-radius: @border-radius-pill;
		border: @border-width-base @border-style-base @border-color-base;
		font-size: 0.9285em;
		line-height: 1.385em;
		margin-bottom: 0;

		&:last-child {
			margin-bottom: 0;
		}

		a {
			color: @color-base;
		}
	}

	& &__footnote {
		font-size: 0.855em;
	}

	&__mobile {
		min-width: 300px;
	}
}
</style>
