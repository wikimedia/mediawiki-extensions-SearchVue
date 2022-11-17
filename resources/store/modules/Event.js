const events = {
	namespaced: true,
	state: () => ( {
		sessionId: null,
		schema: null,
		wikiId: null,
		platform: null
	} ),
	mutations: {
		SET_QUICK_VIEW_EVENT_PROPS: ( state, { schema, wikiId, platform } ) => {
			state.schema = schema;
			state.wikiId = wikiId;
			state.platform = platform;
		},
		SET_SESSION_ID: ( state, sessionId ) => {
			state.sessionId = sessionId;
		}
	},
	actions: {
		/**
		 * @param {Object} context
		 * @param {Function} context.commit
		 */
		setQuickViewEventProps: ( context ) => {
			const data = {
				schema: '/analytics/mediawiki/searchpreview/1.0.0',
				wikiId: mw.config.get( 'wgDBname' ),
				platform: mw.config.get( 'skin' ) === 'minerva' ? 'mobile' : 'desktop'
			};
			context.commit( 'SET_QUICK_VIEW_EVENT_PROPS', data );
		},

		/**
		 * @param {Object} context
		 * @param {string} action
		 */
		logQuickViewEvent: ( context, { action, selectedIndex } ) => {

			if ( !action ) {
				return;
			}

			return mw.loader.using( [ 'ext.eventLogging', 'ext.wikimediaEvents' ] ).then( function () {

				context.commit( 'SET_SESSION_ID', mw.storage.get( 'wmE-sS--sessionId' ) );
				/* eslint-disable camelcase */
				const eventLogData = {
					$schema: context.state.schema,
					action,
					result_display_position: selectedIndex,
					wiki_id: context.state.wikiId,
					platform: context.state.platform,
					// session id requires ext.wikimediaEvents (which is the module that contains
					// searchSatisfaction.js, where the session ID is generated) is loaded
					session_id: context.state.sessionId
				};

				mw.eventLog.submit( 'mediawiki.searchpreview', eventLogData );
			} );
		}
	}
};

module.exports = events;
