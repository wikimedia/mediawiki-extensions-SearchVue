<template>
	<div class="quickViewCommons">
		<h3>{{ $i18n( 'searchvue-commons-heading' ).text() }}</h3>
		<ul
			ref="images-container"
		>
			<li
				v-for="image in images"
				:key="image.index"
				class="loading"
			>
				<a :href="image.imageinfo[ 0 ].descriptionurl"
					@click="onCommonsClick">
					<image-with-loading-background
						:src="image.imageinfo[ 0 ].thumburl"
						:alt="image.title"
						:aspectratio="image.imageinfo[ 0 ].thumbheight ? image.imageinfo[ 0 ].thumbwidth / image.imageinfo[ 0 ].thumbheight : 0"
						@load="onImgLoad"
					></image-with-loading-background>
				</a>
			</li>
		</ul>
		<a
			v-if="hasMoreImages || hasHiddenImages"
			:href="searchLink"
			@click="onCommonsClick"
		>
			{{ $i18n( 'searchvue-commons-viewmore' ).text() }}
		</a>
		<p class="quickViewCommons__footNote">
			<a :href="repoLink">
				{{ $i18n( 'searchvue-commons-footnote' ).text() }}
			</a>
		</p>
	</div>
</template>

<script>
/**
 * @file QuickViewCommons.vue
 *
 * Placeholder
 */
const ImageWithLoadingBackground = require( '../generic/ImageWithLoadingBackground.vue' );

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
	computed: {
		allImageLoaded() {
			const imageNumber = this.images.length;

			return this.numberOfImagesLoaded === imageNumber;
		}
	},
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
		onCommonsClick() {
			this.$emit(
				'log-event',
				'click-interwiki-commons'
			);
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
.quickViewCommons {
	width: 365px;
	margin: 0 auto 20px;

	h3 {
		font-weight: 400;
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

	&__footNote {
		background-image: url( '../../assets/icons/commons.svg' );
		padding-left: 23px;
		background-repeat: no-repeat;
		background-position-y: center;

		a {
			color: inherit;
		}
	}
}
</style>
