document.querySelector = jest.fn().mockImplementation( () => {
	return {
		innerHTML: '',
		querySelectorAll: jest.fn()
	};
} );
