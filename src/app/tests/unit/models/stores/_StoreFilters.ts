import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import app = require('../../../ui/app');
import declare = require('dojo/_base/declare');
import Memory = require('dstore/Memory');
import PersistentModel = require('mayhem/data/PersistentModel');
import _StoreFilters = require('app/models/stores/_StoreFilters');

var Store = <any> declare([ Memory, _StoreFilters ]);

class MockModel extends PersistentModel {
	get:MockModel.Getters;
	set:MockModel.Setters;
}

module MockModel {
	export interface Getters extends PersistentModel.Getters {};
	export interface Setters extends PersistentModel.Setters {};
}

MockModel.setDefaultApp(app);
MockModel.setDefaultStore(new Store());

registerSuite({
	name: 'app/models/stores/_StoreFilters',

	beforeEach():void {
		resetData();
	},

	afterEach():void {
		app.destroy();
	},

	'#exclude': {
		'exclude by ID': function ():IPromise<any[]> {
			var excluded:number[] = [ 1, 2, 3, 4, 5 ];
			var included:number[] = [ 0, 6, 7, 8, 9 ];
			var filtered:dstore.ICollection<any> = (<any> MockModel.store).exclude(excluded);

			return filtered.forEach(function (item:MockModel):void {
				assert.notInclude(excluded, item.get('id'));
				assert.include(included, item.get('id'));
			});
		},

		'exclude by arbitary property': function ():IPromise<any[]> {
			var toTestString:Function = (id:number):string => 'Test Item ' + id;
			var excluded:string[] = <any> [ 1, 2, 3, 4, 5 ].map((<any> toTestString));
			var included:number[] = [ 0, 6, 7, 8, 9 ];
			var filtered:dstore.ICollection<any> = (<any> MockModel.store).exclude(excluded, 'name');

			return filtered.forEach(function (item:MockModel):void {
				assert.notInclude(excluded, item.get('name'));
				assert.include(included, item.get('id'));
			});
		}
	},

	'#include': {
		'include by ID': function ():IPromise<any[]> {
			var included:number[] = [ 1, 2, 3, 4, 5 ];
			var excluded:number[] = [ 0, 6, 7, 8, 9 ];
			var filtered:dstore.ICollection<any> = (<any> MockModel.store).include(included);

			return filtered.forEach(function (item:MockModel):void {
				assert.include(included, item.get('id'));
				assert.notInclude(excluded, item.get('id'));
			});
		},

		'include by arbitary property': function ():IPromise<any[]> {
			var toTestString:Function = (id:number):string => 'Test Item ' + id;
			var included:string[] = <any> [ 1, 2, 3, 4, 5 ].map(<any> toTestString);
			var excluded:number[] = [ 0, 6, 7, 8, 9 ];
			var filtered:dstore.ICollection<any> = (<any> MockModel.store).include(included, 'name');

			return filtered.forEach(function (item:MockModel):void {
				assert.include(included, item.get('name'));
				assert.notInclude(excluded, item.get('id'));
			});
		}
	}
});

function resetData():void {
	var data:Array<HashMap<any>> = ('0123456789'.split('')).map(function (count:string):HashMap<any> {
		return {
			id: Number(count),
			name: 'Test Item ' + count
		};
	});

	(<Memory<any>> MockModel.store).setData(data);
}
