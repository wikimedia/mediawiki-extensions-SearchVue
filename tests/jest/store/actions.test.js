const initialState = require( '../fixtures/initialVuexState.js' );

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
} );

afterEach( () => {
	context = null;
	actions = null;
} );

// this tests are focused at the internal search function
describe( 'Actions', () => {
	describe( 'handleTitleChange', () => {
		describe( 'when called with undefined', () => {
			it( 'Nothing is committed', () => {
				actions.handleTitleChange( context, undefined );

				expect( context.commit ).not.toHaveBeenCalled();

			} );
		} );
		describe( 'when title provided is the same as state.title', () => {
			it( 'Set title to null', () => {
				const title = 'dummy';
				context.state.title = title;
				actions.handleTitleChange( context, title );

				expect( actions.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenCalledWith( 'SET_TITLE', null );

			} );
			it( 'Set selected index to -1', () => {
				const title = 'dummy';
				context.state.title = title;
				actions.handleTitleChange( context, title );

				expect( actions.commit ).toHaveBeenCalled();
				expect( actions.commit ).toHaveBeenCalledWith( 'SET_SELECTED_INDEX', -1 );

			} );
		} );
		describe( 'when called with a valid title', () => {
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
} );
