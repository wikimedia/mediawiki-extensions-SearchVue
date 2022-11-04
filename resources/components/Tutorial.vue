<template>
	<div>
		<quick-view-tutorial-popup
			v-if="tutorialPopupVisible"
			:url="preferencesUrl"
			:style="{ 'top': firstSectionHeight / 2 + 'px' }"
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
	mapState = require( 'vuex' ).mapState;

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
			firstSectionHeight: null,
			tutorialPopupVisible: true
		};
	},
	computed: $.extend( {},
		mapState( [
			'selectedIndex'
		] ),
		{
			preferencesUrl() {
				return new mw.Title( 'Preferences', -1 ).getUrl();
			}
		}
	),
	methods: {
		setTutorialPopupVisibility() {
			if ( mw.user.isAnon() || !this.tutorialPopPref || this.selectedIndex !== -1 ) {
				this.tutorialPopupVisible = false;
				return;
			}
			return true;
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
				this.firstSectionHeight = this.firstSection.clientHeight;
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
</style>
