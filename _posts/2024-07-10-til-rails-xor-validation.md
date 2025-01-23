---
layout: post
title: TIL - Rails XOR validation
date: 2024-07-10 19:27:00 +0200
categories: Coding
tags: til ruby rails
excerpt: >
  I learned how to do XOR validation
---

Talk is cheap, show me the code

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
