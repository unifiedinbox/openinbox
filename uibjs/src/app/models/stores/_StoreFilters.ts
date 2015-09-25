import declare = require('dojo/_base/declare');
import Model = require('mayhem/data/Model');

var UibStoreFilters = declare(null, {
	/**
	 * Returns a filtered store containing only the models matching the passed-in value.
	 *
	 * @param Array<string> included The filter values to be used as the criteria for inclusion.
	 * @param {string} key The filter key. Defaults to the ID property.
	 * @return dstoreICollection<Model> The filtered dstore collection.
	 */
	include: function (included:any[], key?:string):dstore.ICollection<Model> {
		var filter = new (<any> this).Filter();
		key = key || this.idProperty;

		return included ? this.filter(filter.in(key, included)) : this;
	},

	/**
	 * Returns a filtered store containing only the models that do not match the passed-in values.
	 *
	 * @param Array<string> included The filter values to be used as the criteria for exclusion.
	 * @param {string} key The filter key. Defaults to the ID property.
	 * @return dstoreICollection<Model> The filtered dstore collection.
	 */
	exclude: function (excluded:any[], key?:string):dstore.ICollection<Model> {
		key = key || this.idProperty;

		if (!excluded) {
			return this;
		}

		return <any> this.filter(function (item:Model):boolean {
			var filtered = excluded.every(function (value:any):boolean {
				var actual:any = item.get(key);

				return value !== actual;
			});

			return filtered;
		});
	}
});

export = UibStoreFilters;
