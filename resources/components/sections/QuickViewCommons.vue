<template>
	<div
		class="quickViewCommons"
		:class="{
			'quickViewCommons__mobile': isMobile
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
					:key="image.index"
					class="loading"
				>
					<a :href="image.imageinfo[ 0 ].descriptionurl"
						@click.prevent="onCommonsClick( image.imageinfo[ 0 ].descriptionurl )">
						<image-with-loading-background
							:src="image.imageinfo[ 0 ].thumburl"
							:alt="image.title"
							:aspectratio="calculateAspectRatio( image )"
							@load="onImgLoad"
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
	mapState = require( 'vuex' ).mapState;

// @vue/component
module.exports = exports = {
	name: 'QuickViewCommons',
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
			type: Object,
			required: true
		}
	},
	data() {
		return {
			repoLink: mw.config.get( 'wgQuickViewMediaRepositoryUri' ),
			numberOfImagesLoaded: 0,
			hasHiddenImages: false
		};
	},
	computed: $.extend(
		{
			allImageLoaded() {
				const imageNumber = this.images.length;

				return this.numberOfImagesLoaded === imageNumber;
			}
		},
		mapState( [
			'isMobile'
		] )
	),
	methods: {
		setHasHiddenImages( imagesContainer ) {
			if ( !imagesContainer ) {
				return;
			}

			this.hasHiddenImages = imagesContainer.scrollHeight > imagesContainer.clientHeight;
		},
		onImgLoad() {
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
			if ( !this.isMobile ) {
				if ( image.imageinfo[ 0 ].thumbheight ) {
					return image.imageinfo[ 0 ].thumbwidth / image.imageinfo[ 0 ].thumbheight;
				} else {
					return 0;
				}
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
								this.setHasHiddenImages( this.$refs[ 'images-container' ] );
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

				img {
					max-width: ~'calc( 100vw - 50px )';
				}
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
