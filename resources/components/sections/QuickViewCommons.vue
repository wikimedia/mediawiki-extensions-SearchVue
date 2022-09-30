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
				<image-with-placeholder
					:src="image.imageinfo[ 0 ].thumburl"
					:alt="image.title"
					@load="onImgLoad"
				></image-with-placeholder>
			</li>
		</ul>
		<a
			v-if="hasMoreImages || hasHiddenImages"
			:href="searchLink"
		>
			{{ $i18n( 'searchvue-commons-viewmore' ).text() }}
		</a>
		<p class="quickViewCommons__footNote">
			{{ $i18n( 'searchvue-commons-footnote' ).text() }}
		</p>
	</div>
</template>

<script>
/**
 * @file QuickViewCommons.vue
 *
 * Placeholder
 */
const ImageWithPlaceholder = require( '../generic/ImageWithPlaceholder.vue' );

// @vue/component
module.exports = exports = {
	name: 'QuickViewCommons',
	components: {
		'image-with-placeholder': ImageWithPlaceholder
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
		}
	}

	&__footNote {
		background-image: url( '../../assets/icons/commons.svg' );
		padding-left: 23px;
		background-repeat: no-repeat;
		background-position-y: center;
	}
}
</style>
