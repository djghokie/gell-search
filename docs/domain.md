# gell-search Domain

## Term

* not sure if this is what it should be named
    * maybe `reference`

### Required Attributes

* `id`
    * `id` of the `target` item
	* NOTE: `reference`s don't define their own `id`s
* `termAttribute`
    * attribute of the `target` item that the search `term` is derived from
* `term`
    * string representing the search `term` derived from the value of the `target` `termAttribute`
* `termStart`
    * first character of `term`
    * used to partition search `term`s for global search

### Categorization Attributes

* used for restricting search results

### Context Attributes

* used for providing additional information (usually displayed in a UI) with a `hit`
