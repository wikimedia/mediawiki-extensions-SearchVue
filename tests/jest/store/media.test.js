const useStore = require( '../../../resources/stores/Media.js' ),
	commonsFakeResponse = require( '../fixtures/commonsApiResponse.js' ),
	Pinia = require( 'pinia' );

beforeEach( () => {
	Pinia.setActivePinia( Pinia.createPinia() );
} );

describe( 'Media store', () => {
	const fakeQID = 'Q1234';
	let store;
	let dummyPayload;
	beforeEach( () => {
		store = useStore();
		global.mw.Rest.prototype.get.mockReturnValue( $.Deferred().resolve( commonsFakeResponse ).promise() );
		dummyPayload = {
			pageprops: {
				// eslint-disable-next-line camelcase
				wikibase_item: fakeQID
			}
		};
	} );
	describe( 'setMediaInfo', () => {
		it( 'If QID is not set, it does nothing', () => {
			dummyPayload = {};
			store.setMediaInfo( dummyPayload );

			expect( global.mw.config.get ).not.toHaveBeenCalled();
		} );
		it( 'if QID is set, it triggers an API request', () => {
			store.setMediaInfo( dummyPayload );

			expect( global.mw.Rest.prototype.get ).toHaveBeenCalled();
			expect( global.mw.Rest.prototype.get ).toHaveBeenCalledWith( '/searchvue/v0/media/' + fakeQID );
		} );
		it( 'when commons API has info, does not update the store', () => {
			const responseWithNoPages = {
				commons: {
					query: {
						pages: []
					}
				}
			};
			global.mw.Rest.prototype.get.mockReturnValueOnce( $.Deferred().resolve( responseWithNoPages ).promise() );

			store.setMediaInfo( dummyPayload );

			expect( store.media.hasMoreImages ).toBeFalsy();
			expect( store.media.images.length ).toBe( 0 );
			expect( store.links ).toEqual( {} );

		} );
		it( 'when commons API has media, it update the store', () => {
			store.setMediaInfo( dummyPayload );

			expect( store.media.hasMoreImages ).toBeTruthy();
			expect( store.media.images.length ).not.toBe( 0 );

		} );
		it( 'when commons API has links, it update the store', () => {
			store.setMediaInfo( dummyPayload );

			expect( store.links ).toEqual(
				expect.objectContaining( {
					enwiki: expect.any( Object )
				} )
			);

		} );
	} );
	describe( 'abort', () => {
		it( 'Abort any inflight API request', () => {
			store.abort();
			expect( global.mw.Rest.prototype.abort ).toHaveBeenCalled();
		} );
	} );
} );
