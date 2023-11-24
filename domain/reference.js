const _ = require('lodash');

const { State } = require('gell');
const Projection = require('gell/lib/projection');

exports.projectTarget = function(target_, model) {
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

exports.materialize = function(ref$, klass=State) {
	const ref_ = new State();
}