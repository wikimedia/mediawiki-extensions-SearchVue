'use strict';

const Pinia = require( 'pinia' );
const useEventStore = require( './Event.js' );
const useQueryStore = require( './Query.js' );
const useMediaStore = require( './Media.js' );
const useDomStore = require( './Dom.js' );
const useRequestStatusStore = require( './RequestStatus.js' );

/**
 * Converts URLSearchParams to object.
 *
 * @param {URLSearchParams} params
 * @return {Object}
 */
const urlSearchParamsToObject = ( params ) => {
	// ES2019 'Object.fromEntries' method is shorter
	const object = {};
	for ( const [ k, v ] of params.entries() ) {
		object[ k ] = v;
	}
	return object;
};

/**
 * Push the current provided title to the browser's session history stack
 *
 * @param {string} title
 */
const pushTitleToHistoryState = ( title ) => {
	const searchParams = new URLSearchParams( location.search );
	searchParams.set( 'quickView', title );
	const queryString = '?' + searchParams.toString();
	const query = urlSearchParamsToObject( searchParams );
	window.history.pushState( query, null, queryString );
};

/**
 * Remove the value of QuickView from the history State.
 */
const removeQuickViewFromHistoryState = () => {
	const searchParams = new URLSearchParams( location.search );
	searchParams.delete( 'quickView' );
	const queryString = '?' + searchParams.toString();
	const query = urlSearchParamsToObject( searchParams );
	window.history.pushState( query, null, queryString );
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

			return Object.assign(
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
		visible: ( state ) => !!state.title,
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
		 * @param {string} title
		 */
		toggleVisibily( title ) {
			let destination = '.searchresults';
			if ( this.isMobile ) {
				const dataTitleSelector = `[data-prefixedtext="${ title }"]`;
				destination = title ? dataTitleSelector : false;
			}
			this.destination = destination;

			this.handleTitleChange( title );
		},
		/**
		 * Handle the change in title by retrieving the information from server
		 * and managing the visibility of the panel
		 *
		 * @param {?string} newTitle
		 */
		handleTitleChange( newTitle ) {
			if ( !newTitle ) {
				return;
			}

			const currentTitle = this.title;
			const eventStore = useEventStore();
			const queryStore = useQueryStore();
			const domStore = useDomStore();

			// This invokes on each title change
			this.closeQuickView();

			if ( currentTitle !== newTitle ) {
				const selectedTitleIndex = this.results.findIndex( ( result ) => result.prefixedText === newTitle );
				let thumbnail = null;
				if ( this.results[ selectedTitleIndex ] && this.results[ selectedTitleIndex ].thumbnail ) {
					thumbnail = this.results[ selectedTitleIndex ].thumbnail;
				}
				queryStore.thumbnail = thumbnail;
				queryStore.retrieveInfoFromQuery( newTitle, selectedTitleIndex, this.results, this.isMobile );
				this.title = newTitle;
				pushTitleToHistoryState( newTitle );
				domStore.handleClassesToggle( newTitle );

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
			const domStore = useDomStore();
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
			domStore.handleClassesToggle();
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
