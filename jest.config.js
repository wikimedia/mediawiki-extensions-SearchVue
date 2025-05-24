/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
module.exports = {
	// All imported modules in your tests should be mocked automatically
	// automock: false,
	// Stop running tests after `n` failures
	// bail: 0,
	// The directory where Jest should store its cached dependency information
	// cacheDirectory: "/private/var/folders/lw/zjjyns4n3n11bnzbgvqkh1_m0000gn/T/jest_dx",
	// Automatically clear mock calls and instances between every test
	clearMocks: true,
	// Indicates whether the coverage information should be collected while executing the test
	collectCoverage: true,
	// An array of glob patterns indicating a set of files for which coverage information should be collected
	collectCoverageFrom: [
		'resources/**/*.(js|vue)'
	],
	// The directory where Jest should output its coverage files
	coverageDirectory: 'coverage',
	// An array of regexp pattern strings used to skip coverage collection
	coveragePathIgnorePatterns: [
		'/node_modules/'
	],
	// The paths to modules that run some code to configure or set up the testing environment before each test
	setupFiles: [
		'./jest.setup.js'
	],
	// A list of paths to modules that run some code to configure or set up the testing framework before each test
	// setupFilesAfterEnv: [],
	// The number of seconds after which a test is considered as slow and reported as such in the results.
	// slowTestThreshold: 5,
	// A list of paths to snapshot serializer modules Jest should use for snapshot testing
	// snapshotSerializers: [],
	// The test environment that will be used for testing
	testEnvironment: 'jsdom',
	// Options that will be passed to the testEnvironment
	testEnvironmentOptions: {
		customExportConditions: [ 'node', 'node-addons' ]
	},
	// Adds a location field to test results
	// testLocationInResults: false,
	// The glob patterns Jest uses to detect test files
	// testMatch: [
	//   "**/__tests__/**/*.[jt]s?(x)",
	//   "**/?(*.)+(spec|test).[tj]s?(x)"
	// ],
	// An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
	testPathIgnorePatterns: [
		'/node_modules/'
	],
	// The regexp pattern or array of patterns that Jest uses to detect test files
	// testRegex: [],
	// This option allows the use of a custom results processor
	// testResultsProcessor: undefined,
	// This option allows use of a custom test runner
	// testRunner: "jasmine2",
	// This option sets the URL for the jsdom environment. It is reflected in properties such as location.href
	// testURL: "http://localhost",
	// Setting this value to "fake" allows the use of fake timers for functions such as "setTimeout"
	// timers: "real",
	// A map from regular expressions to paths to transformers
	transform: {
		'.*\\.(vue)$': '<rootDir>/node_modules/@vue/vue3-jest'
	}
};
