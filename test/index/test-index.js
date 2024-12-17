const assert = require('assert');
const _ = require('lodash');

const session = require('gell-session/domain/session');

const index = require('../../index/item');

describe('model based indexing', function() {
    let item_, model;

    beforeEach(function() {
        item_ = session.materialize();
    })

    describe('non indexable item', function() {
        beforeEach(function() {
            model = {}
        })
    
        it('works', function() {
            const foo = index(item_, model);

            assert.strictEqual(foo.length, 0);
        })
    })

    describe('simple model', function() {
        beforeEach(function() {
            model = {
                attributes: {
                    name: {
                        type: 'string',
                        searchable: true,
                    },
                    message: 'string'
                }
            }
        })

        it('returns no references if item defines no attributes', function() {
            const refs_ = index(item_, model);

            assert.strictEqual(refs_.length, 0);
        })
    
        it('returns no references if item does not define searchable attribute', function() {
            item_.set('message', 'gello!');

            const refs_ = index(item_, model);

            assert.strictEqual(refs_.length, 0);
        })
    
        it('returns single reference for item with searchable attribute', function() {
            item_.set('name', 'foobar');

            const refs_ = index(item_, model);

            assert.strictEqual(refs_.length, 1);

            const ref$ = refs_[0].snapshot();

            // console.debug('#####', ref$);

            assert.strictEqual(ref$.id, item_.get('id'));
            assert.strictEqual(ref$.termAttribute, 'name');
            assert.strictEqual(ref$.term, 'foobar');
            assert.strictEqual(ref$.termStart, 'f');
        })
    })

    describe('inheriting model', function() {
        beforeEach(function() {
            model = {
                extends: [session.model],
                attributes: {
                    name: {
                        type: 'string',
                        searchable: true,
                    },
                    userName: {
                        type: 'string',
                        searchable: true
                    }
                }
            }
        })
    
        it('returns correct references', function() {
            item_.set('name', 'foobar');
            item_.set('userName', 'dan');

            const refs_ = index(item_, model);

            assert.strictEqual(refs_.length, 2);
        })
    })

    describe('projected attributes', function() {
        beforeEach(function() {
            model = {
                attributes: {
                    name: {
                        type: 'string',
                        searchable: true,
                    },
                    message: {
                        searchable: {
                            // index: true,
                            project: true
                        },
                    },
                }
            }

            item_.set('name', 'Fubar');
        })
    
        it('does not include projected attribute if not defined by item', function() {
            const refs_ = index(item_, model);

            assert.strictEqual(refs_.length, 1);

            const ref$ = refs_[0].snapshot();

            // console.debug('#####', ref$);

            assert.strictEqual(ref$.id, item_.get('id'));
            assert.strictEqual(ref$.termAttribute, 'name');
            assert.strictEqual(ref$.term, 'fubar');
            assert.strictEqual(ref$.termStart, 'f');
        })

        it('does includes projected attribute if defined by item', function() {
            item_.set('message', 'gello!');

            const refs_ = index(item_, model);

            assert.strictEqual(refs_.length, 1);

            const ref$ = refs_[0].snapshot();

            // console.debug('#####', ref$);

            assert.strictEqual(ref$.id, item_.get('id'));
            assert.strictEqual(ref$.termAttribute, 'name');
            assert.strictEqual(ref$.term, 'fubar');
            assert.strictEqual(ref$.termStart, 'f');
            assert.strictEqual(ref$.message, 'gello!');
        })
    })
})
