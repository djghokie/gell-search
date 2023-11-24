const assert = require('assert');
const _ = require('lodash');
const EventEmitter = require('events');

const { State } = require("gell");
const { Configuration } = require('gell/conf');

/**
 * WIP: attributes required by table
 * 	- id
 * 	- termAttribute
 * 	- termStart
 * 	- term
 * 	- type
 * 	- parentId
 * 
 * @param {*} target_ 
 * @param {*} indexedAttributes 
 * @returns 
 */
function indexItem(target_, indexedAttributes) {
	const items = [];

	indexedAttributes.forEach(a => {
		let term = target_.get(a);

		if (term) {
			let termLower = term.toLowerCase();

			let searchItem_ = new State();
			searchItem_.set('id', z => target_.get('id'));
			searchItem_.set('termAttribute', a);
			searchItem_.set('term', termLower);
			searchItem_.set('termStart', termLower.charAt(0));
			
			/**
			 * WIP: domain specific attributes
			 * 	- are these needed?
			*/
			searchItem_.set('type', z => target_.get('type'));  // TODO: what is type used for?  domain specific...
			searchItem_.set('parentId', z => target_.get('parentId'));  // TODO: what is parentId for?  domain specific...
			searchItem_.set('userName', z => target_.get('userName'));
			searchItem_.set('firstName', z => target_.get('firstName'));
			searchItem_.set('lastName', z => target_.get('lastName'));
			searchItem_.set('label', z => target_.get('label'));

			items.push(searchItem_);
		}
	});

	return items;
}

/**
 * Maps events (?) to search items
 * 	- delegates to Dynamodb put future
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
 * WIP: move this to future directory?
 * 
 * @param {*} deps 
 */
module.exports = function* searchIndexer(indexedAttributes, deps) {
	assert(_.isArray(indexedAttributes), 'indexedAttributes array is required');
	assert(deps, 'deps requried by search indexer');

	// assert(deps.get('$put'), '$put dependency not defined');

	const _dispacher = new State();
	const conf = new Configuration();
	const events = new EventEmitter();

	async function dispatch(target_) {
		assert(target_);

		let searchItems = indexItem(target_, indexedAttributes);

		const { $put } = await deps.resolve('$put');

		return Promise.all(searchItems.map(i => $put.next(i).value));
	}

	let event = yield { state: _dispacher, conf, events };

	while (true) event = yield dispatch(event);
}