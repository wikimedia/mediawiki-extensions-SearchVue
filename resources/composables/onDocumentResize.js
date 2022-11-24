const { ref, onMounted, onUnmounted } = require( 'vue' );

module.exports = function onDocumentResize() {

	const width = ref( window.innerWidth );
	const height = ref( window.innerHeight );
	let timeout = null;

	const updateValues = function ( event ) {
		width.value = event.currentTarget.innerWidth;
		height.value = event.currentTarget.innerHeight;
	};

	const getDebouncedResize = function ( event ) {

		if ( !event.currentTarget ) {
			return;
		}

		clearTimeout( timeout );
		timeout = setTimeout(
			function () {
				updateValues( event );
			},
			100
		);
	};

	onMounted( function () {
		window.addEventListener( 'resize', getDebouncedResize );
	} );

	onUnmounted( function () {
		window.addEventListener( 'resize', getDebouncedResize );
	} );

	return {
		width,
		height
	};
};
