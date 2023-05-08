<template>
	<div>
		<quick-view-tutorial-popup
			v-if="tutorialPopupVisible"
			:url="preferencesUrl"
			:is-mobile="isMobile"
			:style="{ top: firstSectionContentHeight / 2 + firstSectionHeadingHeight + topPositionAdjuster + 'px' }"
			@close="onCloseTutorialPopup"
		>
		</quick-view-tutorial-popup>
	</div>
</template>

<script>
/**
 * @file Tutorial.vue
 *
 * Placeholder
 */
const QuickViewTutorialPopup = require( './QuickViewTutorialPopup.vue' ),
	mapState = require( 'pinia' ).mapState,
	useRootStore = require( '../stores/Root.js' );

// @vue/component
module.exports = exports = {
	name: 'Tutorial',
	components: {
		'quick-view-tutorial-popup': QuickViewTutorialPopup
	},
	data: function () {
		return {
			prefKey: 'searchpreview-tutorial-enabled',
			tutorialPopPref: 0,
			firstSection: null,
			firstSectionHeadingHeight: null,
			firstSectionContentHeight: null,
			topPositionAdjuster: 0,
			tutorialPopupVisible: false
		};
	},
	computed: $.extend( {},
		mapState( useRootStore, [
			'selectedIndex',
			'isMobile'
		] ),
		{
			preferencesUrl() {
				return new mw.Title( 'Preferences#mw-prefsection-searchoptions', -1 ).getUrl();
			}
		}
	),
	methods: {
		setTutorialPopupVisibility() {
			// If enabled mobile preview, temporary disable tutorial popup
			if (
				mw.user.isAnon() ||
				!this.tutorialPopPref ||
				this.selectedIndex !== -1
			) {
				this.tutorialPopupVisible = false;
				return;
			}
			this.tutorialPopupVisible = true;
			return;
		},
		onCloseTutorialPopup() {
			this.tutorialPopupVisible = false;
			if ( this.firstSection ) {
				this.firstSection.classList.remove( 'searchresult-with-quickview--hover' );
			}
		},
		setFirstSectionStyles() {
			// eslint-disable-next-line no-jquery/no-global-selector
			this.firstSection = $( '#mw-content-text .mw-search-result' )[ 0 ];
			if ( this.firstSection ) {
				this.firstSection.classList.add( 'searchresult-with-quickview--hover' );
				this.firstSectionHeadingHeight = this.firstSection.querySelector( '.mw-search-result-heading' ).clientHeight;

				const firstSectionTable = this.firstSection.querySelector( 'table' );
				const firstSectionDiv = this.firstSection.querySelector( '.searchresult' );
				if ( firstSectionTable ) {
					this.firstSectionContentHeight = firstSectionTable.clientHeight;
				} else if ( firstSectionDiv ) {
					this.firstSectionContentHeight = firstSectionDiv.clientHeight;
					this.topPositionAdjuster = 8;
				}
			}
		},
		removeFirstSectionStyles() {
			if ( this.firstSection ) {
				this.firstSection.classList.remove( 'searchresult-with-quickview--hover' );
			}
		}
	},
	watch: {
		selectedIndex: {
			handler() {
				if ( this.selectedIndex !== -1 ) {
					this.tutorialPopupVisible = false;
					this.removeFirstSectionStyles();
				}
			},
			immediate: true
		}
	},
	mounted: function () {
		this.tutorialPopPref = Number( mw.user.options.get( this.prefKey ) );
		this.setTutorialPopupVisibility();
		if ( this.tutorialPopupVisible ) {
			this.setFirstSectionStyles();
		}
	},
	updated: function () {
		if ( this.tutorialPopPref ) {
			new mw.Api().saveOption( this.prefKey, 0 );
			mw.user.options.set( this.prefKey, 0 );
		}
	}
};
</script>

<style lang="less">
.tutorial-popup {
	position: absolute;
	z-index: 50;
}

.skin-minerva {
	.tutorial-popup {
		position: relative;
	}
}
</style>
