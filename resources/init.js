'use strict';

$( function () {

	const Vue = require( 'vue' ),
		App = require( './components/App.vue' ),
		store = require( './store/index.js' ),
		/* eslint-disable no-jquery/no-global-selector */
		$vueContainer = $( '<div>' ).addClass( 'sdsv-container' );

	$( '#content' ).prepend( $vueContainer );

	Vue.config.compilerOptions.whitespace = 'preserve';
	Vue.createMwApp( App )
		.use( store )
		.mount( $vueContainer.get( 0 ) );

} );
