---
layout: post
title: How to get a list of commits that came before a specific one
date: 2023-12-26 15:56
categories: Coding
tags: git
excerpt: >
  A quick tip on how to get a list of commits that came before a specific one.
---


In Git, you can use the `git log` command to view the commit history. If you want to see a list of commits that came before a specific commit, you can specify the commit's SHA or a branch name in the `git log` command. Here's an example:

```bash
git log <commit-SHA>
```

Replace `<commit-SHA>` with the actual SHA of the commit you are interested in. This command will show you the commit history starting from the specified commit and going backward in time.

If you want to limit the number of commits displayed, you can use the `-n` option. For example, to show the last 10 commits before the specified commit:

```bash
git log -n 10 <commit-SHA>
```

If you're not sure about the commit SHA but know the branch name, you can use the branch name instead:

```bash
git log <branch-name>
```

If you're only interested in the commit SHAs and not the full log details, you can use the `--oneline` option for a more concise output:

```bash
git log --oneline <commit-SHA>
```

These commands will help you explore the commit history leading up to a specific commit. Adjust the options based on your specific requirements.
