const { ref, onMounted, onUnmounted } = require( 'vue' );

module.exports = function onDocumentScoll() {

	const scrollX = ref( window.scrollX );
	const scrollY = ref( window.scrollY );
	let timeout = null;

	const updateValues = function ( x, y ) {
		scrollX.value = x;
		scrollY.value = y;
	};

	const throttle = function ( callback, delay ) {
		let latest = null;

		const invalidatingCallback = function ( ...args ) {
			latest = null;
			callback( ...args );
		};

		return function ( ...args ) {
			if ( timeout === null ) {
				// not currently throttled; execute, and use timeout as lock
				invalidatingCallback( ...args );
				timeout = setTimeout(
					() => {
						timeout = null;
						if ( latest !== null ) {
							invalidatingCallback( ...latest );
						}
					},
					delay
				);
			} else {
				// throttled, but called again - keep track of data; we'll
				// make sure to invoke our callback once more once throttle
				// delay is over to reflect this latest data
				latest = args;
			}
		};
	};

	const getThrottledScroll = throttle(
		() => {
			updateValues( window.scrollX, window.scrollY );
		},
		100
	);

	onMounted( () => {
		window.addEventListener( 'scroll', getThrottledScroll );
	} );

	onUnmounted( () => {
		window.removeEventListener( 'scroll', getThrottledScroll );
	} );

	return {
		scrollX,
		scrollY
	};
};
