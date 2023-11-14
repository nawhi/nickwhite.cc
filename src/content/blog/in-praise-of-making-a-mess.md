---
title: "In praise of making a mess"
pubDate: 2023-11-14
description: "Sometimes more disorder brings more order."
---

As a child, when I needed to tidy my room, I’d pull everything out of drawers and shelves and put
it in a heap on the floor. I’d then survey my empty storage, and the tangle of possessions beneath it, and start to
think more clearly about what should go where.

Every time I did this, I’d always notice how easy it was to find stuff for a few weeks afterwards, even if I had got
bored towards the end and crammed some of it into a misc drawer. From the vantage point of chaos, I could see more
clearly how to get organised.

### Mess making in the TDD cycle

Learning TDD as a junior engineer put me back in mind of this. The TDD cycle, when run to the letter, has a make-a-mess
stage - write the minimum code to make the test pass - then a tidy stage - refactor.

More experienced programmers often merge these stages, much like an experienced mathematician skips several stages of
working in their equations. That’s often fine, especially when the skipped bits are fairly trivial (e.g. lower down
the [transformation priority premise](https://blog.cleancoder.com/uncle-bob/2013/05/27/TheTransformationPriorityPremise.html)).

That said, knowing when to revert to an explicit red-green-refactor cycle is important. The experience itself of writing
the
minimum code, the easiest thing, is often explicitly needed to make clear what the refactor should be. I still remember
the first time I applied this consistently, and was suddenly able to test-drive algorithms that I couldn't work out
with pen and paper.

## Hacking to refactor

Explicitly making a mess is a great way to refactor mid-sized blobs of code too, especially API handlers or complex UI
reducers. Pull everything out into one massive procedure and see what happens. I am continually amazed at how often the
right abstractions just emerge almost by themselves.

Recently I had a feature to implement in a rather poorly designed corner of the code base. (What idiot wrote this,
anyway? Oh - me, six months ago.) It was just _not quite bad enough_ for me to put my finger on what was wrong. So I
checked out a branch, put a napkin over my head
like [a gourmet eating an ortolan](https://web.archive.org/web/20210303221803/https://www.telegraph.co.uk/foodanddrink/11102100/Why-French-chefs-want-us-to-eat-this-bird-head-bones-beak-and-all.html),
and hacked away for a few hours, doing the quickest thing to get my feature in.

At the end of the afternoon, the feature was done and I knew what was wrong with the design, because a handful of the
travesties I had committed all had a similar flavour. One field was on the wrong side of an abstraction and kept being
pulled in via a very convoluted route.

Back on main, I quickly and safely moved the field, and watched as the code smell
disappeared, a handful of helper functions became obsolete, and the feature slotted back in in a quarter of the time it
had taken to bodge.

In this case, the cumulative extra time cost of building on top of the poor abstraction would have quickly
eclipsed the few lost hours making the mess.

## Messy teams

I wonder if this applies to engineering culture more broadly, too. A touch of chaos might be the medicine a stagnant
team needs.

I saw this in action after joining a team that had just lost half its members and was finding it difficult to deliver.
The team lead suggested dropping all ceremonies except the retrospective, and adding each back in only when we all
agreed we missed it.

The resulting weeks were slightly chaotic, but at the end of it, _we all had a shared understanding of what we really
needed._ Nobody sat through another meeting feeling it was pointless, because they all knew exactly why it existed and
what would happen if it didn't.

## Provisos

I think there are two preconditions for mess-making to be a deployable strategy.

**The cost of mess should be small.** In code, this is usually a given - you make a mess on a throwaway branch which
doesn't get merged. There might however be a psychological cost: if your culture is very productivity-driven, a few days
spent experimenting with an alternative approach (or a few weeks in which you drop all your team ceremonies) might look
like a waste of resources.

I'm lucky to normally have worked in companies who understand coding is non-linear, and welcome spikes and
experimentation. In my team example, our management were interested in the long-term welfare of the team and therefore
willing to pay the short-term cost.

**You actually clear it up afterwards.** Many an engineer knocks something off the shelf and thinks, I’ll pick that up
later. I’ve got a hard deadline. It’s only prototype code. We’re starting the v2 rewrite any day
now. [Broken windows theory](https://www.britannica.com/topic/broken-windows-theory) applies: it takes extra dedication
to clear up if everyone else is leaving mess with impunity.

I'll reluctantly admit to very occasionally merging a mess and sticking the clean-it-up task on the backlog, never to
return to it. This is not good. It's why I like explicitly throwaway branches, because the temptation to just merge the
thing is removed entirely.

## Conclusion

Making a mess might be a good way to move forward. Be mindful of the paradox: the bigger the mess, the more likely it is
to produce killer insights, and the more likely it is to end badly.

If you can find a cost-effective way to figuratively throw everything onto the floor, your code and your team might
thank you for it.
