const useEventStore = require( '../../../resources/stores/Event.js' ),
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

describe( 'Events store', () => {
	describe( 'Actions', () => {
		let events;
		beforeEach( () => {
			events = useEventStore();
		} );
		describe( 'initEventLoggingSession', () => {
			beforeEach( () => {
				events.startNewEventLoggingSession = jest.fn();
			} );
			describe( 'when eventLogging is not initialized', () => {
				it( 'Triggers a startNewEventLoggingSession action', () => {
					events.initEventLoggingSession();

					expect( events.startNewEventLoggingSession ).toHaveBeenCalled();
				} );
				it( 'Does not expand session expiration', () => {
					events.initEventLoggingSession();

					expect( global.mw.storage.set ).not.toHaveBeenCalled();
				} );
			} );
			describe( 'when sessionId is already initialized', () => {
				beforeEach( () => {
					events.sessionId = 'dummySessionId';
				} );
				it( 'Does not triggers a startNewEventLoggingSession action', () => {
					events.initEventLoggingSession();

					expect( events.startNewEventLoggingSession ).not.toHaveBeenCalled();
				} );
				it( 'Expand the session expiration', () => {
					events.initEventLoggingSession();

					expect( global.mw.storage.set ).toHaveBeenCalled();
				} );
			} );
		} );
		describe( 'startNewEventLoggingSession', () => {
			describe( 'when eventLogging is not initialized', () => {
				it( 'Creates a new session', () => {
					events.startNewEventLoggingSession();

					expect( events.sessionId ).toContain( 'fakeRandomSession' );
				} );
				it( 'Logs "new-session" event', ( done ) => {
					events.startNewEventLoggingSession()
						.then( () => {
							expect( mw.eventLog.submit ).toHaveBeenCalled();
							expect( mw.eventLog.submit ).toHaveBeenCalledWith(
								'mediawiki.searchpreview',
								expect.objectContaining( {
									action: 'new-session',
									// eslint-disable-next-line camelcase
									result_display_position: -1
								} )
							);
							done();
						} );
				} );
			} );
			describe( 'when eventLogging is already initialized', () => {
				beforeEach( () => {
					events.sessionId = 'dummySessionId';
				} );
				it( 'Should not create a new session', () => {
					events.startNewEventLoggingSession();

					expect( events.sessionId ).toBe( 'dummySessionId' );
				} );
				it( 'Should not logs "new-session" event', () => {
					events.startNewEventLoggingSession();

					expect( mw.eventLog.submit ).not.toHaveBeenCalled();
				} );
			} );
		} );
		describe( 'logQuickViewEvent', () => {
			let dummyPayload;
			beforeEach( () => {
				dummyPayload = {
					action: 'dummy-action',
					selectedIndex: 10
				};
				events.startNewEventLoggingSession = jest.fn().mockImplementationOnce( () => {
					events.sessionId = 'dummySessionId';
				} );
			} );
			describe( 'when the "action" parameter is missing', () => {
				it( 'Does not perform any action', () => {
					events.logQuickViewEvent( dummyPayload );

					expect( mw.eventLog.submit ).not.toHaveBeenCalled();
				} );
			} );
			describe( 'when sessionId is missing', () => {
				it( 'Creates a new session', () => {
					events.logQuickViewEvent( dummyPayload );

					expect( events.startNewEventLoggingSession ).toHaveBeenCalled();
				} );
			} );
			describe( 'when all parameters are set and session exist', () => {
				beforeEach( () => {
					events.sessionId = 'dummySessionId';
				} );
				it( 'Should not create a new session', () => {
					events.logQuickViewEvent( dummyPayload );

					expect( events.startNewEventLoggingSession ).not.toHaveBeenCalled();
				} );
				it( 'Should log a "dummy-action" event', ( done ) => {
					events.logQuickViewEvent( dummyPayload )
						.then( () => {
							expect( mw.eventLog.submit ).toHaveBeenCalled();
							expect( mw.eventLog.submit ).toHaveBeenCalledWith(
								'mediawiki.searchpreview',
								expect.objectContaining( {
									action: 'dummy-action',
									// eslint-disable-next-line camelcase
									result_display_position: 10
								} )
							);
							done();
						} );
				} );
			} );
		} );
	} );
} );
