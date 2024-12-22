const _ = require('lodash');

const Projection = require('gell/lib/projection');

const javascript = require('gell-domain/binding/javascript');

const model = {
    attributes: {
        id: {
            type: 'uuid',
            description: 'id of the target item'
        },
        termAttribute: {
            type: 'string',
            description: 'name of searchable target attribute'
        },
        application: {
            type: 'string',
            description: 'segments search for a particular application/environment'
        }
    }
}

/**
 * WIP: only used in ps-transportation/test/event/test-index
 * 
 * @param {*} target_ 
 * @param {*} model 
 * @returns 
 */
function projectTarget(target_, model) {
	const { id='id', terms, context=[] } = model;

	const searchProjection_ = new Projection(target_);
	searchProjection_.reflect(id);
	
	terms.forEach(attr => {
		searchProjection_.set('term', z => target_.get(attr).toLowerCase(), attr);
		// searchProjection_.project('term', string.lowercase(attr), attr);
		searchProjection_.set('termAttribute', attr, attr);
	})

	if (_.isArray(context)) {
		searchProjection_.reflect(...context);
	} else {
		Object.keys(context).forEach(attr => {
			const projection = context[attr];
			if (projection === true) searchProjection_.reflect(attr);
			else if (_.isFunction(projection)) searchProjection_.project(attr, projection);
		});
	}

	return searchProjection_;
}

module.exports = {
    model,

    materialize: session$ => javascript.materialize(session$, model),

    projectTarget
}
