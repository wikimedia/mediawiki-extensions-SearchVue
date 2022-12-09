const { ref, onMounted, onUnmounted } = require( 'vue' );

module.exports = function onResizeObserver( element ) {
	let timeout = null;
	const elementToObserve = ref( element );
	const elementWidth = ref( 0 );

	const updateValues = function ( entries ) {
		elementWidth.value = entries[ 0 ].target.clientWidth;
	};

	const setDebounceValues = function ( event ) {
		clearTimeout( timeout );
		timeout = setTimeout(
			function () {
				updateValues( event );
			},
			100
		);
	};

	const resizeObserver = new ResizeObserver( setDebounceValues );

	onMounted( function () {
		resizeObserver.observe( elementToObserve.value );
	} );

	onUnmounted( function () {
		resizeObserver.unobserve( elementToObserve.value );
	} );

	return {
		elementWidth
	};
};
