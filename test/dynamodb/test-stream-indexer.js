const assert = require('assert');

const { State } = require('gell');
const { init } = require('gell/future');
const put = require('gell-aws-dynamodb/mock/put');

const indexer = require('../../indexer');
const itemIndexer = require('../../indexer/item');

describe('dynamodb stream indexer', function() {
	let $indexer, searchItems;

	beforeEach(function() {
		searchItems = [];

		const [$put] = init(put(searchItems));
		
		const ATTRIBUTES = ['name'];

		// const [$i] = init(indexer(ATTRIBUTES, this.deps.branch({ $put })));
		const [$i] = init(itemIndexer(ATTRIBUTES, this.deps.branch({ $put })));

		$indexer = $i;
	})

	describe('new image', function() {
		/**
		 * WIP: how to do this??  approaches...
		 * 	- pass in State with only those attributes that changed
		 */
		it('adds all searchable properties', async function() {
			const model = {
				indexedAttributes: ['lastName', 'email']
			}

			const [$put] = init(put(searchItems, 'id', 'termAttribute'));
			const [$indexer] = init(itemIndexer(model, this.deps.branch({ $put })));

			const target_ = new State();
			target_.set('id', '100');
			target_.set('firstName', 'John');
			target_.set('lastName', 'Doe');
			target_.set('email', 'john.doe@test.com');

			await $indexer.next(target_).value;
	
			assert.strictEqual(searchItems.length, 2);

			let si$ = searchItems[0];
			assert.strictEqual(si$.id, '100');
			assert.strictEqual(si$.termAttribute, 'lastName');
			// assert.strictEqual(si$.termStart, 'f');
			assert.strictEqual(si$.term, 'doe');

			si$ = searchItems[1];
			assert.strictEqual(si$.id, '100');
			assert.strictEqual(si$.termAttribute, 'email');
			// assert.strictEqual(si$.termStart, 'f');
			assert.strictEqual(si$.term, 'john.doe@test.com');
		})
	})
})
