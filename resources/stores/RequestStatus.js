'use strict';

const Pinia = require( 'pinia' );

const requestStatuses = {
	notStarted: 'Not started',
	inProgress: 'In progress',
	done: 'Done',
	error: 'error'
};

const useRequestStatusStore = Pinia.defineStore( 'requestStatus', {
	state: () => ( {
		requestStatuses: requestStatuses,
		requestStatus: {
			query: requestStatuses.notStarted,
			media: requestStatuses.notStarted
		}
	} ),
	getters: {
		/**
		 * Define if any part of the search preview are still in a loading state
		 *
		 * @param {Object} state
		 *
		 * @return {boolean}
		 */
		loading: ( state ) => {
			for ( const property in state.requestStatus ) {
				if ( state.requestStatus[ property ] === state.requestStatuses.inProgress ) {
					return true;
				}
			}

			return false;
		}
	},
	actions: {
		/**
		 * Updates the status of a current API requests
		 *
		 * @param {Object} payload
		 * @param {string} payload.type
		 * @param {string} payload.status
		 */
		setRequestStatus( payload ) {
			if ( this.requestStatus[ payload.type ] ) {
				this.requestStatus[ payload.type ] = payload.status;
			}
		},
		/**
		 * Updates the status of a current API requests
		 *
		 * @param {Object} state
		 */
		resetRequestStatus() {
			for ( const property in this.requestStatus ) {
				this.requestStatus[ property ] = this.requestStatuses.notStarted;
			}
		}
	}
} );

module.exports = useRequestStatusStore;
