const useStore = require( '../../../resources/stores/Query.js' ),
	Pinia = require( 'pinia' ),
	when = require( 'jest-when' ).when,
	useRequestStatusStore = require( '../../../resources/stores/RequestStatus.js' );

require( '../mocks/domSelector.js' );

/**
 * Quick little helper function to escape contents for use in regular expressions;
 * some characters (e.g. `.`, `?`, ...) otherwise have a special meaning in regular expressions.
 *
 * @param {string} text
 * @return {string}
 */
const escapeForRegex = ( text ) => text.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );

beforeEach( () => {
	Pinia.setActivePinia( Pinia.createPinia() );
} );

describe( 'Query store', () => {
	let store;
	let requestStore;
	let dummyPayload;
	let results;
	beforeEach( () => {
		store = useStore();
		requestStore = useRequestStatusStore();
		requestStore.setRequestStatus = jest.fn();
		results = [
			{
				prefixedText: 'dummy1',
				thumbnail: { width: 1, height: 2 },
				text: 'dummySnippet',
				snippetField: 'dummyField'
			}
		];
		dummyPayload = [
			'dummy',
			0,
			results,
			false
		];
	} );
	describe( 'retrieveInfoFromQuery', () => {
		it( 'When title is empty it does not perform any operation', () => {
			dummyPayload[ 0 ] = '';
			store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

			expect( requestStore.setRequestStatus ).not.toHaveBeenCalled();
		} );
		it( 'When selectedIndex is -1 it does not perform any operation', () => {
			dummyPayload[ 1 ] = -1;
			store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

			expect( requestStore.setRequestStatus ).not.toHaveBeenCalled();
		} );
		it( 'When result is empty it does not perform any operation', () => {
			dummyPayload[ 2 ] = [];
			store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

			expect( requestStore.setRequestStatus ).not.toHaveBeenCalled();
		} );
		describe( 'When all arguments are available', () => {
			it( 'sets request status `in progress`', () => {
				store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

				expect( requestStore.setRequestStatus ).toHaveBeenCalled();
			} );
			describe( 'when triggering an API endpoint to /search/v0/page', () => {
				it( 'pass a title to the API', () => {
					store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

					expect( global.mw.Rest.prototype.get ).toHaveBeenCalled();
					expect( global.mw.Rest.prototype.get ).toHaveBeenCalledWith( expect.stringContaining( dummyPayload[ 0 ] ) );
				} );
				it( 'pass a snippetField to the API', () => {
					store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

					expect( global.mw.Rest.prototype.get ).toHaveBeenCalled();
					expect( global.mw.Rest.prototype.get ).toHaveBeenCalledWith( expect.stringContaining( results[ 0 ].snippetField ) );
				} );

				// Needs to test edge case where title with a "/" and other special character break the search preview
				it( 'it encodes API parameters', () => {
					const titleWithSpecialCharacters = 'title/!@#$%^';
					const snippetFieldWithSpecialCharacters = 'field/!@#$%^';
					dummyPayload[ 0 ] = titleWithSpecialCharacters;
					dummyPayload[ 2 ][ 0 ].snippetField = snippetFieldWithSpecialCharacters;

					store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

					expect( global.mw.Rest.prototype.get ).toHaveBeenCalled();
					expect( global.mw.Rest.prototype.get ).toHaveBeenCalledWith(
						expect.stringContaining( encodeURIComponent( titleWithSpecialCharacters ) ) );
					expect( global.mw.Rest.prototype.get ).toHaveBeenCalledWith(
						expect.stringContaining( encodeURIComponent( snippetFieldWithSpecialCharacters ) ) );
				} );
				it( 'retrieves article sections', () => {
					const mockSections = [ 'section1' ];
					const dummyResponse = {
						cirrusdoc: [ {
							source: {
								heading: mockSections
							}
						} ]
					};
					global.mw.Rest.prototype.get.mockReturnValueOnce( $.Deferred().resolve( dummyResponse ).promise() );
					store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

					expect( store.sections ).toEqual( mockSections );

				} );
				it( 'it set the article description with `wikibase-shortdesc`', () => {
					const fakeDescription = 'Q146';
					const dummyResponse = {
						pageprops: {
							'wikibase-shortdesc': fakeDescription
						}
					};
					global.mw.Rest.prototype.get.mockReturnValueOnce( $.Deferred().resolve( dummyResponse ).promise() );
					store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

					expect( store.description ).toEqual( fakeDescription );

				} );
				it( 'in absence of `wikibase-shortdesc` set description to `terms.description`', () => {
					const fakeDescription = 'Q146';
					const dummyResponse = {
						terms: {
							description: [
								fakeDescription
							]
						}
					};
					global.mw.Rest.prototype.get.mockReturnValueOnce( $.Deferred().resolve( dummyResponse ).promise() );
					store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

					expect( store.description ).toEqual( fakeDescription );

				} );

				describe( 'when customSnippet is available in cirrusdoc', () => {
					const dummyCirrusDocFieldContent = 'a23456789 b23456789 c23456789 d23456789 e23456789 ' +
						'f23456789 g23456789 h23456789 i23456789 j23456789 k23456789 l23456789 m23456789 ' +
						'n23456789 o23456789 p23456789 q23456789 r23456789 s23456789 t23456789 u23456789 ' +
						'v23456789 w23456789 x23456789 y23456789 z23456789';
					const dummyResponse = {
						cirrusdoc: [ {
							source: {
								text: dummyCirrusDocFieldContent
							}
						} ]
					};
					beforeEach( () => {
						global.mw.Rest.prototype.get.mockReturnValueOnce( $.Deferred().resolve( dummyResponse ).promise() );

						dummyPayload[ 2 ][ 0 ].text = 'a customSnippet';
						dummyPayload[ 2 ][ 0 ].snippetField = 'text';
						when( global.mw.msg )
							.calledWith( 'ellipsis' )
							.mockReturnValueOnce( '...' );
					} );

					describe( 'it does not set expanded snippets', () => {
						it( 'when snippet is empty', () => {
							dummyPayload[ 2 ][ 0 ].text = '';

							store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

							expect( store.expandedSnippet ).toBeFalsy();
						} );
						it( 'when the snippet cannot be found', () => {
							dummyPayload[ 2 ][ 0 ].text = 'this will not be found';

							store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

							expect( store.expandedSnippet ).toBeFalsy();
						} );
					} );

					describe( 'it sets expanded snippets', () => {
						describe( 'snippet at the start of source text', () => {
							it( 'not expanded to the front if there is no additional content that way', () => {
								dummyPayload[ 2 ][ 0 ].text = 'a23456789 b2345';

								store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

								const expectRegex = new RegExp( '^' + escapeForRegex( dummyPayload[ 2 ][ 0 ].text ) );
								expect( store.expandedSnippet ).toEqual( expect.stringMatching( expectRegex ) );
							} );

							it( 'expanded to the back, with ellipsis, respecting word boundaries', () => {
								dummyPayload[ 2 ][ 0 ].text = 'a23456789 b2345';

								store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

								const expectRegex = new RegExp( escapeForRegex( dummyPayload[ 2 ][ 0 ].text ) + '.*([a-z]23456789)\\.\\.\\.$' );
								expect( store.expandedSnippet ).toEqual( expect.stringMatching( expectRegex ) );
							} );

							it( 'not expanded to the front if on mobile', () => {
								dummyPayload[ 2 ][ 0 ].text = '56789 d2345';
								dummyPayload[ 3 ] = true; // We set the isMobile to true;
								store.retrieveInfoFromQuery.apply( undefined, dummyPayload );
								const expectRegex = new RegExp( '^' + escapeForRegex( dummyPayload[ 2 ][ 0 ].text ) );
								expect( store.expandedSnippet ).toEqual( expect.stringMatching( expectRegex ) );

							} );
						} );

						describe( 'snippet early in source text (can expand all the way to start)', () => {
							it( 'expanded to the front, without ellipsis, respecting word boundaries', () => {
								dummyPayload[ 2 ][ 0 ].text = '56789 d2345';

								store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

								const expectRegex = new RegExp( '^([a-z]23456789).*' + escapeForRegex( dummyPayload[ 2 ][ 0 ].text ) );
								expect( store.expandedSnippet ).toEqual( expect.stringMatching( expectRegex ) );
							} );

							it( 'expanded to the back, with ellipsis, respecting word boundaries', () => {
								dummyPayload[ 2 ][ 0 ].text = '56789 d2345';

								store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

								const expectRegex = new RegExp( escapeForRegex( dummyPayload[ 2 ][ 0 ].text ) + '.*([a-z]23456789)\\.\\.\\.$' );
								expect( store.expandedSnippet ).toEqual( expect.stringMatching( expectRegex ) );
							} );
						} );

						describe( 'snippet in the middle of source text (can expand in both directions without reaching start/end)', () => {
							it( 'expanded to the front, with ellipsis, respecting word boundaries', () => {
								dummyPayload[ 2 ][ 0 ].text = '56789 n2345';

								store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

								const expectRegex = new RegExp( '^\\.\\.\\.([a-z]23456789).*' + escapeForRegex( dummyPayload[ 2 ][ 0 ].text ) );
								expect( store.expandedSnippet ).toEqual( expect.stringMatching( expectRegex ) );
							} );

							it( 'expanded to the back, with ellipsis, respecting word boundaries', () => {
								dummyPayload[ 2 ][ 0 ].text = '56789 n2345';

								store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

								const expectRegex = new RegExp( escapeForRegex( dummyPayload[ 2 ][ 0 ].text ) + '.*([a-z]23456789)\\.\\.\\.$' );
								expect( store.expandedSnippet ).toEqual( expect.stringMatching( expectRegex ) );
							} );
						} );

						describe( 'snippet late in source text (can expand all the way to end)', () => {
							it( 'expanded to the front, with ellipsis, respecting word boundaries', () => {
								dummyPayload[ 2 ][ 0 ].text = '56789 x2345';

								store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

								const expectRegex = new RegExp( '^\\.\\.\\.([a-z]23456789).*' + escapeForRegex( dummyPayload[ 2 ][ 0 ].text ) );
								expect( store.expandedSnippet ).toEqual( expect.stringMatching( expectRegex ) );
							} );

							it( 'expanded to the back, without ellipsis, respecting word boundaries', () => {
								dummyPayload[ 2 ][ 0 ].text = '56789 x2345';

								store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

								const expectRegex = new RegExp( escapeForRegex( dummyPayload[ 2 ][ 0 ].text ) + '.*([a-z]23456789)$' );
								expect( store.expandedSnippet ).toEqual( expect.stringMatching( expectRegex ) );
							} );
						} );

						describe( 'snippet at the end of source text', () => {
							it( 'expanded to the front, with ellipsis, respecting word boundaries', () => {
								dummyPayload[ 2 ][ 0 ].text = '56789 z23456789';

								store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

								const expectRegex = new RegExp( '^\\.\\.\\.([a-z]23456789).*' + escapeForRegex( dummyPayload[ 2 ][ 0 ].text ) );
								expect( store.expandedSnippet ).toEqual( expect.stringMatching( expectRegex ) );
							} );

							it( 'not expanded to the back if there is no additional content that way', () => {
								dummyPayload[ 2 ][ 0 ].text = '56789 z23456789';
								store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

								const expectRegex = new RegExp( escapeForRegex( dummyPayload[ 2 ][ 0 ].text ) + '$' );
								expect( store.expandedSnippet ).toEqual( expect.stringMatching( expectRegex ) );
							} );
						} );
					} );
				} );
				it( 'updates the article thumbnail with the info received from the API', () => {
					const mockThumbnail = {
						source: 'https://fakeImageUrl',
						width: 400,
						height: 700
					};

					const dummyResponse = { thumbnail: mockThumbnail };
					global.mw.Rest.prototype.get.mockReturnValueOnce( $.Deferred().resolve( dummyResponse ).promise() );

					store.retrieveInfoFromQuery.apply( undefined, dummyPayload );

					expect( store.thumbnail ).toEqual( dummyResponse.thumbnail );

				} );
			} );
		} );
	} );
	describe( 'abort', () => {
		it( 'Abort any inflight API request', () => {
			store.abort();
			expect( global.mw.Rest.prototype.abort ).toHaveBeenCalled();
		} );
	} );
} );
