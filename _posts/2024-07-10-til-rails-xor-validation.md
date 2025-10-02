---
layout: post
title: TIL - Rails XOR validation
date: 2024-07-10 19:27:00 +0200
categories: Coding
tags: til ruby rails
excerpt: >
  Learn how to implement XOR (exclusive OR) validation in Ruby on Rails models to ensure exactly one of two fields is present.
---

When building forms and APIs in Rails applications, we often need to validate that exactly one of two fields is present, but not both. This is known as XOR (exclusive OR) validation. For example, you might want to ensure a user provides either an email OR a phone number for contact, but not both or neither.

## What is XOR?

XOR (exclusive OR) is a logical operation that returns true when exactly one of its operands is true, but false when both are true or both are false. In validation context, this means:

- If field A is present and field B is absent → Valid ✅
- If field A is absent and field B is present → Valid ✅
- If both fields are present → Invalid ❌
- If both fields are absent → Invalid ❌

## Implementation in Rails

Here's how to implement XOR validation in a Rails model:

```ruby
class SomeClass
  include ActiveModel::Validations

  validate :a_or_b?

  private

  def a_or_b?
    return if a.blank? ^ b.blank?
    errors.add(
      :base,
      :a_or_b_required,
      message: 'either a or b must be present, but not both'
    )
  end
end
```

Let's break down how this works:

1. We use Ruby's XOR operator (`^`) to compare the `blank?` state of both fields
2. `blank?` returns `true` if the field is `nil`, empty, or contains only whitespace
3. The validation passes only when exactly one field is blank
4. If validation fails, we add an error message to the model

## Real-world Example

A common use case might be a Contact model where you want to ensure users provide exactly one contact method:

```ruby
class Contact
  include ActiveModel::Validations

  attr_accessor :email, :phone_number

  validate :contact_method?

  private

  def contact_method?
    return if email.blank? ^ phone_number.blank?
    errors.add(
      :base,
      :contact_method_required,
      message: 'Please provide either an email or phone number, but not both'
    )
  end
end
```

This ensures your application collects exactly one piece of contact information, making your data requirements clear and consistent.
