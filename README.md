# gell-search

_gell based implementation of application search_

## Concepts

* `target`
    * item representing the result of a successful search
* `term`
    * string that can be matched against resulting in a `hit`
* `reference`
    * refers to a `target` item through a search `term`
* `hit`
    * matching `reference` (i.e search result)

## Features

* persistence
* indexer
* api
* lambda stream event handler

## Searching

### Limiting Search Results

* filter by `termAttribute`
    * _is this really possible yet_?
* `type`
    * could be replaced with `hierarchy`
* other potential implementations
    * `hierarchy`
	    * ACME#CRM#CUSTOMER
		* not sure this makes sense...
	* `context`

## To Do

* use domain model metadata to determine what to index
* handle add/update/delete events
