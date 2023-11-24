# Search Persistence

## Indexes

### `global`

* hash: `termStart`
* range: `term`
* search across all `reference`s in the search table
* minimum of one character is required
    * search the `termStart` partition