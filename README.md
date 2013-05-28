# mhook

Middleware like hooks for node.js which is useful for building some relations
between entities (ODM, ORM, etc).

## Installation

```
npm install mhook
```

## Usage

Define your actions, bind hooks on them, trigger actions.
When you trigger an action all binded hooks will be sequentially triggered. 

```js

var hook = new Hook(['beforeUpdate', 'afterUpdate', 'afterRemove']);

hook.on('beforeUpdate', function(params, done) {
	// do something, and then say that you done
	// pass error as first arguemnt to done
	done();
});

hook.trigger('beforeUpdate', {}, function(err) {
	// this function eill be called after all hooks	done or one of them fail
});


```

## Running test

into cloned repository run
