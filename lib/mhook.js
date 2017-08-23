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

	this._hooks = {};
	actions.forEach(function(action) {
		this._hooks[action] = [];
	}, this);
}

/**
 * Bind `hook` on `action`
 * @param {String} action
 * @param {Function} hook
 */
Hook.prototype.on = function(action, hook) {
	this._checkAction(action);

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
 */
Hook.prototype.trigger = function(action, hookArgs, callback) {
	this._checkAction(action);

	if (!Array.isArray(hookArgs)) {
		throw new Error('`hookArgs` is not an array');
	}

	callback = callback || noop;

	var chain = this._hooks[action].reduce(function(chain, hook) {
		return chain.then(function() {
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

	chain.then(callback).catch(callback);

	return chain;
};

Hook.prototype._checkAction = function(action) {
	if (!this._hooks.hasOwnProperty(action)) {
		throw new Error('Unknown action: `' + action + '`');
	}
};

function noop() {}

exports.Hook = Hook;
