const initialState = require( '../../../resources/store/state.js' ),
	events = require( '../../../resources/store/modules/Event.js' ),
	when = require( 'jest-when' ).when,
	commonsFakeResponse = require( '../fixtures/commonsApiResponse.js' ),
	fakeElement = require( '../mocks/element.js' );

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
		eventsState: JSON.parse( JSON.stringify( events.state() ) ),
		getters: jest.fn(),
		commit: jest.fn(),
		dispatch: jest.fn()
	};

	context.state.results = [
		{ prefixedText: 'dummy1', thumbnail: { width: 1, height: 2 } },
		{ prefixedText: 'dummy2' }
	];

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
		describe( 'when called with empty title', () => {
			it( 'Nothing is committed', () => {
				actions.handleTitleChange( context, { nextTitle: undefined } );

				expect( context.commit ).not.toHaveBeenCalled();

			} );
		} );
		describe( 'when title provided is the same as state.title', () => {
			it( 'Dispacth a call to closeQuickView', () => {
				const title = 'dummy';
				context.state.title = title;
				actions.handleTitleChange( context, { newTitle: title } );

				expect( actions.dispatch ).toHaveBeenCalled();
				expect( actions.dispatch ).toHaveBeenCalledWith( 'closeQuickView' );

			} );
		} );
		describe( 'when called with a valid title', () => {
			it( 'retrieves article sections', () => {
				const mockSections = [ 'section1' ];
				const dummyResponse = {
					cirrusdoc: [ {
						source: {
							heading: mockSections
						}
					} ]
				};
				global.mw.Rest.prototype.get.mockReturnValueOnce( $.Deferred().resolve( dummyResponse ).promise() );
				const title = 'dummy1';
				actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

				expect( actions.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenCalledWith( 'SET_SECTIONS', mockSections );

			} );
			it( 'Setup article thumbnail height and width from the info available in the result', () => {

				const title = 'dummy1';
				actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

				expect( actions.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenCalledWith( 'SET_THUMBNAIL', context.state.results[ 0 ].thumbnail );

			} );
			it( 'updates the article thumbnail with the info received from the API', () => {
				const mockThumbnail = {
					source: 'https://fakeImageUrl',
					width: 400,
					height: 700
				};

				const dummyResponse = { thumbnail: mockThumbnail };
				global.mw.Rest.prototype.get.mockReturnValueOnce( $.Deferred().resolve( dummyResponse ).promise() );
				const title = 'dummy1';
				actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

				expect( actions.commit ).toHaveBeenCalled();
				expect( actions.commit.mock.calls[ 2 ][ 1 ] ).toEqual( dummyResponse.thumbnail );

			} );
			describe( 'when a QID is available in API response', () => {
				const fakeQID = 'Q146';
				const fakeDescription = 'Q146';
				const dummyReponseWithQid = {
					pageprops: {
						// eslint-disable-next-line camelcase
						wikibase_item: fakeQID,
						'wikibase-shortdesc': fakeDescription
					}
				};
				beforeEach( () => {
					global.mw.Rest.prototype.get.mockReturnValueOnce( $.Deferred().resolve( dummyReponseWithQid ).promise() );
					global.mw.Rest.prototype.get.mockReturnValue( $.Deferred().resolve( commonsFakeResponse ).promise() );
				} );
				it( 'it set the article description', () => {

					const title = 'dummy1';
					actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

					expect( actions.commit ).toHaveBeenCalled();
					expect( actions.commit ).toHaveBeenCalledWith( 'SET_DESCRIPTION', fakeDescription );

				} );
				it( 'it does not trigger a Rest API request when wgQuickViewMediaRepositoryApiBaseUri is not set', () => {

					when( global.mw.config.get )
						.calledWith( 'wgQuickViewMediaRepositoryApiBaseUri' )
						.mockReturnValueOnce( null );
					const title = 'dummy1';
					actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

					expect( global.mw.Rest.prototype.get ).toHaveBeenCalledTimes( 1 );

				} );
				it( 'it does not trigger a Rest API request when wgQuickViewSearchFilterForQID is not set', () => {

					when( global.mw.config.get )
						.calledWith( 'wgQuickViewSearchFilterForQID' )
						.mockReturnValueOnce( null );
					const title = 'dummy1';
					actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

					expect( global.mw.Rest.prototype.get ).toHaveBeenCalledTimes( 1 );

				} );
				it( 'it does not trigger a Rest API request when wgQuickViewMediaRepositorySearchUri is not set', () => {

					when( global.mw.config.get )
						.calledWith( 'wgQuickViewMediaRepositorySearchUri' )
						.mockReturnValueOnce( null );
					const title = 'dummy1';
					actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

					expect( global.mw.Rest.prototype.get ).toHaveBeenCalledTimes( 1 );

				} );
				it( 'it trigger a rest API request with the QID', () => {

					const title = 'dummy1';
					actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

					expect( global.mw.Rest.prototype.get ).toHaveBeenCalled();
					expect( global.mw.Rest.prototype.get ).toHaveBeenCalledWith( '/searchvue/v0/media/' + fakeQID );

				} );
				it( 'when commons API response has no pages, it does not update the store', () => {
					const responseWithNoPages = {
						query: {
							pages: []
						}
					};
					global.mw.Rest.prototype.get.mockReturnValue( $.Deferred().resolve( responseWithNoPages ).promise() );

					const title = 'dummy1';
					actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

					const allSetThumbnailRequest = actions.commit.mock.calls.filter( ( payload ) => {
						return payload[ 0 ] === 'SET_THUMBNAIL';
					} );
					expect( allSetThumbnailRequest.length ).toBe( 2 );
					expect( allSetThumbnailRequest[ 1 ][ 1 ] ).toBeFalsy();

				} );
				describe( 'when commons API response includes required results', () => {
					it( 'it sorts the images by their INDEX', () => {
						const title = 'dummy1';

						actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

						const allSetCommonsRequest = actions.commit.mock.calls.filter( ( payload ) => {
							return payload[ 0 ] === 'SET_COMMONS';
						} );

						expect( allSetCommonsRequest.length ).toBe( 1 );
						expect( allSetCommonsRequest[ 0 ][ 1 ].images[ 0 ].index ).toBe( 1 );
						expect( allSetCommonsRequest[ 0 ][ 1 ].images[ 1 ].index ).toBe( 2 );
					} );
					it( 'it define if there are further results', () => {
						const title = 'dummy1';

						actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

						const allSetCommonsRequest = actions.commit.mock.calls.filter( ( payload ) => {
							return payload[ 0 ] === 'SET_COMMONS';
						} );

						expect( allSetCommonsRequest.length ).toBe( 1 );
						expect( allSetCommonsRequest[ 0 ][ 1 ].hasMoreImages ).toBe( true );
					} );
				} );
			} );
			it( 'and current title had no value, update the title', () => {
				const title = 'dummy1';
				actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

				expect( actions.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenCalledWith( 'SET_TITLE', title );

			} );
			it( 'and value differs from existing title, update the title', () => {
				const title = 'dummy1';
				actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

				expect( actions.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenCalledWith( 'SET_TITLE', title );

			} );
			it( 'Update the selectedIndex title', () => {
				const title = 'dummy2';
				actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

				expect( actions.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenCalledWith( 'SET_SELECTED_INDEX', 1 );

			} );

			it( 'Adds QuickView to history state', () => {
				const title = 'dummy1';
				actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );

				expect( window.history.pushState ).toHaveBeenCalled();
				expect( window.history.pushState ).toHaveBeenCalledWith(
					expect.objectContaining(
						{ quickView: title }
					),
					null,
					expect.anything()
				);
			} );

			it( 'Set open-searchpreview event', () => {
				context.state.title = 'dummy1';
				const title = 'dummy2';
				const eventName = 'open-searchpreview';

				actions.handleTitleChange( context, { newTitle: title, element: fakeElement } );
				expect( context.dispatch ).toHaveBeenCalledTimes( 2 );
				expect( context.dispatch.mock.calls[ 1 ][ 0 ] ).toBe( 'events/logQuickViewEvent' );
				expect( context.dispatch.mock.calls[ 1 ][ 1 ].action ).toBe( eventName );
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
				context.state.selectedIndex = 1;
				actions.navigate( context, wrongNavigation );

				expect( context.commit ).not.toHaveBeenCalled();

			} );
		} );

		describe( 'When navigating forward', () => {

			beforeEach( () => {
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

		it( 'Set description to null', () => {
			const title = 'dummy';
			context.state.title = title;
			actions.closeQuickView( context, title );

			expect( actions.commit ).toHaveBeenCalled();
			expect( actions.commit ).toHaveBeenCalledWith( 'SET_DESCRIPTION' );

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

		it( 'Set close-searchpreview event', () => {
			const title = 'dummy';
			context.state.title = title;
			const eventName = 'close-searchpreview';

			actions.closeQuickView( context, title );
			expect( context.dispatch.mock.calls[ 0 ][ 0 ] ).toBe( 'events/logQuickViewEvent' );
			expect( context.dispatch.mock.calls[ 0 ][ 1 ].action ).toBe( eventName );

		} );

		it( 'Reset request statuses from the store', () => {
			const title = 'dummy';
			context.state.title = title;
			actions.closeQuickView( context, title );

			expect( actions.commit ).toHaveBeenCalled();
			expect( actions.commit ).toHaveBeenCalledWith( 'SET_DESCRIPTION' );

		} );

		it( 'Aborts all current Rest API request', () => {
			const title = 'dummy';
			context.state.title = title;
			actions.closeQuickView( context, title );

			expect( global.mw.Rest.prototype.abort ).toHaveBeenCalled();
		} );
	} );

	describe( 'toggleVisibily', () => {
		describe( 'on mobile', () => {

			beforeEach( () => {
				context.state.isMobile = true;
			} );

			afterEach( () => {
				context = null;
			} );

			describe( 'When called with force=true', () => {
				it( 'Set destination to false, if title is not passed', () => {
					actions.toggleVisibily( context, { force: true } );

					expect( context.commit ).toHaveBeenCalled();
					expect( context.commit ).toHaveBeenCalledWith( 'SET_DESTINATION', false );
				} );
				it( 'Set destination to title provided', () => {
					actions.toggleVisibily( context, { title: 'dummy', force: true } );

					expect( context.commit ).toHaveBeenCalled();
					expect( context.commit ).toHaveBeenCalledWith( 'SET_DESTINATION', '[data-title=\'dummy\']' );
				} );
				it( 'Set the NEXT_TITLE as null', () => {
					actions.toggleVisibily( context, { force: true } );

					expect( context.commit ).toHaveBeenCalled();
					expect( context.commit ).toHaveBeenCalledWith( 'SET_NEXT_TITLE', null );
				} );
			} );
			describe( 'When called with force=false and title is not set in the state', () => {
				it( 'Set destination to title provided', () => {
					actions.toggleVisibily( context, { title: 'dummy' } );

					expect( context.commit ).toHaveBeenCalled();
					expect( context.commit ).toHaveBeenCalledWith( 'SET_DESTINATION', '[data-title=\'dummy\']' );
				} );
			} );
			describe( 'When called with force=false and title is set in the state', () => {
				beforeEach( () => {
					context.state.title = 'titleExist';
				} );

				afterEach( () => {
					context = null;
				} );

				it( 'Set new title as NEXT_TITLE', () => {
					actions.toggleVisibily( context, { title: 'dummy' } );

					expect( context.commit ).toHaveBeenCalled();
					expect( context.commit ).toHaveBeenCalledWith( 'SET_NEXT_TITLE', 'dummy' );
				} );
				it( 'Set VISIBLE to false', () => {
					actions.toggleVisibily( context, { title: 'dummy' } );

					expect( context.commit ).toHaveBeenCalled();
					expect( context.commit ).toHaveBeenCalledWith( 'SET_COMPONENT_READY', false );
				} );
				it( 'Does not set DESTINATION', () => {
					actions.toggleVisibily( context, { title: 'dummy' } );

					expect( context.commit ).not.toHaveBeenCalledWith( 'SET_DESTINATION' );
				} );
				it( 'Does not dispatch handleTitleChange', () => {
					actions.toggleVisibily( context, { title: 'dummy' } );

					expect( context.dispatch ).not.toHaveBeenCalled();
				} );
			} );
		} );
		describe( 'on desktop', () => {

			beforeEach( () => {
				context.state.isMobile = false;
			} );

			afterEach( () => {
				context = null;
			} );

			it( 'Set destination to .searchresults', () => {

				actions.toggleVisibily( context, {} );

				expect( context.commit ).toHaveBeenCalled();
				expect( context.commit ).toHaveBeenCalledWith( 'SET_DESTINATION', '.searchresults' );
			} );
			it( 'Dispatch a title change', () => {

				actions.toggleVisibily( context, {} );

				expect( context.commit ).toHaveBeenCalled();
				expect( context.dispatch ).toHaveBeenCalledWith( 'handleTitleChange', expect.any( Object ) );
			} );
		} );
	} );
} );
