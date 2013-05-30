# mhook

Middleware like hooks for node.js which is useful for building some relations
between entities (ODM, ORM, etc).


## Installation

```
npm install mhook
```


## Usage

Define your actions, bind hooks on them, trigger actions.
When you trigger an action all binded hooks will be sequentially executed. 

```js

var Hook = require('mhook').Hook;


var hook = new Hook(['beforeUpdate', 'afterUpdate', 'afterRemove']);

// add some hook
hook.on('beforeUpdate', function(done) {
	// do something, and then say that you done,
	// pass error as first argument to done
	done();
});

// add another hook
hook.on('beforeUpdate', function(done) {
	done();
});

// trigger `action` - executes all two hooks
hook.trigger('beforeUpdate', [], function(err) {
	// this function will be called after all
	// hooks done or one of them fail
});

```

for getting `on` and `trigger` methods to your object you can inherits from `Hook`


```js

var Hook = require('mhook').Hook,
	inherits = require('util').inherits;


function Model() {
	// apply parent cunstructor
	Hook.call(this, ['beforeUpdate', 'afterUpdate', 'afterRemove']);
}

// inherits from Hook
inherits(Model, Hook);

// now we can use `on` and `trigger` as own methods
Model.prototype.update = function(obj, callback) {
	this.trigger('beforeUpdate', [obj], function(err) {
		if (err) {callback(err); return}
		// update
		// trigger afterUpdate, etc
	});
};


var model = new Model();

model.on('beforeUpdate', function(obj, done) {
	console.log('before update object: ', obj);
	done();
});

```


## Api

  - [Hook()](#hook)
  - [Hook.on()](#hookonactionstringhookfunction)
  - [Hook.trigger()](#hooktriggeractionstringhookargsarraycallbackfunction)

## Hook()

  Hook constructor
  
  accepts array of string `actions` - possible actions which could be used
  at `on` and `trigger`

## Hook.on(action:String, hook:Function)

  Bind `hook` on `action`

## Hook.trigger(action:String, hookArgs:Array, [callback]:Function)

  Trigger some `action` with `hookArgs` (arguments which will be passed to
  every hook function).
  If `callback` (accepts error as first argument) function presents it will be
  called after hooks execution.


## Running test

into cloned repository run
