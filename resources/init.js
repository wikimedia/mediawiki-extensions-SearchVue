'use strict';

$( function () {

	var Vue = require( 'vue' ),
		App = require( './components/App.vue' ),
		/* eslint-disable no-jquery/no-global-selector */
		$results = $( '.searchresults' ),
		$vueContainer = $( '<div>' ).addClass( 'sdsv-container' ),
		$vue = $( '<div>' ).appendTo( $vueContainer );

	$results.prepend( $vueContainer );

	Vue.config.compilerOptions.whitespace = 'preserve';
	Vue.createMwApp( App )
		.mount( $vue.get( 0 ) );

} );
