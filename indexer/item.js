const assert = require('assert');
const _ = require('lodash');
const EventEmitter = require('events');

const { State } = require("gell");
const { Configuration } = require('gell/conf');

/**
 * WIP: new indexer approach
 * 
 * IMPROVEMENTS
 * 	- this currently takes in a materialized item state instead of an event
 * 		- loses whether or not the item was added/updated
 * 		- no support for deleting/unindexing
 * 	- batch insert/update would be more efficient
 * 		- would get this with an appropriate sink implementation
 * 	- indexedAttributes should be part of the domain model
 * 		- pass in to future init
 * 	- should use gell streaming features
 * 
 * @param {*} deps 
 */
module.exports = function* searchIndexer(model, deps) {
	assert(model, 'model requried by search indexer');
	assert(deps, 'deps requried by search indexer');

	const _dispacher = new State();
	const conf = new Configuration();
	const events = new EventEmitter();

	const { $put } = deps.resolve('$put');

	const { indexedAttributes=[] } = model;
	assert(_.isArray(indexedAttributes), 'indexedAttributes array is required');

	function indexItem(target_) {
		const items = [];

		indexedAttributes.forEach(a => {
			let term = target_.get(a);

			if (!_.isUndefined(term)) {
				let termLower = term.toLowerCase();
	
				const searchItem_ = new State();
				searchItem_.set('id', z => target_.get('id'));
				searchItem_.set('termAttribute', a);
				searchItem_.set('term', termLower);
	
				/*
				searchItem_.set('termStart', termLower.charAt(0));
				searchItem_.set('type', z => target_.get('type'));  // TODO: what is type used for?  domain specific...
				searchItem_.set('parentId', z => target_.get('parentId'));  // TODO: what is parentId for?  domain specific...
				searchItem_.set('userName', z => target_.get('userName'));
				searchItem_.set('firstName', z => target_.get('firstName'));
				searchItem_.set('lastName', z => target_.get('lastName'));
				searchItem_.set('label', z => target_.get('label'));
				*/

				items.push(searchItem_);
			}
		});
	
		return items;
	}
	
	async function dispatch(item_) {
		assert(item_, 'item (State) is required argument to next()');

		const searchItems = indexItem(item_, indexedAttributes);

		return Promise.all(searchItems.map(i => $put.next(i).value));
	}

	let args = yield { state: _dispacher, conf, events };

	while (true) args = yield dispatch(args);
}