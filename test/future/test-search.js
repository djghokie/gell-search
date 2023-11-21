const assert = require('assert');

const { init } = require('gell/future');
const DependencyContainer = require('gell-dependency/container');

const query = require('../../future/search');

describe('query future', function() {
	let deps;

	beforeEach(function() {
		deps = new DependencyContainer({
			tableName: 'gello',
			dynamodb: {
				send: async command => {
					return {
						Items: []
					}
				}
			}
		});
	})

	it('initializes correctly', function() {
		const [$query] = init(query(deps));

		assert($query);
	})

	describe('global search', function() {
		let $query;

		beforeEach(function() {
			const [$q] = init(query(deps));

			$query = $q;
		})

		it('works', function() {
			const params = {
				term: 'foo'
			}

			return $query.next(params).value;
		})
	})
})