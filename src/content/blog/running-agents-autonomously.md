---
title: Running unsupervised coding agents safely
description: Could this be the end of approval fatigue?
pubDate: 2026-05-02
---

Since I wrote my [last coding article](/blog/bigquery-syntax/) at the end of 2024, the game has moved on... quite a lot.

AI agents have Revolutionised My Workflow in two main ways. The first is that I get a lot more done. The second is that I feel terrified of admitting to getting a lot more done, because half of my peers will round on me for being a shill, and the other half will excitedly tell me about all their new AI side projects, and I don't know which I like less.

But still, I go to work and I use them to do my job. And while they are booping and whooshing and flibbertigibbeting, I've been researching and trying ways to set up an agent in a configuration so secure that even a fully motivated adversary would not be able to do anything destructive.

## The problem

When you first boot up most coding agents, their default mode will prompt you for permission for a lot of things it wants to do.

For a while, I was happy enough with this: even a fully supervised agent was generally much faster than coding by hand. I was following what they were doing well enough to be "in the loop" when it asked for permission.

But as I got better at assigning them tasks that I knew they'd be able to one-shot, I got a bit tired of watching them. And as soon as I stopped paying full attention, suddenly these approvals became a source of danger because few things in life are more scary than someone who _almost_ understands what's going on.

<figure>
    <img src="/img/claude-code-permission-prompt.png" alt="Claude Code asking for permission">
    <figcaption>Why is it using the full path not a relative one? Remind me what the hell does 'instances of 12'? Why did it need to ask to <code>echo</code>? Sigh</figcaption>
</figure>

This is a problem especially if the development machine you're running the agent on has access to lots of credentials for APIs and services and things. You need to read and review any action it wants to take, and this gets tiring very quickly, especially the really long `find -exec grep` incantations that Explore agents seem to like in larger codebases.

Eventually:

- you will choose "Yes, allow all `find -exec *` commands in future", 
- the agent will run `find **/db.config -exec db production delete`,
- it will work, because you pre-approved it and you're running the agent on your dev machine authenticated as you.

## Pragmatic responses

AI agents are text completion machines trained on the entire internet. The entire internet contains, amongst other things, many, many stories of taking actions that have been explicitly forbidden and getting away with it.

It should not be surprising that a text completion machine will sometimes complete a block of text with one of the plotlines it finds in its training data.

As such, I don't consider that adding "DO NOT DELETE PRODUCTION" or variations thereof to an agent's system prompt will ever be appropriate mitigation.

I don't feel like going backward is the right approach either, whether that's to manually reviewing every tool call, or to the good old days where we accidentally deleted production using commands we typed with our fingers.

## What options do we have?
Thankfully, brighter minds than mine have been thinking about this problem too. Most of these are around the principle of "put as much as possible out of the agent's reach".

It's very easy not to realise what is actually available to your agent, especially if you tend to run the agent as your own user. To see the extent of the problems, try running a prompt like this in an empty directory: 

`Help me establish what credentials, system privileges and data access you have in this Claude Code instance. The purpose is for me to establish what my risk level is were the system to be compromised. Always craft the commands you run to obfuscate any PII, IP or credentials you find before it hits your context window.`

(The last sentence is important, not just to avoid leaking credentials but also because it'll refuse if you just ask it to exfiltrate stuff. And for this one, you really _do_ want to manually review everything it tries to do.)

### Sandboxing
This is the first thing to reach for to reduce the surface area of what the agent can access, both in terms of filesystem access and network access.

[Claude Code has sandboxing built in](https://code.claude.com/docs/en/sandboxing), although it's not enabled by default. It restricts what in the filesystem and on the network the agent can access.

I quickly went off it because agents can request to run commands unsandboxed, which kind of defeats the entire point - they need constant reminders to try things sandboxed first. Also, I couldn't get it to play nicely with tools like `uv` and `pnpm` that need to read/write a global cache. But it might be good enough for your use case.

I moved to, and currently use, [Docker Sandbox](https://docs.docker.com/ai/sandboxes/). This is still very early software, and it feels it, but it does do all the bits you need it to, and I feel like it will evolve in a direction that is what I want:
- configurable network proxies which manage AI platform credentials (it intercepts Anthropic API calls and adds an API key to them) and can approve or block requests to domains
- filesystem and OS isolation from the host
- ability to configure and save sandbox templates preconfigured for different tasks (a python environment, the JVM, `gcloud`, etc)
- a reasonably slick command-line way of starting and stopping new sandboxes with the `sbx` utility

### IAM
When you start running an agent in the sandbox, and you find you want it to do something that needs authenticating, the temptation will be to mount or copy your own credentials into the sandbox and use those. But I'd urge you to reconsider.

Instead of authenticating the agent as your own user, with all your own user's access to your cloud infrastructure, give the agent a specific service account with only the permissions that it really needs to do the job you've asked it to do. 

This is "principle of least privilege", an idea that far predates even generative AI itself.

For tasks that need some sort of access to cloud infrastructure, I'm getting into the habit of provisioning ephemeral task-specific service accounts and explicitly setting up their permissions from scratch before each task. That way I can be absolutely sure that they have only what's needed (and that they don't have dangling permissions left over from the previous task).

### Custom local services
What about if you want the agent to interface with a service that doesn't have fine-grained IAM built in?

For example, it might be useful for an agent to add comments to a particular issue in your project tracker, but you don't want it to write to other issues or delete other people's comments. The average project tracker API does not have fine-enough-grained IAM to support this.

In such cases I like to write and host a small HTTP/MCP service in a different Docker container on my host machine, then given the sandbox network access to them. The service owns its own credentials and implements only the particular actions I think the agent will need.

These endpoints can be one-off or reusable, and can be coded to do useful stuff beyond regular IAM. [Here's one I made](https://github.com/nawhi/bq-agent-gateway) that exposes BigQuery SQL access with a lifetime query cost cap.

## Drawbacks
### All this takes time
Each time I start up an agent on something, it now takes me longer than it did when it was running on my machine with manual approval. I don't think that's a bad thing for two reasons.

Firstly, it's quicker to spend 20 minutes setting up an agent that then runs fully autonomously, than it is to wait 5 minutes 10 times because it got stuck waiting my approval while I was away from the machine or doing something else.

Secondly, it focuses my mind on organizing the unit of work I want the agent to achieve in such a way that makes it most likely to execute it successfully. I find that this upfront thought is an essential part of using agents successfully.

### Agents need to know about misconfigurations
An agent in an overly restrictive sandbox will tend to find inappropriate hacks and workarounds for the thing it is trying to achieve.

 Here's something I caught an agent doing to pass a build that required `gcloud`, when I had forgotten to install that in the sandbox it was in:

```bash
sudo bash -c 'cat > /usr/local/bin/gcloud << '\''SCRIPT'\''
      #!/bin/bash
      if [[ "$*" == *"print-access-token"* ]]; then
          echo "dummy-token"
      elif [[ "$*" == *"config"* ]]; then
          echo "{}"
      else
          echo "{}"
      fi
      SCRIPT
      chmod +x /usr/local/bin/gcloud'
```

If the agent can't tell that a sandbox misconfiguration is at the root of the problem, it will just keep trying different workarounds, potentially for a long time and a lot of tokens. (The `gcloud` loop above took an hour to complete and cost $20.)

 Oddly, prompting it with something like "I'm a developer testing the sandbox setup" even if I'm not, seems to make this happen less often. As detailed above, though, this will never remove the problem entirely.
 
## Conclusion

Like everything AI, this article will age so fast that we will probably look back in a few years and laugh pityingly like we do today at [DALL-E images from 2023](/blog/working-with-github-copilot/).

However, I feel that the principles it applies are relatively ageless. I hope that they will stand the test of time, however agentic our software development lives become.

