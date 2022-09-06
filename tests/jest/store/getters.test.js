const initialState = require( '../fixtures/initialVuexState.js' ),
	getters = require( '../../../resources/store/getters.js' );

let dummyState;

beforeEach( () => {
	dummyState = JSON.parse( JSON.stringify( initialState ) );
} );

afterEach( () => {
	dummyState = null;
} );

describe( 'Getters', () => {
	describe( 'currentResult', () => {
		describe( 'returns an empty object', () => {
			it( 'when selectedIndex is -1', () => {
				const result = getters.currentResult( dummyState );

				expect( result ).toEqual( {} );
			} );

			it( 'when results does not have selected index', () => {
				dummyState.selectedIndex = 10;
				dummyState.results = [
					'just one entry'
				];
				const result = getters.currentResult( dummyState );

				expect( result ).toEqual( {} );
			} );
		} );
		describe( 'when current result exist in state', () => {
			beforeEach( () => {
				dummyState.selectedIndex = 0;
				dummyState.results = [
					{ title: 'dummyTitle' }
				];
				dummyState.sections = [
					'myDummySection'
				];
			} );
			it( 'includes the selected results', () => {
				const result = getters.currentResult( dummyState );

				expect( result ).toEqual(
					expect.objectContaining( dummyState.results[ dummyState.selectedIndex ] )
				);
			} );
			it( 'includes sections from state', () => {
				const result = getters.currentResult( dummyState );

				expect( result ).toEqual(
					expect.objectContaining( { sections: dummyState.sections } )
				);
			} );
		} );
	} );
} );
