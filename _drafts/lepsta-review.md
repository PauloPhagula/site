---

---

The "pull request" is dead, long live "streams"! I just had a demo of @_lepsta with @sithembiso_k and I can tell you it
is the future of version control.

Looking back @github invented the pull request and managed to make it an indispensable thing of contemporary development
flow and along with it the way to facilitate reviews. PRs are good, and they work, yet, they're built on commits.
Committing just to sync changes is neither natural nor easy work, and that is what modern tools force us to do.

Commit based PRs, pretty as much like backups and SANs that used to work for sysadmins, -- who said Dropbox is not
necessary and would not be a thing -- will be replaced by code syncing. And @_lepsta is in the front-line when it comes
to a compelling offering for this market. They've invented the concept of "streams" which make for a more natural way of
collaborating.

Let's look at my particular use case. I keep records of all my transactions in plaintext -- more on this coming in
another post -- using a tool called ledger (see: https://www.ledger-cli.org/). I book the transactions every day,
but only commit them when I've reconciled. Now, the best time to record a transaction is right after it happened,
when it is still fresh on my memory.
If I'm at work, I go to my repo and record it. Same when I'm home. But mind you, I have to make a commit just to be able
to pick up from where I was (work, coffee shop or home). To circumvent this I had to use a syncing tool (Syncthing, but
could be Dropbox or anything similar) with the .git folder outside of it -- essentially separating the repo metadata
from the content in the repo.

Although this works, git and Syncthing have a completely different perception of what is "current" and what "version"
means, and deal with conflicts differently.

Lepsta makes this problem go away. And I'm sold. I can code at work, or wherever, and then continue from home or
wherever, no commit needed. I don't have to commit, commit, commit, just to sync my changes or open a PR. When I want to
work on something I just start a new stream, which is synced by Lepsta, and allows me to pickup my work from wherever
I want and share it with others for review.

What's more? This product is being build by young man, in Africa.
