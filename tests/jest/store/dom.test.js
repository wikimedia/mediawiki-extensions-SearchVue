const useDomStore = require( '../../../resources/stores/Dom.js' ),
	Pinia = require( 'pinia' );

require( '../mocks/querySelector.js' );

beforeEach( () => {
	Pinia.setActivePinia( Pinia.createPinia() );
} );

describe( 'Dom store', () => {
	let domStore;
	beforeEach( () => {
		domStore = useDomStore();
	} );
	describe( 'Getters', () => {
		describe( 'firstFocusableElement', () => {
			it( 'Return null if no elements are available', () => {
				expect( domStore.firstFocusableElement ).toBeFalsy();
			} );
			it( 'Return the first value if elements array is available', () => {
				domStore.focusableElements = [
					'first',
					'second'
				];
				expect( domStore.firstFocusableElement ).toEqual( 'first' );
			} );
		} );
		describe( 'lastFocusableElement', () => {
			it( 'Return null if no elements are available', () => {
				expect( domStore.lastFocusableElement ).toBeFalsy();
			} );
			it( 'Return the last value if elements array is available', () => {
				domStore.focusableElements = [
					'first',
					'second',
					'third'
				];
				expect( domStore.lastFocusableElement ).toEqual( 'third' );
			} );
		} );
	} );
	describe( 'Actions', () => {
		describe( 'updateTabbableElements', () => {
			it( 'Does not triggers action if container is not found', () => {
				document.querySelector.mockImplementationOnce( () => false );
				domStore.updateTabbableElements();

				expect( domStore.focusableElements ).toBeFalsy();
			} );
			it( 'update focusable elements when container is present', () => {
				const dummyReturn = [ 'one', 'two' ];
				document.querySelector.mockImplementationOnce( () => {
					return {
						querySelectorAll: jest.fn().mockReturnValueOnce( dummyReturn )
					};
				} );

				domStore.updateTabbableElements();
				expect( domStore.focusableElements ).toEqual( dummyReturn );
			} );
		} );
		describe( 'focusDialog', () => {
			it( 'Trigger a focus event if container is available', () => {
				const focusMock = jest.fn();
				document.querySelector.mockImplementationOnce( () => {
					return {
						focus: focusMock
					};
				} );
				domStore.focusDialog();

				expect( focusMock ).toHaveBeenCalled();
			} );
		} );
		describe( 'handleTabTrap', () => {
			let mockEvent;
			beforeEach( () => {
				const createMockElement = ( name ) => {
					const fakeElement = document.createElement( 'div' );
					fakeElement.textContent = name;
					fakeElement.focus = jest.fn();

					return fakeElement;
				};
				domStore.focusableElements = [
					createMockElement( 'firstElement' ),
					createMockElement( 'secondElement' )
				];

				mockEvent = {
					key: 'Tab',
					preventDefault: jest.fn()
				};
			} );

			it( 'When Enter is pressed, does not trigger anything if key pressed is not tab', () => {
				mockEvent.key = 'enter';
				domStore.handleTabTrap( mockEvent );
				expect( mockEvent.preventDefault ).not.toHaveBeenCalled();
			} );

			it( 'When tab is pressedn, and last item is active, focus the first element', () => {
				// we make the active element equal to the last item
				const activeElement = domStore.focusableElements[ 1 ];
				domStore.handleTabTrap( mockEvent, activeElement );
				expect( domStore.focusableElements[ 0 ].focus ).toHaveBeenCalled();
				expect( mockEvent.preventDefault ).toHaveBeenCalled();
			} );

			it( 'When tab is pressed and first item is selected, let default action trigger', () => {
				// we make the active element equal to the first item
				const activeElement = domStore.focusableElements[ 0 ];
				domStore.handleTabTrap( mockEvent, activeElement );
				expect( domStore.focusableElements[ 1 ].focus ).not.toHaveBeenCalled();
				expect( mockEvent.preventDefault ).not.toHaveBeenCalled();
			} );

			it( 'When tab and shift is pressed and first item is selected, focus the first element', () => {
				// we make the active element equal to the first item
				const activeElement = domStore.focusableElements[ 0 ];
				// Emulate shift key press
				mockEvent.shiftKey = true;
				domStore.handleTabTrap( mockEvent, activeElement );
				expect( domStore.focusableElements[ 1 ].focus ).toHaveBeenCalled();
				expect( mockEvent.preventDefault ).toHaveBeenCalled();
			} );
		} );
	} );
} );
