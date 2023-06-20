module.exports = {
	innerHTML: 'dummyElement',
	querySelectorAll: jest.fn(),
	classList: {
		add: jest.fn(),
		remove: jest.fn()
	},
	focus: jest.fn()
};
