const initialState = require( '../fixtures/initialVuexState.js' ),
	when = require( 'jest-when' ).when,
	commonsFakeResponse = require( '../fixtures/commonsApiResponse.js' );

require( '../mocks/history.js' );

let context;
let actions;

beforeEach( () => {
	jest.resetModules();
	actions = require( '../../../resources/store/actions.js' );

	// Fake Vuex context object
	// (see: https://vuex.vuejs.org/api/#actions)
	context = {
		state: JSON.parse( JSON.stringify( initialState ) ),
		getters: jest.fn(),
		commit: jest.fn(),
		dispatch: jest.fn()
	};

	actions.getters = context.getters;
	actions.state = context.state;
	actions.commit = context.commit;
	actions.dispatch = context.dispatch;

	when( global.mw.config.get )
		.calledWith( 'wgQuickViewMediaRepositoryApiBaseUri' )
		.mockReturnValue( 'https://FakeExternalEnbtity.fake' );
	when( global.mw.config.get )
		.calledWith( 'wgQuickViewSearchFilterForQID' )
		.mockReturnValue( 'DummySearchFilter %s' );
	when( global.mw.config.get )
		.calledWith( 'wgQuickViewMediaRepositorySearchUri' )
		.mockReturnValue( 'https://FakeRepositorySearchUri.fake/?search=%s' );
} );

afterEach( () => {
	context = null;
	actions = null;
} );

describe( 'Actions', () => {
	describe( 'handleTitleChange', () => {
		describe( 'when called with undefined', () => {
			it( 'Nothing is committed', () => {
				actions.handleTitleChange( context, undefined );

				expect( context.commit ).not.toHaveBeenCalled();

			} );
		} );
		describe( 'when title provided is the same as state.title', () => {
			it( 'Dispacth a call to closeQuickView', () => {
				const title = 'dummy';
				context.state.title = title;
				actions.handleTitleChange( context, title );

				expect( actions.dispatch ).toHaveBeenCalled();
				expect( actions.dispatch ).toHaveBeenCalledWith( 'closeQuickView' );

			} );
		} );
		describe( 'when called with a valid title', () => {
			it( 'retrieves article sections', () => {
				const mockSections = [ 'section1' ];
				const dummyResponse = {
					parse: {
						sections: mockSections
					}
				};
				global.mw.Api.prototype.get.mockReturnValueOnce( $.Deferred().resolve( dummyResponse ).promise() );
				const title = 'dummy';
				actions.handleTitleChange( context, title );

				expect( actions.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenCalledWith( 'SET_SECTIONS', mockSections );

			} );
			it( 'retrieves article thumbnail', () => {
				const mockThumbnail = {
					source: 'https://fakeImageUrl',
					width: 400,
					height: 700
				};

				const dummyResponse = {
					query: {
						pages: [
							{
								thumbnail: mockThumbnail
							}
						]
					}
				};
				global.mw.Api.prototype.get.mockReturnValueOnce( $.Deferred().resolve( {} ).promise() );
				// The Thumbnail request is the second one, so we need to mock it twice.
				global.mw.Api.prototype.get.mockReturnValueOnce( $.Deferred().resolve( dummyResponse ).promise() );
				const title = 'dummy';
				actions.handleTitleChange( context, title );

				expect( actions.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenCalledWith( 'SET_THUMBNAIL', mockThumbnail );

			} );
			describe( 'when a QID is available in API response', () => {
				const fakeQID = 'Q146';
				const dummyReponseWithQid = {
					query: {
						pages: [
							{
								pageprops: {
									// eslint-disable-next-line camelcase
									wikibase_item: fakeQID
								}
							}
						]
					}
				};
				beforeEach( () => {
					global.mw.Api.prototype.get.mockReturnValueOnce( $.Deferred().resolve( {} ).promise() );
					global.mw.Api.prototype.get.mockReturnValueOnce( $.Deferred().resolve( dummyReponseWithQid ).promise() );
					global.mw.ForeignApi.prototype.get.mockReturnValue( $.Deferred().resolve( commonsFakeResponse ).promise() );
				} );
				it( 'it does not trigger a commons request when wgQuickViewMediaRepositoryApiBaseUri is not set', () => {

					when( global.mw.config.get )
						.calledWith( 'wgQuickViewMediaRepositoryApiBaseUri' )
						.mockReturnValueOnce( null );
					const title = 'dummy';
					actions.handleTitleChange( context, title );

					expect( global.mw.ForeignApi.prototype.get ).not.toHaveBeenCalled();

				} );
				it( 'it does not trigger a commons request when wgQuickViewSearchFilterForQID is not set', () => {

					when( global.mw.config.get )
						.calledWith( 'wgQuickViewSearchFilterForQID' )
						.mockReturnValueOnce( null );
					const title = 'dummy';
					actions.handleTitleChange( context, title );

					expect( global.mw.ForeignApi.prototype.get ).not.toHaveBeenCalled();

				} );
				it( 'it does not trigger a commons request when wgQuickViewMediaRepositorySearchUri is not set', () => {

					when( global.mw.config.get )
						.calledWith( 'wgQuickViewMediaRepositorySearchUri' )
						.mockReturnValueOnce( null );
					const title = 'dummy';
					actions.handleTitleChange( context, title );

					expect( global.mw.ForeignApi.prototype.get ).not.toHaveBeenCalled();

				} );
				it( 'it trigger a commons request with the QID', () => {

					const title = 'dummy';
					actions.handleTitleChange( context, title );

					expect( global.mw.ForeignApi.prototype.get ).toHaveBeenCalled();
					expect( global.mw.ForeignApi.prototype.get.mock.calls[ 0 ][ 0 ].gsrsearch )
						.toContain( fakeQID );

				} );
				it( 'it trigger a commons request with the configured wgQuickViewSearchFilterForQID', () => {

					const title = 'dummy';
					actions.handleTitleChange( context, title );

					expect( global.mw.ForeignApi.prototype.get ).toHaveBeenCalled();
					expect( global.mw.ForeignApi.prototype.get.mock.calls[ 0 ][ 0 ].gsrsearch )
						.toContain( 'DummySearchFilter' ); // This is defined at the top of the file

				} );
				it( 'when commons API response has no pages, it does not update the store', () => {
					const responseWithNoPages = {
						query: {
							pages: []
						}
					};
					global.mw.ForeignApi.prototype.get.mockReturnValue( $.Deferred().resolve( responseWithNoPages ).promise() );

					const title = 'dummy';
					actions.handleTitleChange( context, title );

					expect( actions.commit ).toHaveBeenCalledTimes( 2 );

				} );
				describe( 'when commons API response includes required results', () => {
					it( 'it sorts the images by their INDEX', () => {
						const title = 'dummy';

						actions.handleTitleChange( context, title );
						expect( actions.commit ).toHaveBeenCalledTimes( 3 );
						expect( actions.commit.mock.calls[ 0 ][ 1 ].images[ 0 ].index ).toBe( 1 );
						expect( actions.commit.mock.calls[ 0 ][ 1 ].images[ 1 ].index ).toBe( 2 );
					} );
					it( 'it define if there are further results', () => {
						const title = 'dummy';

						actions.handleTitleChange( context, title );

						expect( actions.commit ).toHaveBeenCalledTimes( 3 );
						expect( actions.commit.mock.calls[ 0 ][ 1 ].hasMoreImages ).toBe( true );
					} );
					it( 'it generates a search link', () => {
						const title = 'dummy';

						actions.handleTitleChange( context, title );

						// wgQuickViewMediaRepositorySearchUri value
						expect( global.mw.Uri.mock.calls[ 0 ][ 0 ] ).toContain( 'https://FakeRepositorySearchUri.fake' );
						// wgQuickViewSearchFilterForQID value
						expect( global.mw.Uri.mock.calls[ 0 ][ 0 ] ).toContain( 'DummySearchFilter' );
						expect( global.mw.Uri.mock.calls[ 0 ][ 0 ] ).toContain( fakeQID );
					} );

				} );
			} );
			it( 'and current title had no value, update the title', () => {
				const title = 'dummy';
				actions.handleTitleChange( context, title );

				expect( actions.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenCalledWith( 'SET_TITLE', title );

			} );
			it( 'and value differs from existing title, update the title', () => {
				const title = 'dummy';
				actions.handleTitleChange( context, title );

				expect( actions.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenCalledWith( 'SET_TITLE', title );

			} );
			it( 'Update the selectedIndex title', () => {
				const title = 'dummy2';
				context.state.results = [
					{ prefixedText: 'dummy1' },
					{ prefixedText: 'dummy2' }
				];
				actions.handleTitleChange( context, title );

				expect( actions.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenCalledWith( 'SET_SELECTED_INDEX', 1 );

			} );

			it( 'Adds QuickView to history state', () => {
				const title = 'dummy';
				actions.handleTitleChange( context, title );

				expect( window.history.pushState ).toHaveBeenCalled();
				expect( window.history.pushState ).toHaveBeenCalledWith(
					expect.objectContaining(
						{ quickView: title }
					),
					null,
					expect.anything()
				);
			} );
		} );
	} );

	describe( 'navigate', () => {
		describe( 'Does not commit any action', () => {
			it( 'When called with the wrong value', () => {
				const wrongNavigation = 'doesNotExist';
				actions.navigate( context, wrongNavigation );

				expect( context.commit ).not.toHaveBeenCalled();

			} );
			it( 'When trying to navigate too far back (index -1)', () => {
				const wrongNavigation = 'previous';
				context.state.selectedIndex = 0;
				actions.navigate( context, wrongNavigation );

				expect( context.commit ).not.toHaveBeenCalled();

			} );
			it( 'When trying to navigate too forward back (index bigger than array length)', () => {
				const wrongNavigation = 'next';
				context.state.selectedIndex = 0;
				actions.navigate( context, wrongNavigation );

				expect( context.commit ).not.toHaveBeenCalled();

			} );
		} );

		describe( 'When navigating forward', () => {

			beforeEach( () => {
				context.state.results = [
					{ prefixedText: 'faketitle 1' },
					{ prefixedText: 'faketitle 2' }
				];
				context.state.selectedIndex = 0;
			} );

			afterEach( () => {
				context = null;
				actions = null;
			} );

			it( 'update the title with the next title index', () => {
				const newTitle = context.state.results[ 1 ].prefixedText;
				actions.navigate( context, 'next' );

				expect( context.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenNthCalledWith( 1, 'SET_TITLE', newTitle );

			} );

			it( 'update the selectedIndexs with the correct index', () => {
				actions.navigate( context, 'next' );

				expect( context.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenNthCalledWith( 2, 'SET_SELECTED_INDEX', 1 );

			} );
		} );

		describe( 'When navigating backward', () => {

			beforeEach( () => {
				context.state.results = [
					{ prefixedText: 'faketitle 1' },
					{ prefixedText: 'faketitle 2' }
				];
				context.state.selectedIndex = 1;
			} );

			afterEach( () => {
				context = null;
				actions = null;
			} );

			it( 'update the title with the next title index', () => {
				const newTitle = context.state.results[ 0 ].prefixedText;
				actions.navigate( context, 'previous' );

				expect( context.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenNthCalledWith( 1, 'SET_TITLE', newTitle );

			} );

			it( 'update the selectedIndexs with the correct index', () => {
				actions.navigate( context, 'previous' );

				expect( context.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenNthCalledWith( 2, 'SET_SELECTED_INDEX', 0 );

			} );
		} );
	} );

	describe( 'closeQuickView', () => {
		it( 'Set title to null', () => {
			const title = 'dummy';
			context.state.title = title;
			actions.closeQuickView( context, title );

			expect( actions.commit ).toHaveBeenCalled();
			expect( actions.commit ).toHaveBeenCalledWith( 'SET_TITLE', null );

		} );

		it( 'Set selected index to -1', () => {
			const title = 'dummy';
			context.state.title = title;
			actions.closeQuickView( context, title );

			expect( actions.commit ).toHaveBeenCalled();
			expect( actions.commit ).toHaveBeenCalledWith( 'SET_SELECTED_INDEX', -1 );

		} );
		it( 'Set sections to an empty array', () => {
			const title = 'dummy';
			context.state.title = title;
			actions.closeQuickView( context, title );

			expect( actions.commit ).toHaveBeenCalled();
			expect( actions.commit ).toHaveBeenCalledWith( 'SET_SECTIONS' );

		} );

		it( 'Set thumbnail to null', () => {
			const title = 'dummy';
			context.state.title = title;
			actions.closeQuickView( context, title );

			expect( actions.commit ).toHaveBeenCalled();
			expect( actions.commit ).toHaveBeenCalledWith( 'SET_THUMBNAIL' );

		} );

		it( 'Removes QuickView to history state', () => {
			const title = 'dummy';
			context.state.title = title;
			actions.closeQuickView( context, title );

			expect( window.history.pushState ).toHaveBeenCalled();
			expect( window.history.pushState ).toHaveBeenCalledWith(
				expect.not.objectContaining(
					{ quickView: title }
				),
				null,
				expect.anything()
			);
		} );
	} );
} );
