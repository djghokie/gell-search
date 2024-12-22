const assert = require('assert');
const _ = require('lodash');

const compiler = require('gell-domain/binding/compiler');
const javascript = require('gell-domain/binding/javascript');

const reference = require('../domain/reference');

/**
 * WIP: this should probably be moved to the reference domain
 */
const projectionModel = {
    extends: reference.model,
    attributes: {
    },
    projections: {
        id: true
    },
}

module.exports = async function* indexer($items, model, ref$) {
	assert($items, 'source stream is required');

    const { attributes=[] } = compiler.compile(model);
    const indexedAttributes = [];
    const projectedAttributes = [];
    
    attributes.forEach(attr => {
        const { searchable } = attr;
        if (searchable) {
            if (searchable === true || searchable.index) indexedAttributes.push(attr.name);

            if (searchable.project) projectedAttributes.push(attr.name);
        }
    });

    function index(target$) {
        const target_ = javascript.materialize(target$, model);
        const items = [];
        indexedAttributes.forEach(name => {
            const term = target_.snapshotAttribute(name);
            if (term) {
                const ref_ = javascript.project(target_, projectionModel);
                // ref_.reflect('id');
                ref_.set('termAttribute', name);
                ref_.map(name, val => val.toLowerCase(), 'term');
                ref_.derive('termStart', ({term}) => term.charAt(0), 'term');
                ref_.reflect(...projectedAttributes);

                if (ref$) javascript.merge(ref$, ref_, reference.model);
    
                items.push(ref_);
            }
        });
    
        return items;
    }

	let next = await $items.next();

	while (next.value) {
        const result = index(next.value).values();

		yield* result;

		if (!next.done) next = await $items.next();
	}
}
