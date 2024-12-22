const assert = require('assert');
const _ = require('lodash');

const stream = require('gell/stream/stream');
const { array: arraySink } = require('gell/stream/sink');

const indexer = require('gell-search/index/indexer');

describe('indexing stream', function() {
    let model;

    beforeEach(function() {
        model = {
            attributes: {
                name: {
                    type: 'string',
                    searchable: true,
                },
                email: {
                    type: 'string',
                    searchable: {
                        index: true,
                        project: true
                    },
                },
                message: 'string'
            }
        }
    })

    it('works', async function() {
        const item$ = {
            name: 'dan',
            email: 'dan@test.com'
        };

        const $items = [item$].values();

        const refs = [];

        const $stream = indexer($items, model, { application: 'test' });

        await stream($stream)
            .map(r_ => r_.snapshot())
            .sink(arraySink(refs))
            ;

        assert.strictEqual(refs.length, 2);

        const ref$ = refs[0];

        // console.debug('#####', ref$);

        assert.strictEqual(ref$.email, 'dan@test.com');
        assert.strictEqual(ref$.application, 'test');
    })
})
