const store = {
	logQuickViewEvent: jest.fn()
};

jest.mock( '../../../resources/stores/Event.js', () => () => store );

module.exports = store;
