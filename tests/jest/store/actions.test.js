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
		it( 'Set title to null when called with undefined', () => {
			actions.handleTitleChange( context, undefined );

			expect( actions.commit ).toHaveBeenCalled();
			expect( actions.commit ).toHaveBeenCalledWith( 'SET_TITLE', null );

		} );
		it( 'Set title to null when title provided is the same as state.title', () => {
			const title = 'dummy';
			context.state.title = title;
			actions.handleTitleChange( context, title );

			expect( actions.commit ).toHaveBeenCalled();
			expect( actions.commit ).toHaveBeenCalledWith( 'SET_TITLE', null );

		} );
		it( 'Set title to value provided if state.title is empty', () => {
			const title = 'dummy';
			actions.handleTitleChange( context, title );

			expect( actions.commit ).toHaveBeenCalled();
			expect( actions.commit ).toHaveBeenCalledWith( 'SET_TITLE', title );
		} );
		it( 'Set title to value provided if state.title is different than value provided', () => {
			const existingTitle = 'existing';
			const newTitle = 'newTitle';
			context.state.title = existingTitle;

			actions.handleTitleChange( context, newTitle );

			expect( actions.commit ).toHaveBeenCalled();
			expect( actions.commit ).toHaveBeenCalledWith( 'SET_TITLE', newTitle );
		} );
	} );
} );
