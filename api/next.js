const assert = require('assert');
const _ = require('lodash');

/**
 * Next.js based API handler; assumes delegation from gell-http/next/api future
 * 
 * NOTES
 * 	- this delegates search query to the search future
 * 
 * @param {*} context 
 * @returns 
 */
module.exports = async context => {
	let { term } = context.req.query;

	assert(term, 'search term is required');

	const { $search } = await context.deps.resolve('$search');

	let results = await $search.next(context.req.query).value;

	return _.uniqBy(results, r => r.id);
}
