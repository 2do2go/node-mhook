'use strict';

var expect = require('expect.js'),
	Hook = require('../lib/mhook').Hook;

describe('hook', function() {

	var hook = null;

	it('instanciate new hook with actions without errors', function() {
		hook = new Hook(['beforeUpdate', 'afterUpdate', 'afterRemove']);
	});

	it('adding hook for unexisted action should throw an error', function() {
		expect(function() {
			hook.on('someAction', function() {});
		}).throwException(/^Unknown action/);
	});

	var results = [];
	it('add some hooks which do their job', function() {
		hook.on('beforeUpdate', function(n, m) {
			results.push(n + m + 1);
			return Promise.resolve();
		});
		hook.on('beforeUpdate', function(n, m, next) {
			results.push(n + m + 2);
			next();
		});
		hook.on('beforeUpdate', function(n, m) {
			results.push(n + m + 3);
			return Promise.resolve();
		});
	});

	it('trigger that hooks and check the results', function() {
		return hook.trigger('beforeUpdate', [1, 2]).then(function() {
			expect(results).eql([4, 5, 6]);
		});
	});

	it('recreate hook and results', function() {
		hook = new Hook(['beforeUpdate', 'afterUpdate', 'afterRemove']);
		results = [];
	});

	it('add some hooks but middle are broken', function() {
		hook.on('beforeUpdate', function(params) {
			results.push(params.id + 1);
			return Promise.resolve();
		});
		hook.on('beforeUpdate', function(params) {
			return Promise.reject(new Error('Some error'));
		});
		hook.on('beforeUpdate', function(params) {
			results.push(params.id + 3);
			return Promise.resolve();
		});
	});

	it('trigger that hooks and expect catch error', function() {
		return hook.trigger('beforeUpdate', [{id: 1}]).catch(function(err) {
			expect(err).ok();
			expect(err.message).equal('Some error');
			expect(results).eql([2]);
		});
	});
});
