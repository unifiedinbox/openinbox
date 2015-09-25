import core = require('mayhem/interfaces');
import Message = require('../models/Message');

/**
 * Provides a common interface for events listeners that need to work with Message objects.
 * If a `message` is provided, it is assumed that that object contains all of the information
 * needed by the consumer. If no `message` is provided, then a `source` must be provide. The
 * `source` is the message that is being forwarded/replied to.
 */
export interface IMessageEvent extends core.IEvent {
	message?:Message;
	source?:Message;
	action?:string;
}
