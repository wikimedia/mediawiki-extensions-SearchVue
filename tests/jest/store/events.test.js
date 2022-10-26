const events = require( '../../../resources/store/modules/Event.js' );

let dummyState;
const initialState = events.state();

beforeEach( () => {
	dummyState = JSON.parse( JSON.stringify( initialState ) );
} );

describe( 'Events store', () => {
	it( 'All initial state props equal to null', () => {
		// eslint-disable-next-line es/no-object-values
		Object.values( initialState ).forEach( ( prop ) => {
			expect( prop ).toBeNull();
		} );
	} );
	it( 'Mutate the initial event state', () => {
		const initialData = {
			sessionId: null,
			schema: '/analytics/mediawiki/searchpreview/1.0.0',
			wikiId: 'wiki',
			platform: 'desktop'
		};

		events.mutations.SET_QUICK_VIEW_EVENT_PROPS( dummyState, initialData );

		expect( dummyState ).toStrictEqual( initialData );
	} );
	it( 'Set session id', () => {
		const dummySessionId = '1a0eadeb09fa71f58a0blzxtwolt';
		events.mutations.SET_SESSION_ID( dummyState, dummySessionId );

		expect( dummyState.sessionId ).toEqual( dummySessionId );
	} );
} );
