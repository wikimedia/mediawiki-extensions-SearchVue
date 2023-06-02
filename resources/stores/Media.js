'use strict';

const Pinia = require( 'pinia' );
const useRequestStatusStore = require( './RequestStatus.js' );
const restApi = new mw.Rest();

/**
 * Retrieve the QID from the result object
 *
 * @param {Object} page
 * @return {string|undefined}
 */
const getQID = ( page ) => {
	if ( page.pageprops && page.pageprops.wikibase_item ) {
		return page.pageprops.wikibase_item;
	}
};

/**
 * Sort the object retrieved from the commons API. The images
 * are sorted using the 'index' property.
 *
 * @param {Object} result
 * @return {Array}
 */
const sortImagesArray = ( result ) => {
	const images = [];
	// Create an array from the query result
	for ( const key in result.query.pages ) {
		if ( Object.hasOwnProperty.call( result.query.pages, key ) ) {
			images.push( result.query.pages[ key ] );
		}
	}

	images.sort( ( a, b ) => {
		if ( a.index < b.index ) {
			return -1;
		}
		if ( a.index > b.index ) {
			return 1;
		}
		return 0;
	} );

	return images;
};

/**
 * Format the media information for usage within the search preview
 *
 * @param {Object} result
 * @param {Object} page
 * @param {boolean} isMobile
 * @return {Object}
 */
const formatMediaInfo = ( result, page, isMobile ) => {
	let images = sortImagesArray( result );
	images = images.filter( ( image ) => {
		// drop the image if it's the same as the page image we're
		// already showing at the top
		return !image.imageinfo[ 0 ] ||
			!page.original ||
			page.original.source !== image.imageinfo[ 0 ].url;
	} );

	// API is always returning 7 images, but mobile only uses 3
	const numberOfImagesToLoad = isMobile ? 3 : 7;
	const hasMoreImages = images.length > numberOfImagesToLoad || !!result.continue;
	images = images.slice( 0, numberOfImagesToLoad );

	return {
		images: images,
		hasMoreImages: hasMoreImages,
		searchLink: result.searchlink
	};
};

const useMediaStore = Pinia.defineStore( 'media', {
	state: () => ( {
		media: {
			images: [],
			hasMoreImages: false,
			searchLink: null
		},
		links: {}
	} ),
	getters: {
	},
	actions: {
		/**
		 * Retrieved media information from the internal API.
		 *
		 * @param {Object} page
		 * @param {boolean} isMobile
		 */
		setMediaInfo( page, isMobile ) {
			const QID = getQID( page );

			if ( !QID ) {
				this.$reset();
				return;
			}

			const requestStatusStore = useRequestStatusStore();

			requestStatusStore.setRequestStatus( {
				type: 'media',
				status: requestStatusStore.requestStatuses.inProgress
			} );

			restApi
				.get( '/searchvue/v0/media/' + QID )
				.done( ( result ) => {
					if (
						!result ||
						( !result.media && !result.links )
					) {

						requestStatusStore.setRequestStatus( {
							type: 'media',
							status: requestStatusStore.requestStatuses.done
						} );
						return;
					}

					if (
						result.media &&
						result.media.query &&
						result.media.query.pages &&
						Object.keys( result.media.query.pages ).length > 0
					) {
						const mediaInfo = formatMediaInfo( result.media, page, isMobile );
						this.$patch( {
							media: mediaInfo
						} );
					}

					if ( result.links && Object.keys( result.links ).length > 0 ) {
						this.$patch( {
							links: result.links
						} );
					}

					requestStatusStore.setRequestStatus(
						{
							type: 'media',
							status: requestStatusStore.requestStatuses.done
						} );
				} )
				.catch( () => {
					this.$reset();

					requestStatusStore.setRequestStatus( {
						type: 'media',
						status: requestStatusStore.requestStatuses.error
					} );
				} );
		},
		abort() {
			restApi.abort();
		}
	}
} );

module.exports = useMediaStore;
