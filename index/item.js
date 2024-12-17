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

/**
 * Indexes an item for search by creating 0 or more REFERENCEs, based on the supplied model
 * 
 * WIP: this uses the standard gell-domain model, with added "searchable" declaration
 *  searchable: true
 * 
 *  searchable: {
 *      index: true
 *  }
 *  
 *  searchable: {
 *      project: true
 *  }
 * 
 * WIP: index and project currently true/false
 *  - support projecting attributes in both cases in the future
 *      - project: format('%s, %s', 'lastName', 'firstName'),
 * 
 * WIP: enhancements/fixes
 *  - should check if attribute is a string
 * 
 * @param {*} target_ 
 * @param {*} model 
 * @returns 
 */
module.exports = function index(target_, model) {
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

    /**
     * WIP: could be a series of projections
    */
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

			items.push(ref_);
		}
	});

	return items;
}