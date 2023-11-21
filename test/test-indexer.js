const assert = require('assert');

const { State } = require('gell');
const { init } = require('gell/future');
const DependencyContainer = require('gell-dependency/container');

const put = require('gell-aws-dynamodb/mock/put');

const indexer = require('../indexer');

const ATTRIBUTES = [
	'userName',
	'email',
	'firstName',
	'lastName',
	'phoneNumber',
	'label'
];

describe('search indexer', function() {
	let $indexer, searchItems;

	beforeEach(function() {
		searchItems = [];

		let [$put] = init(put(searchItems));

		const deps = new DependencyContainer({
			$put
		});

		const [$i] = init(indexer(ATTRIBUTES, deps));

		$indexer = $i;
	})

	describe('single term', function() {
		let target_;

		beforeEach(function() {
			target_ = new State();
			target_.set('id', '100');
			target_.set('userName', 'JohnSmith');
		})

		it('generates search item correctly', async function() {
			await $indexer.next(target_).value;
	
			assert.strictEqual(searchItems.length, 1);

			let si$ = searchItems[0];

			assert.strictEqual(si$.id, '100');
			assert.strictEqual(si$.termAttribute, 'userName');
			// assert.strictEqual(si$.type, 'userName');
			// assert.strictEqual(si$.parentId, 'userName');
			assert.strictEqual(si$.termStart, 'j');
			assert.strictEqual(si$.term, 'johnsmith');
			// item.set('userName', z => orgItem.get('userName'));
			// item.set('firstName', z => orgItem.get('firstName'));
			// item.set('lastName', z => orgItem.get('lastName'));
			// item.set('label', z => orgItem.get('label'));
		})
	
		it('yields correctly', async function() {
			let res = await $indexer.next(target_).value;
	
			assert.strictEqual(res.length, 1);
		})
	})
})