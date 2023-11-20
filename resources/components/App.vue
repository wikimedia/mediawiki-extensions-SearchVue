<template>
	<!-- A dialog component require a label (that acts as the title) and a description.
	https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role -->
	<component
		:is="quickViewComponent"
		role="dialog"
		tabindex="-1"
		:aria-label="$i18n( 'searchvue-dialog-title' ).text()"
		:aria-description="$i18n( 'searchvue-dialog-aria-label' ).text()"
		class="mw-search-quick-view"
		@close="closeAndFocus"
	>
	</component>
</template>

<script>

/**
 * @file App.vue
 *
 * Placeholder
 */
const AppViewMobile = require( './AppViewMobile.vue' ),
	AppViewDesktop = require( './AppViewDesktop.vue' ),
	mapActions = require( 'pinia' ).mapActions,
	mapState = require( 'pinia' ).mapState,
	useEventStore = require( '../stores/Event.js' ),
	useRootStore = require( '../stores/Root.js' ),
	useDomStore = require( '../stores/Dom.js' ),
	useRequestStatusStore = require( '../stores/RequestStatus.js' ),
	useTimingStore = require( '../stores/Timing.js' );

// @vue/component
module.exports = exports = {
	name: 'SearchVue',
	compatConfig: { MODE: 3 },
	compilerOptions: { whitespace: 'condense' },
	components: {
		'app-view-mobile': AppViewMobile,
		'app-view-desktop': AppViewDesktop
	},
	data: function () {
		return {
			queryQuickViewTitle: null
		};
	},
	computed: $.extend(
		{
			quickViewComponent() {
				if ( this.isMobile ) {
					return 'app-view-mobile';
				} else {
					return 'app-view-desktop';
				}
			}
		},
		mapState( useRootStore, [
			'isMobile',
			'title',
			'results',
			'visible'
		] ),
		mapState( useRequestStatusStore, [
			'loading'
		] ),
		mapState( useDomStore, [
			'searchResults'
		] )
	),
	methods: $.extend( {},
		mapActions( useRootStore, [
			'toggleVisibily',
			'closeQuickView',
			'onPageClose'
		] ),
		mapActions( useDomStore, [
			'focusDialog',
			'handleTabTrap',
			'updateTabbableElements',
			'focusCurrentResult',
			'generateAndInsertAriaButton'
		] ),
		mapActions( useEventStore, [ 'initEventLoggingSession' ] ),
		{
			setQueryQuickViewTitle: function () {
				const mwUri = new mw.Uri();
				if ( mwUri.query.quickView ) {
					this.queryQuickViewTitle = mwUri.query.quickView;
				}
			},
			restoreQuickViewOnNavigation() {
				if ( this.queryQuickViewTitle ) {
					this.toggleVisibily( this.queryQuickViewTitle );
				}
			},
			leaving() {
				// Emit QuickView closing event only if QuickView is present in url
				if ( this.queryQuickViewTitle ) {
					this.onPageClose();
				}
			},
			closeAndFocus( event ) {
				if ( !this.title ) {
					return;
				}

				// event.detail will be equal to 0 if triggered by keyboard
				if ( event.detail === 0 ) {
					this.focusCurrentResult( this.title );
				}
				this.closeQuickView();
			},
			handleResultEvent( event ) {
				const searchResultLink = event.currentTarget.parentElement.getElementsByTagName( 'a' )[ 0 ];

				if ( searchResultLink.hasAttribute( 'data-prefixedtext' ) ) {
					event.stopPropagation();
					const resultTitle = searchResultLink.getAttribute( 'data-prefixedtext' );
					this.toggleVisibily( resultTitle );
				}
			},
			resultHasInfoToDisplay( prefixedText ) {
				const result = this.results.find( ( item ) => {
					return item.prefixedText === prefixedText;
				} );
				return result && ( result.text || result.thumbnail );
			},
			multiMediaViewerIsOpen() {
				const urlFragment = mw.Uri().fragment;
				return urlFragment && urlFragment.indexOf( '/media/' ) !== -1;
			}
		}
	),
	watch: {
		title: {
			handler( title ) {
				const timingStore = useTimingStore();
				timingStore.reset();
				if ( title ) {
					this.setQueryQuickViewTitle();
				}
			},
			flush: 'post'
		},
		loading: {
			handler( loading ) {
				if ( loading ) {
					useTimingStore().start();
				} else {
					// We re-calculate the tabbable element everytime the loading is complete.
					this.updateTabbableElements();
					useTimingStore().complete();
				}
			},
			flush: 'post'
		},
		visible: {
			handler( visible ) {
				if ( !visible ) {
					useTimingStore().reset();
				}
			}
		}
	},
	created() {
		this.initEventLoggingSession();
		// This event triggers only if user interacts with the page before closing
		window.addEventListener( 'beforeunload', this.leaving );
	},
	mounted: function () {

		for ( const searchResultLi of this.searchResults ) {
			const searchResult = searchResultLi.querySelector( '.mw-search-result-heading' );

			// Search Result will be undefined if an user would type in the searchbox quickly
			// before the results are fully mapped. Quite probably triggered by a BOT.
			if ( !searchResult ) {
				return;
			}

			const prefixedText = searchResult.querySelector( 'a' ).getAttribute( 'data-prefixedtext' );

			if ( this.resultHasInfoToDisplay( prefixedText ) ) {
				searchResultLi.classList.add( 'searchresult-with-quickview' );
				searchResultLi.dataset.prefixedtext = prefixedText;

				const searchResultContainer = searchResult.parentElement;
				this.generateAndInsertAriaButton( searchResultContainer, this.$i18n( 'searchvue-aria-button' ).text() );
			}
		}

		const searchResultWithQuickView = this.searchResults.filter( function ( resultIndex ) {
			return this.searchResults[ resultIndex ].classList.contains( 'searchresult-with-quickview' );
		}.bind( this ) );
		// Mouse click
		searchResultWithQuickView.find( '.searchresult, .mw-search-result-data, .quickView-aria-button' )
			.click( function ( event ) {
				this.handleResultEvent( event );
			}.bind( this ) );

		// Keyboard navigation
		searchResultWithQuickView.find( '.quickView-aria-button' ).keydown( function ( event ) {
			if ( event.key === 'Enter' ) {
				this.handleResultEvent( event );
				this.$nextTick( function () {
					this.focusDialog();
				} );
			}
		}.bind( this ) );

		// eslint-disable-next-line no-jquery/no-global-selector
		$( 'body' ).click( function ( event ) {
			const isInMultimediaViewer = this.multiMediaViewerIsOpen();
			const isQuickView = event.target.closest( '.mw-search-quick-view' );
			if ( !this.isMobile && !isInMultimediaViewer && !isQuickView ) {
				this.closeQuickView();
			}
		}.bind( this ) );

		this.setQueryQuickViewTitle();

		// Restore the quick view in the case in which the user has navigated back to a page
		// that had a quickView open
		this.restoreQuickViewOnNavigation();

		window.addEventListener( 'keydown', function ( event ) {
			const mmvOpen = this.multiMediaViewerIsOpen();
			if ( !mmvOpen ) {
				if ( event.key === 'Escape' ) {
					this.closeAndFocus( event );
				}
				if ( event.key === 'Tab' && this.title ) {
					this.handleTabTrap( event, document.activeElement );
				}
			}
		}.bind( this ) );
	}
};
</script>

<style lang="less">
// This class is used by buttons that are dynamically added after the page loads.
// These buttons are added on a part of the page that is not handled by vue (search result list)
.quickView-aria-button {
	position: absolute;
	width: 0;
	height: 100%;
	top: 0;
	right: 0;
	padding-left: 0;
	border: none;
	background: transparent;
}
</style>
