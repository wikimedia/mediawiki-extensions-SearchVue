module.exports = {
	mounted: function ( el ) {
		el.append( $.createSpinner()[ 0 ] );
	}
};
