---
layout: post
title: "Re-learning the JavaScript inheritance that doesn't exist"
date: 2017-04-06 08:00:00 +0200
categories: Coding
tags: javascript object-orientation
excerpt: "This post is not about getting started with JavaScript OO,
it's rather about clearing the confusion in our minds about JavaScript
OO concepts. Specifically it's an attempt to mark in my head a simple
truth: there's no inheritance in JavaScript...there's no such thing as
prototypal inheritance."
share_image: "/img/blog/javascript-inheritance-last-will-and-testament.jpeg"
---

![JavaScript Inheritance - Last will and Testament Image](/img/blog/javascript-inheritance-last-will-and-testament.jpeg)

Yes, they lied, big time. All you have is delegation and copying properties.
They say it's inheritance but that is due to JS trying to accommodate the
classical inheritance object-orientation model to cater for a smooth
transition of "Java" people into JavaScript.
Personally, I think this creates more confusion than it helps. If people
were taught straight from the beginning, the real gospel instead of trying
to "travestize" it for them there wouldn't be much confusion, but well,
it is what it is.

To understand why and how things came to be, we need to look a bit and
understand JavaScript's history.
In the beginning, when Brendan Eich was creating the language, his intention
was bring [Scheme](https://en.wikipedia.org/wiki/Scheme_%28programming_language%29)
into the browser, and that's where JS gets the whole prototype inheritance
thing (which doesn't exist). Overtime though, as Java was the mainstream
programming language back then, he was asked to "massage" the language as
to make it more "familiar" for Java developers, as they were JavaScript's
potential users ... and err... this is where things went wrong.
The massaging brought along `new` and other constructs that don't exist
in Scheme naturally.

One of the main concepts in prototypal inheritance (that doesn't exist)
is that of a **prototype**, so, let's start by getting into what that is
before touching other parts.

## What is a prototype

A prototype is a friend object (not parent) from which other objects
can borrow properties (values and functions/methods) by delegating the
lookup of properties they don't have to it;

A good analogy is: you need a pen but do not have a pen, but you have a
friend. So, you can ask it to your friend. But, then your friend may as-well
not have a pen, so, he'll ask it to his friend and so on and so forth.
Then, whenever a friend in your friends-chain has a pen, then it will
be passed (not down) through the chain until you, so you can use it as
yours.

The way this applies to JS, is that all objects have a property called
`__proto__` (not `prototype`, but which we -- creatively -- call "prototype")
that references a friend object to which they delegate property lookup
whenever they do not have the intended property. By default, this friend
object is `Object.prototype`.

An example illustrates it better:

We start by creating a simple dumb dog object with a sound property with
the value 'woof!'

```js
var dog = {
    sound: 'woof!'
}
```

We created the dog object using objects literals: `{}`. And just like
all other objects, when they are initially created (before `new` or
`Object.create()` does anything to them) the dog object has a `__proto__`
property that references the `Object.prototype` object.
We can verify this statement by doing a comparison or printing the
contents of both in the console.

```js
dog.__proto__ === Object.prototype // => true
console.log(dog.__proto__)
console.log(Object.prototype)
```

Now, considering the dog object created above, not very useful in its
presents state, let's say we'd like it to do something, say make a sound.
We could add a method on the dog object that allows it to make a sound,
but, lets consider that asides our dog object, our program will need
other objects to make sounds.
Well, we could add a function to each of those objects. But if we think
of it, we quickly realize it's impractical to have N copies of the same
function. So, instead, what we can do is create a "friend" object with
the function and then tell all of these objects to become friends with
it, such that we reuse that single method all over.

Applying that in JS would be something like:

```js
// Create the "future" friend object
var animal = {
    makeSound: function() {
        console.log(this.sound)
    }
}

// set the friend object. Makes `dog.__proto__` reference the animal object
Object.setPrototypeOf(dog, animal);
```

Now, we can safely call `dog.makeSound()` and have the output of `'woof!'`
as expected.

Note:

- animal is not a "parent" of dog. It's a friend.
- dog didn't inherit `makeSound` from animal. It delegated what it didn't
  have (`makeSound()`) to animal.
  Should it have inherited, then `makeSound()` would be its own property
  (we can verify if an object owns as property with `.hasOwnProperty(propertyName)`),
  and wouldn't go away when we remove it from animal. In the same way
  that if we add properties to animal, dog will be able to access them
  as if they were its own.

  ```js
    dog.hasOwnProperty('makeSound') // => false
  ```

## prototype vs `.prototype` vs `.__proto__`

prototype is the term used to speak of the friend object referenced by
`.__proto__` in any object.

`.prototype` is a property that exists in functions, to hold the reference
to the future "friend" of the objects created by call the function using
the `new` operator. Quite a mouthful, so let's dig into it.

The first bit that should be clarified is that almost everything in
JavaScript is an object, and that includes functions. Which means that
functions can have properties (values and methods).

The common function properties are: `name`, `length`, `arguments`,
`prototype`, `__proto__`, `constructor`, `call()`, `bind()`, `apply()`

We already seen what `__proto__` is and the important bit about it for
functions is that it references Function.prototype, the snippet bellow
proves the point.

```js
function sum(a,b) { return a + b; }

sum.__proto__ === Function.prototype // => true
```

We should turn our focus to the prototype property. What with it?

So, as said before, during the development of JS Brendan Eich was asked
to make it look like Java and so he introduced what Douglas Crockford
calls pseudo-classical inheritance (again doesn't exist for real).

The gist of pseudo-classical inheritance is that we create a function
which will be the constructor of new objects of its type. And then
we add properties that will be shared by the objects of that type in the
function's `.prototype` object. Then we instantiate objects of that type
by calling the function preceded by the new operator. Something like:

```js
function Person(name, birthdate) {
    this.name = name;
    this.birthdate = birthdate;
}

Person.prototype.getAge = function() {
    // some code in here that computes the age based on birthDate
}

var zezinho = new Person('Zezinho dos Anjos', Date('1989-03-23'))
```

At this stage what we already prove what was said earlier, that the
prototype property of functions serves to hold the value of the future
`__proto__` of objects created by invoking the function with `new`.

```js
zezinho.__proto__ === Person.prototype // => true
```

And it works just like before... for instance, `getAge()` is not a property
of zezinho, it was lent to him by the friend.

```js
zezinho.hasOwnProperty('getAge') // => false
```

This whole "prototype" as a function property construct was made to allow
the "Java" people to easily embark into JS and the way it works is with
`new` doing some "stuff" on the background.

If were to implement `new` ourselves it would look like:

```js
/**
    @param {function} constructorFunction - the constructor function
    @param {...*} constructorArguments - the constructor arguments
    @returns {object} the newly created object
 */
function makeNew() {
    // THIS IS NOT IMPORTANT BUT REQUIRED
    // ---
    var args = Array.prototype.slice.call(arguments);
    var constructorFunction = args.splice(0, 1)[0];

    // HERE IS WHAT MATTERS
    // ---

    // 1. create new obj with literals. Yes the only way there's ever to create objects. new and Object.create just use it internally
    var obj = {};
    // 2. Set "own" properties of obj, i.e. those that return true when queried via hasOwnProperty
    constructorFunction.apply(obj, args);
    // 3. set the "friend"/prototype of obj
    Object.setPrototypeOf(obj, constructorFunction.prototype);
    // 4. return the new object
    return obj;
}

var luizinho = makeNew(Person, 'Luizinho', new Date('1989-01-01'));
```

Finally to prove this works as the "normal"new

```js
zezinho.prototype === luizinho.prototype // => true
luizinho.hasOwnProperty('getAge') // => false
```

### Whats is this Object.create you've mentioned?

`Object.create(prototype)` is the child of Douglas Crockford, born on
the hate he has for pseudo-classical and inherently `new()`.

Object.create is a form of doing `new` the prototypal way, without the
awkwardness and indirection of pseudo-classical.

Implementing Object.create we would have, something like:

```js
/**
    @param {function} prototype - the object to set as prototype(__proto__)  of the new object
    @param {object} ownProperties - object with properties that are going to be copied to the new object
    @returns {object} the newly created object
*/
function objectCreate(prototype, ownProperties) {
     // 1. create new obj with literals. Yes the only way there's ever to create objects. new and Object.create just use it internally
    var obj = {};
    // 2. Set "own" properties of obj, i.e. those that return true when queried via hasOwnProperty
    for (var propName in ownProperties) {
        obj[propName] = ownProperties[propName];
    }
    // 3. set the "friend"/prototype of obj
    Object.setPrototypeOf(obj, prototype);
     // 4. return the new object
    return obj;
}
```

Our "zezinho" could be created like

```js
var person = {
    getAge: function() { /* ... compute and return age */ }
}
var zezinho = objectCreate(person, {name: 'Zezinho dos Anjos', birthdate: Date('1989-03-23')})

// we could also have done...
var zezinho = objectCreate(Person.prototype, {name: 'Zezinho dos Anjos', birthdate: Date('1989-03-23')})
```

Anyhow our proof:

```js
zezinho.hasOwnProperty('getAge') // false
zezinho.hasOwnProperty('name') // true

person.isHuman = function() { return true; } // adding something to prototype makes it "findable" to those who friended the object
zezinho.isHuman() // =>
```


## Conclusions

- There's no inheritance in JavaScript. Only property delegation and copying.
  - If a property is removed from the "friended object" object the other object no longer can use it
  - As we saw in the `objectCreate`, the `ownProperties` were copied from another object. We can expand on this and compose objects from others further improving reuse.
- There's only one way of creating objects and that's with object literals. `new` and `Object.create` just create the literal internally, add properties to it, link to a prototype and return it. No magic! We can implement this ourselves
- `__proto__` is a property of all objects (even functions)
- prototype exists as two concepts:
  1. the friend object to which objects delegate property lookup (`__proto__`) and
  1. the property of all functions used to keep future friend (read `__proto__`) object of new objects created by calling the function using the `new()` operator
- Prototypes exist as a form reuse. And the way they've been made / thought-of, they have a beautiful side-effect that the classical inheritance object-oriented form of reuse doesn't have, which is to save memory. That is, in the classical form, each instance of an object has all the details about it (the whole pack of properties it inherited), while with prototypes only references are kept to where to find the properties, so rather than say 1000 copies only 1 exists. This is exceptionally well thought, and is specially useful given the resource constraint limits imposed by the web browsers environment.
- The decision to add `new` and pseudo-classical pattern just created more confusion and disinformation to the community and language users. It should serve as a lesson to future endeavors


## Closing

Last but not least, I was only able to figure this out after watching the
[Object creation YouTube video series](https://www.youtube.com/playlist?list=PL0zVEGEvSaeHBZFy6Q8731rcwk0Gtuxub)
on [funfunfunction](http://www.youtube.com/channel/UCO1cgjhGzsSYb1rsB4bFe4Q)
by [Matthias Johansson](https://twitter.com/mpjme), so I strongly recommend
watching those to all JS people out there.

A zillion "Good Monday mornings!" for you Matthias.
