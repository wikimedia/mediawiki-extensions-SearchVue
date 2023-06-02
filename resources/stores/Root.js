'use strict';

const Pinia = require( 'pinia' );
const useEventStore = require( './Event.js' );
const useQueryStore = require( './Query.js' );
const useMediaStore = require( './Media.js' );
const useRequestStatusStore = require( './RequestStatus.js' );

/**
 * Push the current provided title to the browser's session history stack
 *
 * @param {string} title
 */
const pushTitleToHistoryState = ( title ) => {
	const mwUri = new mw.Uri();
	// update mw URI query object with the one currently available within the store
	// In Vue 3, context.state.uriQuery is a Proxy, and passing it to replaceState()
	// causes an error saying it can't be cloned. Work around this by cloning the uriQuery
	// object ourselves, using JSON.parse( JSON.stringify() ) to convert the Proxy to Object.
	const existingQuery = JSON.parse( JSON.stringify( mwUri.query ) );
	mwUri.query = $.extend(
		{},
		existingQuery,
		{ quickView: title }
	);
	const queryString = '?' + mwUri.getQueryString();
	window.history.pushState( mwUri.query, null, queryString );
};

/**
 * Remove the value of QuickView from the history State.
 */
const removeQuickViewFromHistoryState = () => {
	const mwUri = new mw.Uri();
	// update mw URI query object with the one currently available within the store
	// In Vue 3, context.state.uriQuery is a Proxy, and passing it to replaceState()
	// causes an error saying it can't be cloned. Work around this by cloning the uriQuery
	// object ourselves, using JSON.parse( JSON.stringify() ) to convert the Proxy to Object.
	mwUri.query = JSON.parse( JSON.stringify( mwUri.query ) );
	delete mwUri.query.quickView;
	const queryString = '?' + mwUri.getQueryString();
	window.history.pushState( mwUri.query, null, queryString );
};

/**
 * Handle the addition and removal of classes to the body and other element to define
 * when the Search Preview is open. This classes are used to apply specific CSS properties.
 *
 * @param {boolean} open
 * @param {Element} currentElement
 */
const handleClassesToggle = ( open, currentElement ) => {
	if ( open ) {
		document.getElementsByTagName( 'body' )[ 0 ].classList.add( 'search-preview-open' );
		currentElement.classList.add( 'searchresult-with-quickview--open' );
	} else {
		document.getElementsByTagName( 'body' )[ 0 ].classList.remove( 'search-preview-open' );
		const openElement = document.getElementsByClassName( 'searchresult-with-quickview--open' )[ 0 ];
		if ( openElement ) {
			openElement.classList.remove( 'searchresult-with-quickview--open' );
		}
	}
};

const useRootStore = Pinia.defineStore( 'root', {
	state: () => ( {
		title: null,
		selectedIndex: -1,
		prevSelectedIndex: null,
		isMobile: mw.config.get( 'skin' ) === 'minerva',
		results: mw.config.get( 'wgSpecialSearchTextMatches' ) || [],
		destination: '',
		breakpoints: {
			medium: 1000,
			large: 1440,
			small: 720
		}
	} ),
	getters: {
		/**
		 * Returns the currently selected result.
		 *
		 * @param {Object} state
		 *
		 * @return {Object}
		 */
		currentResult: ( state ) => {

			if ( state.selectedIndex === -1 || !state.results[ state.selectedIndex ] ) {
				return {};
			}
			const mediaStore = useMediaStore();
			const queryStore = useQueryStore();
			const additionalInfo = {
				sections: queryStore.sections,
				thumbnail: queryStore.thumbnail,
				media: mediaStore.media,
				description: queryStore.description,
				links: mediaStore.links,
				expandedSnippet: queryStore.expandedSnippet
			};

			return $.extend(
				state.results[ state.selectedIndex ],
				additionalInfo
			);

		},
		/**
		 * Determine when the search preview is actually supposed to be visible.
		 * This is used to show the correct loading state.
		 *
		 * @param {Object} state
		 *
		 * @return {boolean}
		 */
		visible: ( state ) => {
			return !!state.title;
		},
		/**
		 * Determine if there is enough data to show the search preview.
		 * This is used on mobile view only.
		 *
		 * @return {boolean}
		 */
		showOnMobile() {
			return this.pageInfoAvailable;
		},
		/**
		 * Determine if page information are available for the selected result.
		 * This is used to determine when to display the extension
		 *
		 * @return {boolean}
		 */
		pageInfoAvailable() {
			const descriptionIsSet = !!this.currentResult.description;
			const sectionIsSet = this.currentResult.sections && this.currentResult.sections.length !== 0;
			const thumbnailIsSet = !!this.currentResult.thumbnail;

			return descriptionIsSet || sectionIsSet || thumbnailIsSet;
		}
	},
	actions: {
		/**
		 * Handles the visibility of the Search Preview definiting title.
		 *
		 * @param {Object} payload
		 * @param {string} payload.title
		 * @param {Element} payload.element
		 */
		toggleVisibily( { title, element } ) {
			let destination = '.searchresults';
			if ( this.isMobile ) {
				// phpcs:disable Squiz.WhiteSpace.OperatorSpacing.NoSpaceBefore,Squiz.WhiteSpace.OperatorSpacing.NoSpaceAfter
				const dataTitleSelector = `[data-prefixedtext="${title}"]`;
				// phpcs:enable Squiz.WhiteSpace.OperatorSpacing.NoSpaceBefore,Squiz.WhiteSpace.OperatorSpacing.NoSpaceAfter
				destination = title ? dataTitleSelector : false;
			}
			this.destination = destination;

			this.handleTitleChange( { newTitle: title, element: element } );
		},
		/**
		 * Handle the change in title by retrieving the information from server
		 * and managing the visibility of the panel
		 *
		 * @param {Object} payload
		 * @param {?string} payload.newTitle
		 * @param {?Element} payload.element
		 */
		handleTitleChange( { newTitle: newTitle, element: element } ) {
			if ( !newTitle ) {
				return;
			}

			const currentTitle = this.title;
			const eventStore = useEventStore();
			const queryStore = useQueryStore();

			// This invokes on each title change
			this.closeQuickView();

			if ( currentTitle !== newTitle ) {
				const selectedTitleIndex = this.results.findIndex( ( result ) => {
					return result.prefixedText === newTitle;
				} );
				let thumbnail = null;
				if ( this.results[ selectedTitleIndex ] && this.results[ selectedTitleIndex ].thumbnail ) {
					thumbnail = this.results[ selectedTitleIndex ].thumbnail;
				}
				queryStore.thumbnail = thumbnail;
				queryStore.retrieveInfoFromQuery( newTitle, selectedTitleIndex, this.results, this.isMobile );
				this.title = newTitle;
				pushTitleToHistoryState( newTitle );
				handleClassesToggle( true, element );

				this.selectedIndex = selectedTitleIndex;

				eventStore.logQuickViewEvent( { action: 'open-searchpreview', selectedIndex: this.selectedIndex }, { root: true } );
			}
		},
		/**
		 * Closes the quick view panel
		 */
		closeQuickView() {

			const mediaStore = useMediaStore();
			const queryStore = useQueryStore();
			const requestStatusStore = useRequestStatusStore();

			if ( this.title !== null ) {
				const eventStore = useEventStore();
				eventStore.logQuickViewEvent( { action: 'close-searchpreview', selectedIndex: this.selectedIndex } );
			}

			// This is a custom method that reset the store and also restore the snippet
			queryStore.reset( this.currentResult, this.isMobile );
			// we do not reset the store otherwise the destination will also be reset
			this.$patch( {
				title: null,
				selectedIndex: -1
			} );
			removeQuickViewFromHistoryState();
			requestStatusStore.resetRequestStatus();
			mediaStore.abort();
			queryStore.abort();
			mediaStore.$reset();
			handleClassesToggle( false );
		},
		/**
		 * Emit close event when page is closing/refreshing while QuickView is open
		 */
		onPageClose() {
			if ( this.selectedIndex !== -1 ) {
				const eventStore = useEventStore();
				eventStore.logQuickViewEvent( { action: 'close-searchpreview', selectedIndex: this.selectedIndex } );
			}
		},
		/**
		 * Navigate results
		 *
		 * @param {string} action
		 */
		navigate( action ) {
			if ( [ 'next', 'previous' ].indexOf( action ) <= -1 ) {
				return;
			}

			let newIndex;

			switch ( action ) {
				case 'next':
					newIndex = this.selectedIndex + 1;
					break;

				case 'previous':
					newIndex = this.selectedIndex - 1;
					break;
			}

			if ( newIndex >= this.results.length || newIndex === -1 ) {
				return;
			}

			const title = this.results[ newIndex ].prefixedText;
			this.title = title;
			this.selectedIndex = newIndex;
		}
	}
} );

module.exports = useRootStore;
