import declare = require('dojo/_base/declare');
import aspect = require('dojo/aspect');
import Cache = require('dstore/Cache');
import QueryResults = require('dojo/store/util/QueryResults');
import Request = require('dstore/Request');
import Promise = require('mayhem/Promise');
import DstoreAdapter = require('dstore/legacy/DstoreAdapter');

interface RequestMemory<T> extends dstore.ICollection<T> {
	evictAll():void;
};

// dstore #41407 (redmine)
aspect.after(DstoreAdapter.prototype, 'query', function (queryResults) {
	if (!(queryResults instanceof QueryResults)) {
		queryResults = new QueryResults(queryResults);
	}
	return queryResults;
});

var RequestMemory = declare([ Request, Cache ], {
	isValidFetchCache: true,

	constructor: function () {
		this.root = this;
	},

	_fetchFirst: function () {
		if (!this.root._hasFetched) {
			this.root._hasFetched = true;
			this.root.fetch.apply(this.root, arguments);
		}
	},

	evictAll: function () {
		this.allLoaded = false;
		this._hasFetched = false;
		this.cachingStore.setData([]);
	}
});

var storeMethods = [ 'get', 'fetch', 'fetchRange', 'add', 'put', 'remove' ];

storeMethods.forEach(function (method) {
	aspect.before(RequestMemory.prototype, method, RequestMemory.prototype._fetchFirst);
});

export =  RequestMemory;
