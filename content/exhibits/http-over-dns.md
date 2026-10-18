---
title: Browser data over DNS
summary: Browsertunnel sends arbitrary browser data through DNS prefetch requests. The channel is one-way because browser JavaScript cannot read the DNS answers.
category: Tunnelling
tags: browser, DNS, data transfer
image: /static/images/talk/slide-44.webp
source: https://github.com/veggiedefender/browsertunnel
status: published
updated: 2026-10-18T00:00:00Z
---

The browsertunnel proof of concept sends arbitrary data from a browser in DNS prefetch requests. Communication is one-way: browser JavaScript cannot read the DNS answers, so the technique cannot return data to the page.

The example shows how browser features can create an outbound data channel through DNS, with the one-way limit shaping what it can do.
