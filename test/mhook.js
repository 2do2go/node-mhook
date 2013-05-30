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
		hook.on('beforeUpdate', function(n, m, done) {
			results.push(n + m + 1);
			done();
		});
		hook.on('beforeUpdate', function(n, m, done) {
			results.push(n + m + 2);
			done();
		});
		hook.on('beforeUpdate', function(n, m, done) {
			results.push(n + m + 3);
			done();
		});
	});

	it('trigger that hooks and check the results', function(done) {
		hook.trigger('beforeUpdate', [1, 2], function(err) {
			if (err) done(err);
			expect(results).eql([4, 5, 6]);
			done();
		});
	});

	it('recreate hook and results', function() {
		hook = new Hook(['beforeUpdate', 'afterUpdate', 'afterRemove']);
		results = [];
	});

	it('add some hooks but middle are broken', function() {
		hook.on('beforeUpdate', function(params, done) {
			results.push(params.id + 1);
			done();
		});
		hook.on('beforeUpdate', function(params, done) {
			done(new Error('Some error'));
		});
		hook.on('beforeUpdate', function(params, done) {
			results.push(params.id + 3);
			done();
		});
	});

	it('trigger that hooks and expect error at callback', function(done) {
		hook.trigger('beforeUpdate', [{id: 1}], function(err) {
			expect(err).ok();
			expect(err.message).equal('Some error');
			expect(results).eql([2]);
			done();
		});
	});

	it('trigger that hooks woh call and expect throw error', function() {
		expect(function() {
			hook.trigger('beforeUpdate', [{id: 1}]);
		}).throwException(/^Some error/);
		expect(results).eql([2, 2]);
	});

});
