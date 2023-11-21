const assert = require('assert');
const _ = require('lodash');

const { init } = require('gell/future');

const searchIndexer = require('../indexer');

/**
 * WIP: index items based on an item domain model
 * 	- each item should be materialized as it's correct type
 * 		- can use a "search" perspective to set search specific attributes
 * 	- index events should be passed to the indexer
 * 		- as opposed to items
 * 
 * @param {*} model
 * @param {*} deps 
 */
module.exports = function* indexingSink(model, deps) {
	assert(model, `item model (domain) is required`);
	assert(deps, `deps is required`);

	const type = model.TYPE;
	assert(_.isString(type), 'model must define TYPE metadata'); // WIP: is this really required?

	const { searchAttributes } = model;
	assert(_.isArray(searchAttributes) && searchAttributes.length > 0, `model (type=${type}) must define searchAttributes (at least one)`);

	const [$indexer] = init(searchIndexer(searchAttributes, deps));

	const { logger } = deps.resolve('logger');

	async function indexItem(item) {
		logger.info(`indexing item (type=${type})`);

		const item_ = model.materialize(item);

		return $indexer.next(item_).value;
	}

	let item = yield;
	while (true) item = yield indexItem(item);
}
