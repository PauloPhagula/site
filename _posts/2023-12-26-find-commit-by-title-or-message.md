---
layout: post
title: Find a commit by title or message
date: 2023-12-26 15:53
categories: Coding
tags: git
excerpt: >
  A quick tip on how to find a commit by title or message.
---

To find a commit in a version control system (such as Git) based on its commit message content, you can use the `git log` command with the `--grep` option. Here's an example:

```bash
git log --grep="your commit message content"
```

Replace "your commit message content" with the actual content you are looking for. This command will display a list of commits that match the specified commit message content.

If you want to search in a specific branch, you can specify the branch name:

```bash
git log branch_name --grep="your commit message content"
```
