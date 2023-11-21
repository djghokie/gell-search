const assert = require('assert');
const _ = require('lodash');

const { State } = require("gell");

const DEFAULT_OPTIONS = {
	indexName: 'bytype',
	limit: 10,
}

/**
 * WIP: implement options
 * 	- filters
 * 		- dynamodb toolbox filters?
 * 	- count
 * 		- keep searching until all items searched or count number of items returned
 * 
 * @param {*} table 
 * @param {*} type 
 * @param {*} deps 
 */
module.exports = function* search(table, type, deps, options=DEFAULT_OPTIONS) {
	assert(table, 'table (dynamodb-toolbox) is requried');
	assert(_.isString(type), 'type is requried');
	assert(deps, 'deps is requried');

	assert(deps.find('dynamodb', true), 'dynamodb dependency not defined');

	const mergedOptions = _.defaults(options, DEFAULT_OPTIONS);

	async function doSearch(query) {
		const queryOptions = {
			index: mergedOptions.indexName,
			limit: mergedOptions.limit,
			filters: []
		}

		const { term } = query;
		if (term) queryOptions.beginsWith = term;

		return table.query(type, queryOptions)
			.then(res => res.Items)
			;
	}
	
	let event = yield new State();

	while (true) event = yield doSearch(event, deps);
}