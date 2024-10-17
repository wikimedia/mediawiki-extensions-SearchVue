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
			() => {
				updateValues( event );
			},
			100
		);
	};

	const resizeObserver = new ResizeObserver( setDebounceValues );

	onMounted( () => {
		resizeObserver.observe( elementToObserve.value );
	} );

	onUnmounted( () => {
		resizeObserver.unobserve( elementToObserve.value );
	} );

	return {
		elementWidth
	};
};
