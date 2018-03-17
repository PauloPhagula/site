---
layout: post
title: Writing reliable and robust code with Design by Contract
excerpt: >
  This article explains: what Design by Contract is; how it came to be; why it
  helps us writing reliable and robust code; and why the technique should be on
  every developers toolbox. It also provides a code snippet succinctly explaining
  how it can applied in a simple common day-to-day scenario.
date: 2017-01-08 00:00:00 +0200
categories: Coding
tags:
  - Design by Contract
  - Python
  - Domain-Driven Design
share_image: "/content/2017/01/design-by-contract.png"
---

## (Emotional) Intro

Not a day passes without us hearing of some software woe that has happened
somewhere in the world. Bugs, bugs, bugs users scream...

I mean, Wikipedia even keeps a [list of the most "awesome" bugs in the world](https://en.wikipedia.org/wiki/List_of_software_bugs).

As software developers/engineers/craftsman/gardeners
in order to sleep peacefully at night we must make sure that no bugs are in our code.

But that's just thinking of ourselves. The real motivation for wanting reliable
and robust code is that:

* Software failures are expensive - so we want reliable software
* Software itself is expensive - so we want reusable software

In face of these two very critical quality demands on software, Design by Contract
emerges as the industry's most comprehensive method for ensuring reliability, by
which we mean:

* Correctness - software does what is supposed to do (works as per the specification)
* Robustness - software acts acceptably in cases in which it cannot do what it
  is supposed to

## So what is Design by Contract?

Coined by [Bertrand Meyer](https://en.wikipedia.org/wiki/Bertrand_Meyer)
*Design by Contract* (DbC), is an approach for designing software. It prescribes
that software designers should define formal, precise and verifiable interface
specifications for software components, which extend the ordinary definition of
abstract data types with *pre-conditions*, *post-conditions* and *invariants*.

These specifications are referred to as "contracts", in accordance with a conceptual
metaphor with the conditions and obligations of business contracts.

Software contracts are like business contracts, in that they are characterized
by relations of client-supplier and obligations-benefits.
Also, just like business contracts, software contracts can be broken, by either
party, by not meeting with their obligations.

The important bit here is that, since in software the contract must run within
its specifications, breaking a contract indicates the presence of a defect or bug.

----

# Pre-Conditions, Post-Conditions and Invariants

In software programming the smallest unit of functionality is a routine and so,
if we want to ensure reliability, we must tackle the problem at this level.
What DbC then says is that we must define correctness for any routine by clearly
and explicitly indicating its:

* pre-conditions - the conditions that must be true in order for the routine to
  work correctly
* post-conditions - the conditions that will be true after its execution, if the
  routine has worked correctly

And more than just defining the pre-conditions and post-conditions, we must embed
them into code, in such way that whenever the code runs, its self validating,
taking a pro-active position towards avoiding bugs rather than applying defensive
programming.

(Routines is old school we do classes and objects these days...)

The Object-Orientation paradigm, commonly used to design and program software,
gave us objects, a new unit of software after functions/routines. And so we must
also ensure that objects state is always valid. And in DbC we're meant to do it
by explicitly and clearly defining it's invariants.

* invariant - class/object wise conditions that must be valid at all times. They
  can be only invalid during a routine execution, but not before or after it.

If either a pre-condition, post-condition or invariant is violated an Exception
must be raised immediately, to stop the routine from not doing it's job properly
or the object from getting into invalid state.

## The Command-Query Separation Principle

Whenever we send messages to an object we're essentially doing two things:

1 - asking it to provide us with some insight about it's state
2 - asking it to mutate it's state

With that in mind, Meyer divides functions into two categories:

* Queries: questions we can asks to object instance
* Commands: actions to be taken by an object instance

Given this separation Meyer goes forward and provides us with the
Command-Query Separation CQS) principle:

> any routine should be a query or a command but not a mixture of the two

* any routing the changes the state of its target object should not return a value
* any routine that returns a value should change the state of its target object
* only procedures should do the computations that alter the state of objects.
  Functions should not do that
* a query is a way of asking a question about an object, and the process of
  answering that question should not change the object

### But why would we need this CQS?

The reason for CQS is that it is impossible for us to reason about the correctness
of the state of an object, by using queries that change the object. Because we
use the queries attributes and functions to construct our pre-conditions and
post-conditions. If one of the functions were to change the object then the
result would no longer be valid.

## How to implement DbC

The question about implementation is programming-tools bound, it mostly depends
upon the language one is using. Some programming languages like [Eiffel](https://en.wikipedia.org/wiki/D_(programming_language))
(designed by Meyer) and [D](https://en.wikipedia.org/wiki/Eiffel_(programming_language))
provide language keywords and constructs for applying it. But most "mainstream"
programming languages do not.

The fact that these languages don't provide tools for it though doesn't mean
we're by any means restricted from applying DbC. We just have to be a little bit
more creative. In fact all we need are boolean conditions and exceptions.

All we have to do is strategically place (based on verification type, i.e
pre-condition, post..) conditional checks in the code, that raise exceptions when
not met.

The whole gist of DbC is summarized in the code snippet bellow that exhibits an
example of an hypothetical Bank Account object, which as per DbC guidelines must
protect it self from getting into an invalid state.

```python
class Account(object):

    def __init__(self, name: Name, currency: Currency):
        self._name = name
        self._currency = currency

        # Checks Invariants (conditions that must always be true) for this object.
        self.protect_class_invariants()

    @property
    def balance(self) -> Decimal:
        """Query that fetches account balance."""
        return self._compute_balance()

    def deposit(self, amount: Decimal) -> None:
        """Command that records a new deposit transaction on the account."""

        # Checks Invariants (conditions that must always be true) for this object.
        self.protect_class_invariants()

        # Check Pre-Conditions (conditions that must be true for routine to work correctly)
        assert amount > 0, 'Deposit amount must always be greater than zero'

        # Keep a copy of the original object to verify post-conditions
        old = copy.deepcopy(self)

        # record a new transaction (mutate object)

        # Check Post-Condition (conditions that must be true after routine execution)
        assert self.balance == old.balance + amount

        # Checks Invariants (conditions that must always be true) for this object.
        self.protect_class_invariants()

    def protect_class_invariants(self):
        """Checks Invariants (conditions that must always be true) for this object.

        Raises:
            AssertionError: If any class invariant is not held.
        """
        assert self.balance > 0, 'Account balance must always be greater than zero'

    def _compute_balance(self) -> Decimal:
        """Computes account balance based on transaction history"""
        pass
```

## Benefits

* Because we have the contracts we don't have to do any guess work as to determine
  which routines we have to protect with try-catches
* The rules of execution are clear and simple, that is every call to a routine
  can complete in only two ways:
  * the routine fulfills its contract
  * the routine fails to fulfill its contract, raising an exception to its caller,
    which in turn can either retry of fail himself
* Built-in correctness
  * Specification kept with code
  * Self-checking, self-debugging code (if pre-condition is violated the caller
    is sick, if a post-condition is violated the callee routine is sick, if an
    invariant is violated then the last callee routine is sick)
* Basis for exception handling
  * Framework for robustness
* Higher reuse levels - due to code reliability

## Conclusion

DbC is a very simple and proven technique which every developer should learn and
try to apply to software being developed in order to guarantee robustness and
reliability

No framework/library/base class is necessary in order to use DbC. In fact I advise
against that, as any of those components, although saving key strokes, can
introduce a level of indirection to the code, which would otherwise be clearer
with, just the basic language features being used.

(It is arguable but) DbC in grand part takes care of unit-testing, as it is
constantly ensuring that it is doing things properly. Further more, this is what
unit testing tries to fix, and it does indeed do a good job, but it is not as
powerful because there's a limit to how much it can "spy" into the System Under
Test to assert if it is indeed working properly.

## Aside

From the idea of the CQS principle, [Gregory Young](https://twitter.com/gregyoung)
and [Udi Dahan](http://udidahan.com) derived [CQRS](https://msdn.microsoft.com/en-us/library/dn568103.aspx),
which is essentially applying CQS at an architectural level.
