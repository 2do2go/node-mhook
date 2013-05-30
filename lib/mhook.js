'use strict';

/**
 * Hook constructor
 *
 * accepts array of string `actions` - possible actions which could be used
 * at `on` and `trigger`
 */
function Hook(actions) {
	if (!actions) throw new Error('`actions` is not set');
	var self = this;
	self._hooks = {};
	actions.forEach(function(action) {
		self._hooks[action] = [];
	});
}

/**
 * Bind `hook` on `action`
 * @param {String} action
 * @param {Function} hook
 */
Hook.prototype.on = function(action, hook) {
	checkAction(action, this._hooks);
	if (typeof(hook) != 'function') throw new Error('`hook` is not a function');
	this._hooks[action].push(hook);
};

/**
 * Trigger some `action` with `hookArgs` (arguments which will be passed to
 * every hook function).
 * If `callback` (accepts error as first argument) function presents it will be
 * called after hooks execution.
 * @param {String} action
 * @param {Array} hookArgs
 * @param {Function} [callback]
 */
Hook.prototype.trigger = function(action, hookArgs, callback) {
	checkAction(action, this._hooks);
	if (!Array.isArray(hookArgs)) throw new Error('`hookArgs` is not an array');
	var callbackPushed = false;
	var funcs = this._hooks[action].map(function(hook, index) {
		if (!callbackPushed) {
			hookArgs.push(function(err) {
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
			callbackPushed = true;
		}
		return function() {
			hook.apply(null, hookArgs);
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

exports.Hook = Hook;
