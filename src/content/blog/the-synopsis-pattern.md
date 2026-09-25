---
title: The synopsis pattern
description: Happy-accident discoveries made while building a data MCP.
pubDate: 2026-09-25
---

My current job is somewhere between software engineering and data engineering, so it often requires writing a lot of SQL in BigQuery. A small amount of this ends up checked in as production code, but more often than not it's just one-off analysis to aid with understanding, debugging and decision-making.

Even [knowing some tricks](/blog/bigquery-syntax/), this is always quite a drag. It's a lot of typing, and IDE support is patchy at best. So I was thrilled when, around spring this year, LLMs got consistently good enough at GoogleSQL (BigQuery's dialect) that using them became faster than writing by hand. 

I began to wonder if AI could do some simple data investigations autonomously, especially the kind where finding the answer is slow but verifying is quick.

## Cost and motivation

Our BigQuery warehouse is priced [on-demand](https://cloud.google.com/bigquery/pricing?hl=en#on-demand-compute-pricing). That means you pay for the amount of data that each query reads. BigQuery offers several mitigations for this, including [clustering](https://docs.cloud.google.com/bigquery/docs/clustered-tables) and [partitioning](https://docs.cloud.google.com/bigquery/docs/partitioned-tables), as well as the ability to dry-run a query to see how much it would bill before executing it. 

Part of the analyst's job, then, is to dry-run, check the estimate, find out how the underlying table is partitioned and clustered, then optimise the SQL as appropriate. This was not an optional part of the job: I know of cases where an unoptimised auto-refreshing dashboard produced a six-figure bill (thankfully waived by GCP on that occasion).

Herein lay the first problem with letting an agent go autonomous. Agents are trained to complete the task you give them, and they may or may not follow additional instructions. When writing, dry-running and optimising a query was their goal, they did a great job; but as soon as a higher-level goal requiring multiple queries was in play, they tended to "forget" to dry-run and check costs and start spending more.

## Quotas and caps
I looked for the simplest solution first, and noticed that BigQuery does have [custom quotas](https://docs.cloud.google.com/bigquery/docs/custom-quotas), which can be set at the project level. So one option was to lean into this, by creating a new project to run these agents in.

While I was waiting for the new project to provision, I built myself [a simple MCP server](https://github.com/nawhi/bq-agent-gateway/tree/37d780dee708bc48fa459675eb5e566606f8e52c) to connect my agent to BigQuery with a hand-written version of the same thing: a cost cap of $5 per 12 hours. Agents submit SQL to a `query` tool, which alongside the results of the query returns some metadata about query cost and the remaining balance under the cap. It also provided the option to dry run a query to get a cost estimate.

This was the scene of the first happy accident. I realised that _the presence alone_ of a cost cap immediately incentivises agents to be efficient about cost. They started _caring_ about selecting few columns, dry-running to check cost, and iterating on partition pruning. The introduction of a "budget", visibly dwindling after each query, made them more careful than they had been with any static prompt!

BigQuery's built-in cost caps wouldn't have given this per-query visibility. So I kept the MCP.

## Enter The Synopsis
After a couple of months of daily usage, then expanding to some technical colleagues, I could see that the agent was rarely making mistakes in query correctness. I started wondering whether we could expand to less technical colleagues as well - by which I mean users who weren't necessarily able to check the correctness of the SQL themselves (though they could, and would, verify the numbers against canonical sources in our BI tooling and customer-facing platform).

The problem was that just looking at a SQL query is not enough to know whether it is correct _in the context of its session_. You need to know the question if you want to check the answer. 

This is where the second happy accident comes in. If you've used an LLM to generate code, or a coding agent, you'll know that they really, _really_ like to talk about what they're doing. They will put paragraphs and paragraphs of text into the chat window, into docblock and inline comments, into additional report documents and readmes, basically wherever.

I speculatively added a new `synopsis` field in the query tool, documented thusly:

`synopsis: string`<br/>
`One-sentence summary of the query motivation/context; logged for audit, so no PII.`

To my amazement, it had exactly the effect I was expecting. Agents were completely happy to explain what they were doing into this field. Including why they were doing it, and so on. They weren't ever trying to skip the field, or just adding a placeholder, and in the sessions I sampled I never once saw them lie. For example:

> _Total distinct clients with any active subscription, for an addressable-base dashboard tile_

> _AUD to USD conversion rate for a given month, to present client revenue in local currency_

> _List available reporting views/tables to locate channel performance sources for a client review deck_
 
I'd finally found a positive outlet for the LLM tendency to spew unnecessary context everywhere!

## Agent-driven development

The synopsis field, combined with BigQuery's own audit logs, gave me an observability dream. After a few weeks in production, I had a thousands-long labelled dataset of questions and answers. With this, I was able to identify problems, extract reproduction cases, make fixes, and also add evidence-based new features.

For example, the first iteration gave no indication of how agents should discover what tables were available to answer a question. They generally ended up guessing project names, and reading `INFORMATION_SCHEMA.COLUMNS` in the guessed projects. This meant they were finding legacy incorrect data, or needing user correction - something that we had been correcting intuitively, but non-technical analysts couldn't. I also noticed that agents were rarely discovering our [table functions](https://docs.cloud.google.com/bigquery/docs/table-functions), even when one existed that would have answered the exact question.

To fix this, I compressed an index of the supported surface (which doesn't change often) into the MCP's readme, and created a `catalogue` tool that described datasets, tables, table functions, views, and other objects in detail in a structured and controlled way.[^1] This stopped agents guessing at table names overnight, and reduced almost to zero the number of INFORMATION_SCHEMA queries they were running.

I've also been able to use the data to progressively increase the quality of the documentation around our BigQuery estate in an evidence-based way. For example, when agents were having to run expensive queries to guess the values of an enum value, I added the possible values to the column description and the guessing stopped straightaway.

## Agents aren't like humans

That agents comply so remarkably consistently with the synopsis request is a key and difficult-to-intuit difference between a human and an agent. As humans, we'd be deeply annoyed if we had to write a synopsis with every query. Accurately summarising context into a sentence or two is something we find difficult, and it seems irrelevant to the task at hand. We'd end up writing `"get data for report"` or `"asldkfjhsd"` or something equally useless just to get past the validation.

The incredible difference in performance between an upfront prompt saying "You may only spend \$5", and a repeated inline tool call result specifying how much of that \$5 the agent has left, was another surprising finding. If you can make a soft constraint (an instruction in the prompt) into a hard one (continuous evidence that their ability to complete the main task will degrade if they aren't careful), agents are much more likely to follow it.

I've also seen the huge need for a data-driven approach. When working with agents, we can never capture an entire task space in tests, because that means the entire space of English language - not to mention the fact that models are always changing and being upgraded. This is a world where hypotheses must more than ever be tested with real data before they are acted upon.

Learning how to appraise these kinds of differences, and build and plan for them, will be key to the level of performance, safety, and reliability that we can get out of agentic systems in the future.

[^1]: You'd think BigQuery would have one of these built in, and it sort of does for tables and views, but it's not quite fit for TVFs. For example, it doesn't give the return type of a TVF invocation, so I was finding agents ended up inspecting the function body instead just to find out types - I didn't want this, because our TVFs are often hundreds of lines of quite difficult and easily-misinterpretable code. To get around this, I had to get nasty: running `SELECT * FROM tvf(CAST(NULL AS type1), CAST(NULL AS type2), ...)`, produces a query that compiles just well enough to dry-run and return the column types in the job metadata.
