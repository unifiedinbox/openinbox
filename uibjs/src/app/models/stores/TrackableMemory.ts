import declare = require('dojo/_base/declare');
import Trackable = require('dstore/Trackable');
import Memory = require('dstore/Memory');
import _StoreFilters = require('./_StoreFilters');

var TrackableMemory = declare([ Memory, Trackable, _StoreFilters ]);

export = TrackableMemory;
