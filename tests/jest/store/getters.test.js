const initialState = require( '../../../resources/store/state.js' ),
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
				dummyState.thumbnail = {
					source: 'https://picsum.photos/400/700',
					width: 400,
					height: 700
				};
				dummyState.media = {
					images: [ 'myDummyImage' ],
					hasMoreImages: true,
					searchLink: 'dummyLink'
				};
				dummyState.description = 'DummyDescriptio ';
				dummyState.links = [ 'dummyLink' ];
				dummyState.expandedSnippet = 'dummyExpandedSnippet';
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
			it( 'includes thumbnail from state', () => {
				const result = getters.currentResult( dummyState );

				expect( result ).toEqual(
					expect.objectContaining( { thumbnail: dummyState.thumbnail } )
				);
			} );
			it( 'includes media object from state', () => {
				const result = getters.currentResult( dummyState );

				expect( result ).toEqual(
					expect.objectContaining( { media: dummyState.media } )
				);
			} );
			it( 'includes description from state', () => {
				const result = getters.currentResult( dummyState );

				expect( result ).toEqual(
					expect.objectContaining( { description: dummyState.description } )
				);
			} );
			it( 'includes links array from state', () => {
				const result = getters.currentResult( dummyState );

				expect( result ).toEqual(
					expect.objectContaining( { links: dummyState.links } )
				);
			} );
			it( 'includes expandedSnippet from state', () => {
				const result = getters.currentResult( dummyState );

				expect( result ).toEqual(
					expect.objectContaining( { expandedSnippet: dummyState.expandedSnippet } )
				);
			} );
		} );
	} );
} );
