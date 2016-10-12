---
layout: post
title:  "simple javascript currying using bind"
excerpt: "In this blogpost I tell you a short story about how I was introduced to
javascript function currying"
date:   2016-10-12 00:00:00 +0200
categories: Coding
tags: javascript js currying functional
---

I was working on nodejs project with mighty [@giannis](https://github.com/giannis) and we had this library that
required setting up event handlers, pretty much in the usual form of:

```javascript
libObject.on('event', function(param) {
    // handling code using the same libObject.
    // It's very important and compulsory using libObject here.
    return libObject.someMethod();
});
```

No issues with that, but a new business requirement lead us to need many
instances of that `libObject`.

I thought about it the naive way and created an array with the `libObject`s,
then extracted the handler functions into standalone functions I could set in each
of the `libObject` pretty much like:

```javascript

var libObjectCollection = {};

var handlerfn = function(param) {

};

for (var key in libObjectCollection) {
    libObjectCollection[key].on('event', handlerfn);
}
```

And that is where the challenge begun, as in the `handlerfn` I could no longer
know which `libObject` instance I should call.

That's when might [@giannis](https://github.com/giannis) told me:
> mate, just use "bind" on the handlerfn, and pass in the key/id of the instance
you want.

Well, I already knew that functions are first class objets in javascript, and that they
can be passed around, and even have methods called on them. Specifically I already
knew about [`call`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
and [`apply`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply), 
but I had never had a case in which `bind` was needed.

So, first stop.. [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
> The bind() method creates a new function that, when called, has its this
keyword set to the provided value, with a given sequence of arguments preceding
any provided when the new function is called.

that meant I could go like:

```javascript

var handlerfn = function(libObject, param) {

};

for (var key in libObjectCollection) {
    libObjectCollection[key].on('event', handlerfn.bind(null, libObjectCollection[key], param));
}
```

The first parameter into the bind method is the new `this` or context underwhich the returned function
will run when called in the future.

Following is the key I need for `libObject` and last is whichever params the library will pass into 
the fn when calling.



Last but not least, as I pointed above ... this was the the naive way... In the 
very end, since this was a nodejs project and we were already using [PM2](http://pm2.keymetrics.io),
we just created n [different processes each with it's own configuration](http://pm2.keymetrics.io/docs/usage/application-declaration/) 
and didn't need to change the code.

Despite that I'm thankful I found this issue for now I've learned this lesson. BTW, badass developers
call this thing we tried todo with `bind` [currying](https://www.sitepoint.com/currying-in-functional-javascript/).


