const $ = require( 'jquery' );

/* global jest:false */
function Api() {}
Api.prototype.get = jest.fn().mockReturnValue( $.Deferred().resolve().promise() );
Api.prototype.post = jest.fn().mockResolvedValue( {} );
Api.prototype.getToken = jest.fn().mockResolvedValue( {} );
Api.prototype.postWithToken = jest.fn().mockResolvedValue( {} );
Api.prototype.saveOption = jest.fn();

function ForeignApi() {}
ForeignApi.prototype.get = jest.fn().mockReturnValue( $.Deferred().resolve().promise() );
ForeignApi.prototype.post = jest.fn().mockResolvedValue( {} );
ForeignApi.prototype.getToken = jest.fn().mockResolvedValue( {} );
ForeignApi.prototype.postWithToken = jest.fn().mockResolvedValue( {} );
ForeignApi.prototype.saveOption = jest.fn();

function Rest() {}
Rest.prototype.get = jest.fn().mockReturnValue( $.Deferred().resolve().promise() );
Rest.prototype.abort = jest.fn();
Rest.prototype.post = jest.fn().mockResolvedValue( {} );
Rest.prototype.getToken = jest.fn().mockResolvedValue( {} );
Rest.prototype.postWithToken = jest.fn().mockResolvedValue( {} );
Rest.prototype.saveOption = jest.fn();

function Title() {}
Title.prototype.getMainText = jest.fn().mockReturnValue( '' );
Title.prototype.getName = jest.fn().mockReturnValue( '' );
Title.prototype.getNamespaceId = jest.fn().mockReturnValue( 0 );
Title.prototype.getNamespacePrefix = jest.fn().mockReturnValue( '' );
Title.newFromText = jest.fn().mockReturnValue( {
	fragment: null,
	namespace: 0,
	title: '',
	getMainText: jest.fn().mockReturnValue( 'mock' ),
	getName: jest.fn().mockReturnValue( 'mock' ),
	getExtension: jest.fn().mockReturnValue( 'mock' ),
	getNamespaceId: jest.fn().mockReturnValue( 0 )
} );

const mw = {
	Api: Api,
	ForeignApi: ForeignApi,
	Rest: Rest,
	config: {
		get: jest.fn()
	},
	message: jest.fn().mockReturnValue( {
		text: jest.fn(),
		parse: jest.fn(),
		params: jest.fn( () => mw.message() )
	} ),
	msg: jest.fn().mockReturnValue( '' ),
	Uri: jest.fn().mockReturnValue( {
		getQueryString: jest.fn(),
		query: {
			type: ''
		}
	} ),
	Title: Title,
	util: {
		parseImageUrl: jest.fn().mockReturnValue( {
			resizeUrl: jest.fn()
		} )
	},
	language: {
		convertNumber: jest.fn()
	},
	storage: {
		get: jest.fn(),
		setObject: jest.fn(),
		getObject: jest.fn(),
		remove: jest.fn()
	},
	notify: jest.fn(),
	OgvJsSupport: {
		basePath: jest.fn(),
		loadIfNeeded: jest.fn()
	},
	loader: {
		using: jest.fn()
	},
	user: {
		options: {
			get: jest.fn().mockReturnValue( 0 ),
			set: jest.fn()
		},
		isAnon: jest.fn().mockReturnValue( false )
	},
	internalWikiUrlencode: jest.fn( ( value ) => {
		return value;
	} )
};
/*
 * MW front-end code expects certain global variables to exist in the
 * environment. This sets up things like "mw" object, jquery, etc. for use
 * in tests.
 */
global.mw = mw;
global.$ = require( 'jquery' );
