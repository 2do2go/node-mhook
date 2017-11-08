'use strict';

/**
 * Hook constructor
 *
 * accepts array of string `actions` - possible actions which could be used
 * at `on` and `trigger`
 */
function Hook(actions) {
	if (!actions) {
		throw new Error('`actions` is not set');
	}

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

	if (typeof hook !== 'function') {
		throw new Error('`hook` is not a function');
	}

	this._hooks[action].push(hook);

	return this;
};

/**
 * Trigger some `action` with `hookArgs` (arguments which will be passed to
 * every hook function).
 * If `callback` (accepts error as first argument) function presents it will be
 * called after hooks execution.
 * Return promise which will be resolved after hooks execution.
 * @param {String} action
 * @param {Array} hookArgs
 * @param {Function} [callback]
 */
Hook.prototype.trigger = function(action, hookArgs, callback) {
	checkAction(action, this._hooks);

	if (!Array.isArray(hookArgs)) {
		throw new Error('`hookArgs` is not an array');
	}

	callback = callback || noop;

	var chain = this._hooks[action].reduce(function(next, hook) {
		return next.then(function() {
			return new Promise(function(resolve, reject) {
				var result = hook.apply(null, hookArgs.concat(function(err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}));

				if (result instanceof Promise) {
					result.then(resolve).catch(reject);
				}
			});
		});
	}, Promise.resolve());

	chain.then(function() {
		callback();
	}).catch(callback);

	return chain;
};

function checkAction(action, hooks) {
	if (!hooks.hasOwnProperty(action)) {
		throw new Error('Unknown action: `' + action + '`');
	}
}

function noop() {}

exports.Hook = Hook;
