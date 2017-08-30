'use strict';

var expect = require('expect.js'),
	sinon = require('sinon'),
	Hook = require('../lib/mhook').Hook;

describe('hook', function() {
	describe('common', function() {
		it('instanciate new hook without actions', function() {
			expect(function() {
				new Hook();
			}).throwException(/^`actions` is not set/);
		});

		it('instanciate new hook with actions without errors', function() {
			new Hook(['beforeUpdate', 'afterUpdate', 'afterRemove']);
		});
	});

	describe('on', function() {
		it('adding hook for unexisted action should throw an error', function() {
			var hook = new Hook(['beforeUpdate']);
			expect(function() {
				hook.on('someAction', function() {});
			}).throwException(/^Unknown action/);
		});

		it('adding non-function hook', function() {
			var hook = new Hook(['beforeUpdate']);
			expect(function() {
				hook.on('beforeUpdate', 'it is not a function');
			}).throwException(/is not a function/);
		});
	});

	describe('trigger', function() {
		describe('errors', function() {
			it('with non-array hook arguments', function() {
				var hook = new Hook(['beforeUpdate']);

				hook.on('beforeUpdate', function(next) {
					next();
				});

				expect(function() {
					hook.trigger('beforeUpdate', 'it is not an array');
				}).throwException(/is not an array/);
			});
		});

		describe('with promise', function() {
			var hook = new Hook(['beforeUpdate']),
				spy = sinon.spy();

			it('create and trigger hook', function() {
				hook.on('beforeUpdate', function(n, m, next) {
					spy(1, n, m);
					next();
				});

				return hook.trigger('beforeUpdate', [1, 2]);
			});

			it('check results', function() {
				expect(spy.callCount).to.be(1);
				expect(spy.firstCall.calledWith(1, 1, 2)).to.ok();
			});
		});

		describe('with callback', function() {
			var hook = new Hook(['beforeUpdate']),
				spy = sinon.spy();

			it('create and trigger hook', function(done) {
				hook.on('beforeUpdate', function(n, m, next) {
					spy(1, n, m);
					next();
				});

				hook.trigger('beforeUpdate', [1, 2], done);
			});

			it('check results', function() {
				expect(spy.callCount).to.be(1);
				expect(spy.firstCall.calledWith(1, 1, 2)).to.ok();
			});
		});

		describe('with promise hooks', function() {
			var hook = new Hook(['beforeUpdate']),
				spy = sinon.spy();

			it('create and trigger hook', function() {
				hook.on('beforeUpdate', function(n, m) {
					spy(1, n, m);
					return Promise.resolve();
				}).on('beforeUpdate', function(n, m) {
					spy(2, n, m);
					return Promise.resolve();
				}).on('beforeUpdate', function(n, m) {
					spy(3, n, m);
					return Promise.resolve();
				});

				return hook.trigger('beforeUpdate', [1, 2]);
			});

			it('check results', function() {
				expect(spy.callCount).to.be(3);
				expect(spy.firstCall.calledWith(1, 1, 2)).to.ok();
				expect(spy.secondCall.calledWith(2, 1, 2)).to.ok();
				expect(spy.thirdCall.calledWith(3, 1, 2)).to.ok();
			});
		});

		describe('with callback hooks', function() {
			var hook = new Hook(['beforeUpdate']),
				spy = sinon.spy();

			it('create and trigger hook', function() {
				hook.on('beforeUpdate', function(n, m, next) {
					spy(1, n, m);
					next()
				}).on('beforeUpdate', function(n, m, next) {
					spy(2, n, m);
					next();
				}).on('beforeUpdate', function(n, m, next) {
					spy(3, n, m);
					next();
				});

				return hook.trigger('beforeUpdate', [1, 2]);
			});

			it('check results', function() {
				expect(spy.callCount).to.be(3);
				expect(spy.firstCall.calledWith(1, 1, 2)).to.ok();
				expect(spy.secondCall.calledWith(2, 1, 2)).to.ok();
				expect(spy.thirdCall.calledWith(3, 1, 2)).to.ok();
			});
		});

		describe('with failing promise hook', function() {
			var hook = new Hook(['beforeUpdate']),
				spy = sinon.spy(),
				error = null;

			it('create and trigger hook', function() {
				hook.on('beforeUpdate', function(n, m) {
					spy(1, n, m);
					return Promise.resolve();
				}).on('beforeUpdate', function(n, m) {
					spy(2, n, m);
					return Promise.reject(new Error('second error'));
				}).on('beforeUpdate', function(n, m) {
					spy(3, n, m);
					return Promise.resolve();
				});

				return hook.trigger('beforeUpdate', [1, 2]).catch(function(err) {
					error = err;
				});
			});

			it('check results', function() {
				expect(spy.callCount).to.be(2);
				expect(spy.firstCall.calledWith(1, 1, 2)).to.ok();
				expect(spy.secondCall.calledWith(2, 1, 2)).to.ok();
				expect(error).to.ok();
				expect(error.message).to.be('second error');
			});
		});

		describe('with failing callback hook', function() {
			var hook = new Hook(['beforeUpdate']),
				spy = sinon.spy(),
				error = null;

			it('create and trigger hook', function(done) {
				hook.on('beforeUpdate', function(n, m, next) {
					spy(1, n, m);
					next()
				}).on('beforeUpdate', function(n, m, next) {
					spy(2, n, m);
					next(new Error('second error'));
				}).on('beforeUpdate', function(n, m, next) {
					spy(3, n, m);
					next();
				});

				hook.trigger('beforeUpdate', [1, 2], function(err) {
					error = err;
					done();
				});
			});

			it('check results', function() {
				expect(spy.callCount).to.be(2);
				expect(spy.firstCall.calledWith(1, 1, 2)).to.ok();
				expect(spy.secondCall.calledWith(2, 1, 2)).to.ok();
				expect(error).to.ok();
				expect(error.message).to.be('second error');
			});
		});
	});
});
