'use strict';

const Pinia = require( 'pinia' );

const useTimingStore = Pinia.defineStore( 'timing', {
	state: () => ( {
		startTime: 0
	} ),
	getters: {
	},
	actions: {
		/**
		 * Marks when loading started
		 */
		start() {
			this.startTime = performance.now();
		},
		/**
		 * Reports load timing, if available
		 */
		complete() {
			if ( !this.startTime ) {
				return;
			}
			const took = performance.now() - this.startTime;
			mw.track( 'timing.SearchVue.LoadPreview', took );
			this.reset();
		},
		/**
		 * Reset the current timing
		 */
		reset() {
			this.startTime = 0;
		}
	}
} );

module.exports = useTimingStore;
