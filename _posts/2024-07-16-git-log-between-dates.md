---
layout: post
title: TIL - Git log between dates
date: 2024-05-08 15:41:00 +0200
categories: Coding
tags: til linux
excerpt: >
  A quick tip on how to check logs in a period
---

It's not uncommon for devs to need to recall what was committed in a
given period and/or by a particular individual, this information might
be necessary to help troubleshoot a bug that is suspected to have been
introduced in a period, or share the info during stand-ups, quarterly
reviews, or when drafting promotion cases. Usually, most resort to
browsing Jira's or GitHub's UI, and that works fine... unless you/they work in a
very fast-paced environment, using monorepos to make matters worse.

A simpler way to find the info could be to ask git for the log of commits
made by a particular author during a given period, as in the example below.

```sh
git log --since "April 1 2024" --until "June 30 2024" --author='Phagula' --oneline
```

Which could be further simplified by providing the dates in a natural language,
like

```sh
git log --since "2 weeks ago"
```

---

I'd be remiss to point out that a git log may not show the full picture,
as commits are not the only way people contribute to software projects,
but if you're for the most part a programmer, it is still quite a handy
tip to note.
