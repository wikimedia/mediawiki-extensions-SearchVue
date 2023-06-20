const mockElement = require( './element.js' );

document.querySelector = jest.fn().mockImplementation( () => mockElement );
document.getElementsByTagName = jest.fn().mockImplementation( () => [ mockElement ] );
document.getElementsByClassName = jest.fn().mockImplementation( () => [ mockElement ] );
