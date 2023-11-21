const assert = require('assert');

const { init } = require('gell/future');
const { collector } = require('gell/future/ut');
const DependencyContainer = require('gell-dependency/container');

const api = require('../../api/next');

const nextFixture = require('gell-http/ut/next');

describe('next api', function() {
	beforeEach(nextFixture.api);

	let context;

	beforeEach(function() {
		const [$search] = init(collector());

		context = { req: this.req, res: this.res };

		context.deps = new DependencyContainer({
			$search
		});
	})

	it('test', function() {
		this.req.query = {
			term: 'foo'
		}

		return api(context);
	})
})