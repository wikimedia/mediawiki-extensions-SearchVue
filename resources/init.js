'use strict';

$( function () {

	const Vue = require( 'vue' ),
		App = require( './components/App.vue' ),
		Tutorial = require( './components/Tutorial.vue' ),
		store = require( './store/index.js' ),
		/* eslint-disable no-jquery/no-global-selector */
		$vueContainer = $( '<div>' ).addClass( 'sdsv-container' ),
		$tutorialPopupContainer = $( '<div>' ).addClass( 'tutorial-popup' );
	$( '.mw-search-results-container' ).prepend( $tutorialPopupContainer );

	$( '#content' ).prepend( $vueContainer );

	Vue.config.compilerOptions.whitespace = 'preserve';
	Vue.createMwApp( App )
		.use( store )
		.mount( $vueContainer.get( 0 ) );

	Vue.createMwApp( Tutorial )
		.use( store )
		.mount( $tutorialPopupContainer.get( 0 ) );
} );
