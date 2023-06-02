const useStore = require( '../../../resources/stores/RequestStatus.js' ),
	Pinia = require( 'pinia' ),
	when = require( 'jest-when' ).when;

when( global.mw.config.get )
	.calledWith( 'wgDBname' )
	.mockReturnValue( 'fakeDbName' );
when( global.mw.config.get )
	.calledWith( 'skin' )
	.mockReturnValue( 'minerva' );

beforeEach( () => {
	Pinia.setActivePinia( Pinia.createPinia() );
} );

describe( 'Request status store', () => {
	let store;
	beforeEach( () => {
		store = useStore();
	} );
	describe( 'loading', () => {
		it( 'Return True if any of request is `in progress`', () => {
			store.requestStatus.query = store.requestStatuses.inProgress;
			const result = store.loading;

			expect( result ).toBeTruthy();
		} );
		it( 'Return False if request is in `error` state', () => {
			store.requestStatus.query = store.requestStatuses.error;
			const result = store.loading;

			expect( result ).toBeFalsy();
		} );
		it( 'Return False if request is in `notStarted` state', () => {
			store.requestStatus.query = store.requestStatuses.notStarted;
			const result = store.loading;

			expect( result ).toBeFalsy();
		} );
		it( 'Return False if request is in `done` state', () => {
			store.requestStatus.query = store.requestStatuses.done;
			const result = store.loading;

			expect( result ).toBeFalsy();
		} );
	} );
	describe( 'setRequestStatus', () => {
		it( 'Does not change anything if `type` is incorrect', () => {
			const dummyPayload = {
				type: 'incorrectType'
			};
			store.setRequestStatus( dummyPayload );

			expect( store.requestStatus[ dummyPayload.type ] ).toBeFalsy();
		} );
		it( 'Changes the requestStatus when correct payload is passed', () => {
			const dummyPayload = {
				type: 'query',
				status: 'myStatus'
			};
			store.setRequestStatus( dummyPayload );

			expect( store.requestStatus[ dummyPayload.type ] ).toBe( dummyPayload.status );
		} );
	} );
	describe( 'resetRequestStatus', () => {
		it( 'Reset all statuses to notStarted', () => {

			store.$patch(
				{
					requestStatus: {
						query: 'dummy',
						media: 'dummy'
					}
				}
			);
			expect( store.requestStatus.query ).toBe( 'dummy' );
			expect( store.requestStatus.media ).toBe( 'dummy' );

			store.resetRequestStatus();

			expect( store.requestStatus.query ).not.toBe( 'dummy' );
			expect( store.requestStatus.media ).not.toBe( 'dummy' );
		} );
	} );
} );
