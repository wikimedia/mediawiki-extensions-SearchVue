const useStore = require( '../../../resources/stores/Root.js' ),
	Pinia = require( 'pinia' ),
	fakeElement = require( '../mocks/element.js' ),
	useMediaStore = require( '../../../resources/stores/Media.js' ),
	useQueryStore = require( '../../../resources/stores/Query.js' ),
	useEventStore = require( '../../../resources/stores/Event.js' );
require( '../mocks/history.js' );

beforeEach( () => {
	Pinia.setActivePinia( Pinia.createPinia() );
} );

describe( 'Root store', () => {
	let store;
	let media;
	let query;
	let event;
	beforeEach( () => {
		store = useStore();
	} );
	describe( 'getters', () => {
		describe( 'currentResult', () => {
			describe( 'returns an empty object', () => {
				it( 'when selectedIndex is -1', () => {
					const result = store.currentResult;

					expect( result ).toEqual( {} );
				} );

				it( 'when results does not have selected index', () => {
					store.selectedIndex = 10;
					store.results = [
						'just one entry'
					];
					const result = store.currentResult;

					expect( result ).toEqual( {} );
				} );
			} );
			describe( 'when current result exist in state', () => {
				let result;
				beforeEach( () => {

					media = useMediaStore();
					query = useQueryStore();
					store.selectedIndex = 0;
					store.results = [
						{ title: 'dummyTitle' }
					];
					query.sections = [
						'myDummySection'
					];
					query.thumbnail = {
						source: 'https://picsum.photos/400/700',
						width: 400,
						height: 700
					};
					media.media = {
						images: [ 'myDummyImage' ],
						hasMoreImages: true,
						searchLink: 'dummyLink'
					};
					query.description = 'DummyDescriptio ';
					media.links = [ 'dummyLink' ];
					query.expandedSnippet = 'dummyExpandedSnippet';

					result = store.currentResult;
				} );
				it( 'includes the selected results', () => {

					expect( result ).toEqual(
						expect.objectContaining( store.results[ store.selectedIndex ] )
					);
				} );
				it( 'includes sections from state', () => {

					expect( result ).toEqual(
						expect.objectContaining( { sections: query.sections } )
					);
				} );
				it( 'includes thumbnail from state', () => {

					expect( result ).toEqual(
						expect.objectContaining( { thumbnail: query.thumbnail } )
					);
				} );
				it( 'includes media object from state', () => {

					expect( result ).toEqual(
						expect.objectContaining( { media: media.media } )
					);
				} );
				it( 'includes description from state', () => {

					expect( result ).toEqual(
						expect.objectContaining( { description: query.description } )
					);
				} );
				it( 'includes links array from state', () => {

					expect( result ).toEqual(
						expect.objectContaining( { links: media.links } )
					);
				} );
				it( 'includes expandedSnippet from state', () => {
					expect( result ).toEqual(
						expect.objectContaining( { expandedSnippet: query.expandedSnippet } )
					);
				} );
			} );
		} );
		describe( 'visible', () => {
			it( 'Returns `true` when title is set', () => {
				store.title = 'Dummy';
				const result = store.visible;

				expect( result ).toBeTruthy();
			} );
			it( 'Returns `false` when title is not set', () => {
				store.title = '';
				const result = store.visible;

				expect( result ).toBeFalsy();
			} );
		} );
		describe( 'toggleVisibily', () => {
			describe( 'on mobile', () => {
				beforeEach( () => {
					store.isMobile = true;
					store.handleTitleChange = jest.fn();
				} );
				it( 'Set destination to false, if title is not passed', () => {
					store.toggleVisibily( {} );

					expect( store.destination ).toBeFalsy();
				} );
				it( 'Set destination to title provided', () => {
					const title = 'dummy';

					store.toggleVisibily( { title: title } );
					expect( store.destination ).toContain( title );
				} );
			} );
			describe( 'on desktop', () => {

				beforeEach( () => {
					store.isMobile = false;
					store.handleTitleChange = jest.fn();
				} );
				it( 'Set destination to .searchresults', () => {
					store.toggleVisibily( {} );

					expect( store.destination ).toContain( 'searchresults' );
				} );
				it( 'Dispatch a title change', () => {
					store.toggleVisibily( {} );

					expect( store.handleTitleChange ).toHaveBeenCalled();
				} );
			} );
		} );
		describe( 'handleTitleChange', () => {
			beforeEach( () => {
				query = useQueryStore();
				media = useMediaStore();
				event = useEventStore();
				store.results = [
					{ prefixedText: 'dummy1', thumbnail: { width: 1, height: 2 } },
					{ prefixedText: 'dummy2' }
				];
				store.closeQuickView = jest.fn();
			} );
			describe( 'when called with empty title', () => {
				it( 'Nothing is committed', () => {
					store.handleTitleChange( {} );

					expect( store.closeQuickView ).not.toHaveBeenCalled();

				} );
			} );
			describe( 'when title provided is the same as state.title', () => {
				it( 'Dispatch a call to closeQuickView', () => {
					const title = 'dummy';
					store.title = title;
					store.closeQuickView = jest.fn();
					store.handleTitleChange( { newTitle: title } );

					expect( store.closeQuickView ).toHaveBeenCalled();

				} );
			} );
			describe( 'when called with a valid title', () => {

				it( 'Setup article thumbnail height and width from the info available in the result', () => {

					const title = 'dummy1';
					store.handleTitleChange( { newTitle: title, element: fakeElement } );

					expect( query.thumbnail ).toEqual( store.results[ 0 ].thumbnail );

				} );
				it( 'triggers a `retrieveInfoFromQuery` action', () => {
					query.retrieveInfoFromQuery = jest.fn();

					const title = 'dummy1';
					store.handleTitleChange( { newTitle: title, element: fakeElement } );

					expect( query.retrieveInfoFromQuery ).toHaveBeenCalled();

				} );
				it( 'and current title had no value, update the title', () => {
					const title = 'dummy1';
					store.handleTitleChange( { newTitle: title, element: fakeElement } );

					expect( store.title ).toEqual( title );

				} );
				it( 'and value differs from existing title, update the title', () => {
					const title = 'dummy1';
					store.handleTitleChange( { newTitle: title, element: fakeElement } );

					expect( store.title ).toEqual( title );

				} );

				it( 'Adds QuickView to history state', () => {
					const title = 'dummy1';
					store.handleTitleChange( { newTitle: title, element: fakeElement } );

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
					event.logQuickViewEvent = jest.fn();
					store.title = 'dummy1';
					const title = 'dummy2';
					const eventName = 'open-searchpreview';

					store.handleTitleChange( { newTitle: title, element: fakeElement } );
					expect( event.logQuickViewEvent.mock.calls[ 0 ][ 0 ].action ).toBe( eventName );
				} );
			} );
		} );

		describe( 'navigate', () => {
			const dummyTitle = 'dummy';
			beforeEach( () => {
				store.title = dummyTitle;
			} );
			describe( 'Does not commit any action', () => {
				it( 'When called with the wrong value', () => {
					const wrongNavigation = 'doesNotExist';
					store.navigate( wrongNavigation );

					expect( store.title ).toEqual( dummyTitle );

				} );
				it( 'When trying to navigate too far back (index -1)', () => {
					const wrongNavigation = 'previous';
					store.selectedIndex = 0;
					store.navigate( wrongNavigation );

					expect( store.title ).toEqual( dummyTitle );

				} );
				it( 'When trying to navigate too forward back (index bigger than array length)', () => {
					const wrongNavigation = 'next';
					store.selectedIndex = 1;
					store.navigate( wrongNavigation );

					expect( store.title ).toEqual( dummyTitle );

				} );
			} );

			describe( 'When navigating forward', () => {

				beforeEach( () => {
					store.selectedIndex = 0;
					store.results = [
						{ prefixedText: 'dummy1', thumbnail: { width: 1, height: 2 } },
						{ prefixedText: 'dummy2' }
					];
				} );

				it( 'update the title with the next title index', () => {
					const newTitle = store.results[ 1 ].prefixedText;
					store.navigate( 'next' );

					expect( store.title ).toEqual( newTitle );

				} );

				it( 'update the selectedIndexs with the correct index', () => {
					store.navigate( 'next' );

					expect( store.selectedIndex ).toBe( 1 );

				} );
			} );

			describe( 'When navigating backward', () => {

				beforeEach( () => {
					store.selectedIndex = 1;
					store.results = [
						{ prefixedText: 'dummy1', thumbnail: { width: 1, height: 2 } },
						{ prefixedText: 'dummy2' }
					];
				} );

				it( 'update the title with the next title index', () => {
					const newTitle = store.results[ 0 ].prefixedText;
					store.navigate( 'previous' );

					expect( store.title ).toEqual( newTitle );

				} );

				it( 'update the selectedIndexs with the correct index', () => {
					store.navigate( 'previous' );

					expect( store.selectedIndex ).toEqual( 0 );

				} );
			} );
		} );

		describe( 'closeQuickView', () => {
			const title = 'dummy';
			beforeEach( () => {
				query = useQueryStore();
				media = useMediaStore();
				event = useEventStore();
				store.title = title;
				query.reset = jest.fn();
			} );
			it( 'Set title to null', () => {
				store.closeQuickView();

				expect( store.title ).toEqual( null );

			} );

			it( 'Set selected index to -1', () => {
				store.closeQuickView();

				expect( store.selectedIndex ).toEqual( -1 );

			} );
			it( 'Reset query store', () => {
				store.closeQuickView();

				expect( query.reset ).toHaveBeenCalled();

			} );
			it( 'Reset media store', () => {
				media.$reset = jest.fn();
				store.closeQuickView();

				expect( media.$reset ).toHaveBeenCalled();

			} );

			it( 'Removes QuickView to history state', () => {
				store.closeQuickView();

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
				event.logQuickViewEvent = jest.fn();
				const eventName = 'close-searchpreview';

				store.closeQuickView();
				expect( event.logQuickViewEvent ).toHaveBeenCalled();
				expect( event.logQuickViewEvent.mock.calls[ 0 ][ 0 ].action ).toBe( eventName );

			} );

			it( 'Aborts `media` API in-flight request', () => {
				media.abort = jest.fn();
				store.closeQuickView();

				expect( media.abort ).toHaveBeenCalled();
			} );

			it( 'Aborts `query` API in-flight request', () => {
				query.abort = jest.fn();
				store.closeQuickView();

				expect( query.abort ).toHaveBeenCalled();
			} );
		} );
	} );
} );
