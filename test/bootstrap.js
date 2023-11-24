const runtime = require('gell-runtime/mocha');

exports.mochaGlobalSetup = z => {}
exports.mochaGlobalTeardown = z => {}

exports.mochaHooks = {
	beforeAll: [runtime.beforeAll],
}
