import ListView = require('mayhem/ui/dom/ListView');
import Conversation = require('../../models/Conversation');
import ConversationProxy = require('../../viewModels/ConversationList');
import ConversationRow = require('./ConversationRow');
import Message = require('../../models/Message');
import Proxy = require('mayhem/data/Proxy');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import util = require('mayhem/util');

interface IConversationProxy extends Proxy<Conversation> {};
interface IConversationProxyStore extends dstore.ICollection<IConversationProxy> {}

class ConversationList extends SingleNodeWidget {
	get:ConversationList.Getters;
	set:ConversationList.Setters;

	protected _collection:IConversationProxyStore;
	_collectionGetter():IConversationProxyStore {
		return this._collection;
	}
	_collectionSetter(value:dstore.ICollection<Conversation>):void {
		if (value) {
			this._collection = <any> ConversationProxy.forCollection(<any> value).sort('date', true);
			this._listView.set('collection', this._collection);
		}
	}

	_isAttachedSetter(value:boolean):void {
		this._isAttached = value;
		this._listView.set('isAttached', value);
	}

	protected _listView:ListView<Conversation>;
	protected _message:Message;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection' ], '_render');
		super(kwArgs);
	}

	destroy():void {
		super.destroy();
		this._listView.destroy();

		this._collection = null;
		this._message = null;
	}

	_render():void {
		this._node = document.createElement('div');
		(<HTMLDivElement> this._node).className = 'ConversationList dgrid-autoheight';

		this._listView = new ListView<Conversation>({
			app: this.get('app'),
			itemConstructor: ConversationRow,
			parent: this
		});

		this._node.appendChild(this._listView.detach());
	}
}

module ConversationList {
	export interface Getters extends SingleNodeWidget.Getters {
    	(key:'collection'):IConversationProxyStore;
    	(key:'firstNode'):HTMLElement;
    	(key:'lastNode'):HTMLElement;
    	(key:'message'):Message;
	}

	export interface Setters extends SingleNodeWidget.Setters {
    	(key:'collection', value:dstore.ICollection<Conversation>):void;
    	(key:'message', value:Message):Message;
	}
}

export = ConversationList;
