<template>
	<div
		class="quickViewCommons"
		:class="{
			// eslint-disable-next-line vue/camelcase
			quickViewCommons__mobile: isMobile
		}"
	>
		<h3 v-if="isMobile">
			{{ $i18n( 'searchvue-commons-heading-mobile' ).text() }}
		</h3>
		<h3 v-else>
			{{ $i18n( 'searchvue-commons-heading' ).text() }}
		</h3>
		<div class="quickViewCommons__content">
			<ul
				ref="images-container"
			>
				<li
					v-for="image in images"
					v-show="failedImages.indexOf( image.pageid ) === -1"
					:key="image.index"
				>
					<!-- The class "image" is required for the multimedia viewer -->
					<a
						:href="image.imageinfo[ 0 ].descriptionurl"
						class="image"
						@click.prevent="onCommonsClick()"
					>
						<image-with-loading-background
							:src="image.imageinfo[ 0 ].thumburl"
							:alt="image.title"
							:aspectratio="calculateAspectRatio( image )"
							:height-constraints=" isMobile ? 142 : 100"
							@load="onImgLoad( $event, image.pageid )"
						></image-with-loading-background>
					</a>
				</li>
			</ul>
			<a
				v-if="hasMoreImages || hasHiddenImages"
				class="quickViewCommons__viewMore"
				:href="searchLink"
				@click.prevent="onCommonsClick( searchLink )"
			>
				<template v-if="isMobile">
					{{ $i18n( 'searchvue-commons-viewmore-mobile' ).text() }}
				</template>
				<template v-else>
					{{ $i18n( 'searchvue-commons-viewmore' ).text() }}
				</template>
			</a>
			<p
				v-if="!isMobile"
				class="quickViewCommons__footNote"
			>
				<a :href="repoLink">
					{{ $i18n( 'searchvue-commons-footnote' ).text() }}
				</a>
			</p>
		</div>
	</div>
</template>

<script>
/**
 * @file QuickViewCommons.vue
 *
 * Placeholder
 */
const ImageWithLoadingBackground = require( '../generic/ImageWithLoadingBackground.vue' ),
	mapState = require( 'pinia' ).mapState,
	useRootStore = require( '../../stores/Root.js' );

// @vue/component
module.exports = exports = {
	name: 'QuickViewCommons',
	compatConfig: { MODE: 3 },
	compilerOptions: { whitespace: 'condense' },
	components: {
		'image-with-loading-background': ImageWithLoadingBackground
	},
	props: {
		images: {
			type: Array,
			required: true
		},
		hasMoreImages: {
			type: Boolean,
			required: true
		},
		searchLink: {
			type: String,
			required: true
		}
	},
	emits: [
		'log-event',
		'dom-updated'
	],
	data() {
		return {
			repoLink: mw.config.get( 'wgQuickViewMediaRepositoryUri' ),
			numberOfImagesLoaded: 0,
			hasHiddenImages: false,
			failedImages: []
		};
	},
	computed: Object.assign(
		{
			allImageLoaded() {
				const imageNumber = this.images.length;

				return this.numberOfImagesLoaded === imageNumber;
			}
		},
		mapState( useRootStore, [
			'isMobile'
		] )
	),
	methods: {
		setHasHiddenImages( imagesContainer ) {
			if ( !imagesContainer ) {
				return;
			}

			this.hasHiddenImages = false;

			const bottomOfContainer = imagesContainer.offsetTop + imagesContainer.offsetHeight;
			const commonsImages = imagesContainer.querySelectorAll( 'li' );

			// we loop through the nodelist array
			Array.from( commonsImages ).forEach( ( image ) => {
				if ( image.offsetTop >= bottomOfContainer ) {
					// we set hidden images to true if any of the image out of the container
					this.hasHiddenImages = true;

					// we make sure hidden images are not accessible witht eh keyboard
					image.querySelector( 'a' ).tabIndex = -1;
				}

			} );

		},
		onImgLoad( loaded, pageid ) {
			if ( !loaded ) {
				this.failedImages.push( pageid );
			}
			this.numberOfImagesLoaded++;
		},
		onCommonsClick( url ) {
			this.$emit( 'log-event',
				{
					action: 'click-interwiki-commons',
					goTo: url
				} );
		},
		calculateAspectRatio( image ) {
			if ( image.imageinfo[ 0 ].thumbheight ) {
				return image.imageinfo[ 0 ].thumbwidth / image.imageinfo[ 0 ].thumbheight;
			} else {
				return 0;
			}
		}
	},
	watch: {
		allImageLoaded: {
			handler( allImagesLoaded ) {
				if ( allImagesLoaded ) {
					this.$nextTick()
						.then(
							() => {
								if ( !this.isMobile ) {
									this.setHasHiddenImages( this.$refs[ 'images-container' ] );
								}

								mw.loader.using( 'mmv.bootstrap', () => {
									// trigger the content hook, used by the multimedia viewer
									// eslint-disable-next-line no-jquery/no-global-selector
									const contentTextElement = $( '#mw-content-text' );
									mw.hook( 'wikipage.content' ).fire( contentTextElement );
								} );

								this.$emit( 'dom-updated' );
							}
						);
				}
			},
			deep: true
		}
	}
};

</script>

<style lang="less">
div.quickViewCommons {
	h3 {
		font-weight: normal;
		font-size: 1em;
		margin: 0;
		padding: 0;
		line-height: 1.571em;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		margin-bottom: 8px;
	}

	ul {
		max-height: 210px;
		overflow: hidden;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin: 0;

		li {
			position: relative;
			display: flex;
			flex: 1;
			height: 100px;
			list-style: none;
			margin-bottom: 0; // required to override wiki styles

			&:last-child {
				flex: 0;
			}

			a {
				display: flex;
				flex: 1;
			}
		}
	}

	.quickViewCommons__footNote,
	&.quickViewCommons__mobile h3 {
		background-image: url( ../../assets/icons/commons.svg );
		padding-left: 23px;
		background-repeat: no-repeat;
		background-position-y: center;

		a {
			color: inherit;
		}
	}

	// Require further specificity
	&.quickViewCommons__mobile {
		border: none;
		padding: 0;

		.quickViewCommons__content {
			display: flex;
			width: fit-content;
		}

		.quickViewCommons__viewMore {
			width: 74px;
			margin-left: 10px;
			margin-right: 26px;
			display: flex;
			align-items: center;
			text-align: center;
		}

		ul {
			flex-wrap: nowrap;
			padding: 0;
			margin-left: 0;
			width: fit-content;
			gap: 4px;

			li {
				height: 142px;
				padding-bottom: 0;
			}
		}
	}
}
</style>
