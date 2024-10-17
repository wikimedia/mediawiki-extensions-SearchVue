const useDomStore = require( '../../../resources/stores/Dom.js' ),
	Pinia = require( 'pinia' ),
	mockElement = require( '../mocks/element.js' );

require( '../mocks/domSelector.js' );
beforeEach( () => {
	Pinia.setActivePinia( Pinia.createPinia() );
} );

const createMockElement = ( name ) => {
	const fakeElement = document.createElement( 'div' );
	fakeElement.textContent = name;
	fakeElement.focus = jest.fn();

	return fakeElement;
};

describe( 'Dom store', () => {
	let domStore;
	beforeEach( () => {
		domStore = useDomStore();
		domStore.searchResults = {
			find: jest.fn().mockReturnValueOnce( {
				closest: jest.fn().mockReturnValueOnce( [
					Object.assign(
						{
							// We cannot add this directly in the MockElement otherwise it will trigger a circular dependencies
							querySelector: document.querySelector
						},
						mockElement
					)
				] )
			} )
		};
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
		describe( 'currentSelectedResults', () => {
			it( 'Return null if no title is passed', () => {
				expect( domStore.currentSelectedResults() ).toBeFalsy();
			} );
			it( 'Return the result element if a title is passed', () => {
				expect( domStore.currentSelectedResults( 'dummy' ).innerHTML ).toEqual( 'dummyElement' );
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
				document.querySelector.mockImplementationOnce( () => ( {
					querySelectorAll: jest.fn().mockReturnValueOnce( dummyReturn )
				} ) );

				domStore.updateTabbableElements();
				expect( domStore.focusableElements ).toEqual( dummyReturn );
			} );
		} );
		describe( 'focusDialog', () => {
			it( 'Trigger a focus event if container is available', () => {
				const focusMock = jest.fn();
				document.querySelector.mockImplementationOnce( () => ( {
					focus: focusMock
				} ) );
				domStore.focusDialog();

				expect( focusMock ).toHaveBeenCalled();
			} );
		} );
		describe( 'handleTabTrap', () => {
			let mockEvent;
			beforeEach( () => {
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
		describe( 'handleClassesToggle', () => {
			describe( 'When no title is passed', () => {
				it( 'remove class "search-preview-open" from body', () => {

					domStore.handleClassesToggle();
					expect( document.getElementsByTagName ).toHaveBeenCalled();
					expect( mockElement.classList.remove ).toHaveBeenCalledWith( 'search-preview-open' );
				} );
				it( 'remove class "searchresult-with-quickview--open" from search result', () => {
					// We mock the currentSelectedResult getter
					domStore.currentSelectedResults = mockElement;

					domStore.handleClassesToggle();
					expect( document.getElementsByClassName ).toHaveBeenCalled();
					expect( mockElement.classList.remove ).toHaveBeenCalledWith( 'searchresult-with-quickview--open' );

				} );
			} );
			describe( 'When title is passed', () => {
				it( 'add class "search-preview-open" from body', () => {

					domStore.handleClassesToggle( 'dummy' );
					expect( document.getElementsByTagName ).toHaveBeenCalled();
					expect( mockElement.classList.add ).toHaveBeenCalledWith( 'search-preview-open' );
				} );
				it( 'add class "searchresult-with-quickview--open" from search result', () => {

					domStore.handleClassesToggle( 'dummy' );
					expect( mockElement.classList.add ).toHaveBeenCalledWith( 'searchresult-with-quickview--open' );

				} );
			} );
		} );
		describe( 'focusCurrentResult', () => {
			it( 'Calls focus on the current element', () => {
				domStore.focusCurrentResult( 'dummy' );
				expect( mockElement.focus ).toHaveBeenCalled();
			} );
		} );
		describe( 'updateMainSearchResultSnippets', () => {
			beforeEach( () => {

			} );
			describe( 'does not update dom when the following argument is missing', () => {
				it( 'title', () => {
					domStore.updateMainSearchResultSnippets( false, 'dummySnippet', true );
					expect( document.querySelector ).not.toHaveBeenCalledWith( expect.stringContaining( 'data-prefixedtext' ) );
				} );
				it( 'snippet', () => {
					domStore.updateMainSearchResultSnippets( 'dummyTitle', undefined, true );
					expect( document.querySelector ).not.toHaveBeenCalledWith( expect.stringContaining( 'data-prefixedtext' ) );
				} );
				it( 'isMobile', () => {
					domStore.updateMainSearchResultSnippets( 'dummyTitle', 'dummySnippet' );
					expect( document.querySelector ).not.toHaveBeenCalledWith( expect.stringContaining( 'data-prefixedtext' ) );
				} );
			} );
			describe( 'when all paramethers are passed correctly', () => {
				it( 'update the element with the provided snippet', () => {
					const dummyElement = createMockElement( 'dummyElement' );
					document.querySelector.mockReturnValue( dummyElement );

					domStore.updateMainSearchResultSnippets( 'dummyTitle', 'dummySnippet', true );

					expect( document.querySelector ).toHaveBeenCalledWith( expect.stringContaining( 'data-prefixedtext' ) );
					expect( dummyElement.innerHTML ).toEqual( 'dummySnippet' );
				} );
			} );
		} );

		describe( 'generateAndInsertAriaButton', () => {
			let container;
			let insertBefore;
			beforeEach( () => {
				insertBefore = jest.fn();
				container = {
					insertBefore: insertBefore
				};
			} );
			it( 'Attach a button to the provided container', () => {
				domStore.generateAndInsertAriaButton( container );

				expect( insertBefore ).toHaveBeenCalled();
				// we check the first argument that should be the button itself
				expect( insertBefore.mock.calls[ 0 ][ 0 ] ).toBeTruthy();
				expect( insertBefore.mock.calls[ 0 ][ 0 ].type ).toBe( 'button' );
			} );
			it( 'Set the button aria label', () => {
				const dummyAriaLabel = 'dummyAriaLabel';
				domStore.generateAndInsertAriaButton( container, dummyAriaLabel );

				expect( insertBefore ).toHaveBeenCalled();
				// we check the first argument that should be the button itself
				expect( insertBefore.mock.calls[ 0 ][ 0 ] ).toBeTruthy();
				expect( insertBefore.mock.calls[ 0 ][ 0 ].ariaLabel ).toBe( dummyAriaLabel );
			} );
		} );
	} );
} );
