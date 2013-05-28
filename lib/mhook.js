'use strict';

function Hook(actions) {
	if (!actions) throw new Error('`actions` is not set');
	var self = this;
	self._hooks = {};
	actions.forEach(function(action) {
		self._hooks[action] = [];
	});
}

Hook.prototype.on = function(action, hook) {
	checkAction(action, this._hooks);
	if (!isFunction(hook)) throw new Error('`hook` is not a function');
	this._hooks[action].push(hook);
};

Hook.prototype.trigger = function(action, hookParams, callback) {
	checkAction(action, this._hooks);
	var funcs = this._hooks[action].map(function(hook, index) {
		return function() {
			hook(hookParams, function(err) {
				if (err) {
					if (callback) {
						callback(err);
						return;
					} else {
						throw err;
					}
				}
				if (index < funcs.length - 1) funcs[++index]();
			});
		};
	});
	if (callback) funcs.push(callback);
	// starts sequntial hooks execution
	if (funcs.length) funcs[0]();
};

function checkAction(action, hooks) {
	if (action in hooks === false) {
		throw new Error('Unknown action: `' + action + '`');
	}	
}

function isFunction(value) {
	return Object.prototype.toString.call(value) == '[object Function]';
}

exports.Hook = Hook;
