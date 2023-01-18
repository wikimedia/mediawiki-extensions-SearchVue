const events = require( '../../../resources/store/modules/Event.js' ),
	when = require( 'jest-when' ).when;

let dummyState;
const initialState = events.state();

when( global.mw.config.get )
	.calledWith( 'wgDBname' )
	.mockReturnValue( 'fakeDbName' );
when( global.mw.config.get )
	.calledWith( 'skin' )
	.mockReturnValue( 'minerva' );

beforeEach( () => {
	dummyState = JSON.parse( JSON.stringify( initialState ) );
} );

describe( 'Events store', () => {
	describe( 'Actions', () => {
		let context;
		beforeEach( () => {
			context = {
				commit: jest.fn(),
				dispatch: jest.fn(),
				state: JSON.parse( JSON.stringify( initialState ) )
			};
		} );
		describe( 'initEventLoggingSession', () => {
			describe( 'when eventLogging is not initialized', () => {
				it( 'Creates a new session', () => {
					events.actions.initEventLoggingSession( context );

					expect( context.dispatch ).toHaveBeenCalled();
					expect( context.dispatch ).toHaveBeenCalledWith( 'startNewEventLoggingSession' );
				} );
			} );
			describe( 'when eventLogging is already initialized', () => {
				beforeEach( () => {
					context.state = Object.assign(
						dummyState,
						{
							sessionId: 'dummySessionId'
						}
					);
				} );
				it( 'Should commit the same session ID', () => {
					events.actions.initEventLoggingSession( context );

					expect( context.commit ).toHaveBeenCalled();
					expect( context.commit ).toHaveBeenCalledWith(
						'SET_SESSION_ID',
						expect.stringContaining( 'dummySessionId' )
					);
				} );
				it( 'Should not create a new session', () => {
					events.actions.initEventLoggingSession( context );

					expect( context.dispatch ).not.toHaveBeenCalled();
				} );
			} );
		} );
		describe( 'startNewEventLoggingSession', () => {
			describe( 'when eventLogging is not initialized', () => {
				it( 'Creates a new session', () => {
					events.actions.startNewEventLoggingSession( context );

					expect( context.commit ).toHaveBeenCalled();
					expect( context.commit ).toHaveBeenCalledWith(
						'SET_SESSION_ID',
						expect.stringContaining( 'fakeRandomSession' )
					);
				} );
				it( 'Logs "new-session" event', ( done ) => {
					events.actions.startNewEventLoggingSession( context )
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
					context.state = Object.assign(
						dummyState,
						{
							sessionId: 'dummySessionId'
						}
					);
				} );
				it( 'Should not create a new session', () => {
					events.actions.startNewEventLoggingSession( context );

					expect( context.commit ).not.toHaveBeenCalled();
				} );
				it( 'Should not logs "new-session" event', () => {
					const actionResult = events.actions.startNewEventLoggingSession( context );

					// If undefined it means that there is no promise and the action has returned
					expect( actionResult ).toBeFalsy();
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
			} );
			describe( 'when the "action" parameter is missing', () => {
				it( 'Does not perform any action', () => {
					dummyPayload.action = null;
					const result = events.actions.logQuickViewEvent( context, dummyPayload );

					expect( result ).toBeFalsy();
				} );
			} );
			describe( 'when sessionId is missing', () => {
				it( 'Creates a new session', () => {
					events.actions.logQuickViewEvent( context, dummyPayload );

					expect( context.dispatch ).toHaveBeenCalled();
					expect( context.dispatch ).toHaveBeenCalledWith( 'startNewEventLoggingSession' );
				} );
				it( 'Re-dispatches log action with same data', () => {
					events.actions.logQuickViewEvent( context, dummyPayload );

					expect( context.dispatch ).toHaveBeenCalled();
					expect( context.dispatch ).toHaveBeenCalledWith( 'logQuickViewEvent', dummyPayload );
				} );
			} );
			describe( 'when all parameters are set and session exist', () => {
				beforeEach( () => {
					context.state = Object.assign(
						dummyState,
						{
							sessionId: 'dummySessionId'
						}
					);
				} );
				it( 'Should not create a new session', () => {
					events.actions.logQuickViewEvent( context, dummyPayload );

					expect( context.commit ).not.toHaveBeenCalled();
				} );
				it( 'Should log a "dummy-action" event', ( done ) => {
					events.actions.logQuickViewEvent( context, dummyPayload )
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
	describe( 'Mutation', () => {
		describe( 'SET_SESSION_ID', () => {
			it( 'changes the sessionId in state', () => {
				const dummySessionId = 'dummySessionId';
				events.mutations.SET_SESSION_ID( dummyState, dummySessionId );
				expect( dummyState.sessionId ).toEqual( dummySessionId );
			} );
			it( 'set the SessionId in session Storage', () => {
				const dummySessionId = 'dummySessionId';
				events.mutations.SET_SESSION_ID( dummyState, dummySessionId );
				expect( global.mw.storage.set ).toHaveBeenCalled();
			} );
		} );
	} );
} );
