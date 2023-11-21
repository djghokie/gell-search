const assert = require('assert');
const _ = require('lodash');
const EventEmitter = require('events');

const { State } = require("gell");
const { Configuration } = require('gell/conf');

const { QueryCommand } = require("@aws-sdk/lib-dynamodb");

/**
 * Perform the search
 * 
 * WIP
 * 	- Limit should be an option
 * 
 * @param {*} query 
 * @param {*} deps 
 * @returns 
 */
async function doSearch(query, deps) {
	assert(query, 'search query is required');

	const { tableName, dynamodb } = await deps.resolve('tableName', 'dynamodb');

	const { term, type, parentId } = query;

	assert(term, `search term is required`);

	let termLower = term.toLowerCase();

	let params = {
		TableName: tableName,
		Limit: 20  // TODO: should be an option
	}

	if (parentId) {
		params.IndexName = 'byparent';
		params.KeyConditionExpression = 'parentId=:parentId and begins_with(term, :term)';
		params.ExpressionAttributeValues = {
			':parentId': parentId,
			':term': termLower,
		}
	} else {
		params.IndexName = 'global';
		params.KeyConditionExpression = 'termStart=:termStart and begins_with(term, :term)';
		params.ExpressionAttributeValues = {
			':termStart': termLower.charAt(0),
			':term': termLower,
		}
	}

	if (type) {
		params.FilterExpression = '#type=:type';
		params.ExpressionAttributeNames = {
			'#type': 'type'
		}
		params.ExpressionAttributeValues[':type'] = type;
	}

	return dynamodb.send(new QueryCommand(params))
		// .tap(res => logger.info(JSON.stringify(res, null, 2)))
		.then(res => res.Items)
}

/**
 * Performs search by querying DynamoDB search table
 * 
 * WIP: this was ported from "store-search"
 * 
 * IMPROVEMENTS
 * 	- use stream/sink abstractions
 * 	- use query future
 * 
 * @param {*} deps 
 */
module.exports = function* search(deps) {
	assert(deps, 'deps is requried');

	assert(deps.find('tableName', true), 'tableName dependency not defined');
	assert(deps.find('dynamodb', true), 'dynamodb dependency not defined');

	let _dispacher = new State();
	let conf = new Configuration();
	let events = new EventEmitter();

	let event = yield { state: _dispacher, conf, events };

	while (true) event = yield doSearch(event, deps);
}