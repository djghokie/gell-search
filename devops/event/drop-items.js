const assert = require('assert');

const drain = require('gell/stream/drain');
const { scan } = require('gell-aws-dynamodb/item/stream');
const { batch: deleteBatch } = require('gell-aws-dynamodb/item/delete');
// const deleteAllDryRun = require('gell-aws-dynamodb/job/dryrun/delete-all');

/**
 * Deletes all items from the search table; follows standard index data model
 * 
 * WIP: could be rewritten when better delete-items future available in gell-aws-dynamodb
 * 
 * @param {*} event 
 * @returns 
 */
exports.job = async function(event) {
	assert(event, 'event is required');

	const { tableName } = event.params || {};
	assert(tableName, 'tableName is a required parameter');

	const { deps } = event;

	const logger = deps.resolveSingle('logger');

	logger.info('deleting all items from search table');

	const $deleteSearchItems = deleteBatch(deps.branch({ tableName }), { hash: 'id', range: 'termAttribute' });

	const params = {
		TableName: tableName,
		Limit: 50
	}
	const $searchItems = scan(params, deps);

	return drain($searchItems, $deleteSearchItems);
	// return sampler($searchItems, $deleteSearchItems, 5);
}
