'use strict';

const Pinia = require( 'pinia' );

const SESSION_STORAGE_KEY = 'searchvue-session-id';
const SESSION_EXPIRATION = 10 * 60;

/**
 * Generate a unique token. Appends timestamp in base 36 to increase
 * uniqueness of the token.
 *
 * @return {string}
 */
function randomToken() {
	return mw.user.generateRandomSessionId() + Date.now().toString( 36 );
}

/**
 * @typedef {Object} StaticEventData
 * @property {string} schema
 * @property {string} wikiId
 * @property {string} platform
 * @property {boolean} isAnon
 * @property {string} sessionId
 */

/**
 * @typedef {Object} VariableEventData
 * @property {string} action
 * @property {number} selectedIndex
 */

/**
 * @typedef {Object} EventLogData
 * @property {string} $schema
 * @property {string} action
 * @property {string} result_display_position
 * @property {string} wiki_id
 * @property {string} platform
 * @property {boolean} is_anon
 * @property {string} session_id
 */

/**
 * @param {StaticEventData} staticData
 * @param {VariableEventData} variableData
 * @return {EventLogData}
 */
function createEvent( staticData, variableData ) {
	/* eslint-disable camelcase */
	return {
		$schema: staticData.schema,
		action: variableData.action,
		result_display_position: variableData.selectedIndex,
		wiki_id: staticData.wikiId,
		platform: staticData.platform,
		is_anon: staticData.isAnon,
		session_id: staticData.sessionId
	};
	/* eslint-enable camelcase */
}

/**
 * This method first ensure that the event logging extension is loaded, and then triggers events.
 *
 * @param {EventLogData} event
 * @return {Promise}
 */
function loadEventLoggingAndSendEvent( event ) {
	return mw.loader.using( [ 'ext.eventLogging' ] ).then( function () {
		mw.eventLog.submit( 'mediawiki.searchpreview', event );
	} );
}

function expandSessionExpiration( sessionId ) {
	mw.storage.set( SESSION_STORAGE_KEY, sessionId, SESSION_EXPIRATION );
}

const useEventStore = Pinia.defineStore( 'event', {
	state: () => ( {
		sessionId: mw.storage.get( SESSION_STORAGE_KEY ),
		schema: '/analytics/mediawiki/searchpreview/3.0.0',
		wikiId: mw.config.get( 'wgDBname' ),
		platform: mw.config.get( 'skin' ) === 'minerva' ? 'mobile' : 'desktop',
		isAnon: mw.user.isAnon()
	} ),
	actions: {
		/**
		 * A "search session" comprises all searches happening within
		 * a certain period of time (10 minutes) after the last search.
		 *
		 * It doesn't matter what users had been doing in the meantime -
		 * whether they initiated new searches, visited other pages,
		 * interacted or idled on the same search result - until 10
		 * minutes have passed since initiating the previous search,
		 * subsequent searches will be considered part of the same session.
		 *
		 * After a hiatus of 10 minutes where no new searches have been
		 * initiated, a new search will be regarded as a new session.
		 *
		 */
		initEventLoggingSession() {
			// If we already have a session, we're fine!
			// We just need to commit the existing session id once more;
			// since this is another new search, the existing search session
			// is to be extended for another 10 minutes, and we need to
			// update the TTL of the session ID
			if ( this.sessionId ) {
				expandSessionExpiration( this.sessionId );
				return;
			}

			this.startNewEventLoggingSession();
		},

		/**
		 * @return {Promise|undefined}
		 */
		startNewEventLoggingSession() {
			if ( this.sessionId ) {
				// Failsafe in case a freak race condition lands us here despite
				// having an active session
				return;
			}

			// Upon invoking this, it must have become clear that there was no
			// active session, and we must initiate a new one
			const newSessionId = randomToken();
			expandSessionExpiration( newSessionId );
			this.sessionId = newSessionId;

			// Log the session initialization so that we're able to track how many
			// search sessions there have been, even if there is no other interaction
			// with SearchVue
			const eventData = { action: 'new-session', selectedIndex: -1 };
			const event = createEvent( this, eventData );
			return loadEventLoggingAndSendEvent( event );
		},

		/*
		 * @param {VariableEventData} payload
		 * @return {Promise|undefined}
		 */
		logQuickViewEvent( payload ) {
			if ( !payload || !payload.action ) {
				return;
			}

			// Make sure that a session has been started and a session id is known;
			// this should always be the case since it's explicitly called right
			// after startup, but we're still going to add it here once more to
			// prevent against perfectly-timed race conditions
			if ( !this.sessionId ) {
				this.startNewEventLoggingSession();
				// Since we're lacking the session ID (which will not be available
				// until startNewEventLoggingSession ends up being executed,
				// asynchronously), we can't log the event straight away.
				// Instead, we'll just dispatch this exact same call again: once
				// the dispatcher gets around to invoking it the next time, the
				// session will be available, and we can log it then
				this.logQuickViewEvent( payload );
				return;
			}

			const event = createEvent( this, payload );
			return loadEventLoggingAndSendEvent( event );
		}
	}
} );

module.exports = useEventStore;
