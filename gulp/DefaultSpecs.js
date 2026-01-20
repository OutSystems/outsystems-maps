/*
 * Global constants info
 **/
const constants = {
	fileName: 'OutSystemsMaps',
	gitUrl: 'https://github.com/OutSystems/outsystems-maps',
	websiteUrl: 'hhttps://outsystemsui.outsystems.com/OutSystemsMapsSample/',
	envType: {
		development: 'dev',
		production: 'prod',
	},
	// list of files to be excluded from a specific platform
	excludeFromTsTranspile: {},
	// list of platforms to compile and create scss files.
	platformTarget: {
		default: '',
	},
};

// Store the default project specifications
const specs = {
	version: '2.2.0',
	name: 'OutSystems Maps',
	description: '',
	url: 'Website:\n • ' + constants.websiteUrl,
	gitHub: 'GitHub:\n • ' + constants.gitUrl,
};

// Expose sections info!
exports.info = specs;
exports.globalConsts = constants;
