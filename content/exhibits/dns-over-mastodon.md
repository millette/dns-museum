---
title: DNS over Mastodon
summary: A Mastodon bot connects federated social messaging with DNS queries and reports whether the returned DNS data passed DNSSEC validation.
category: DNS over something else
tags: Mastodon, DNSSEC, federation
image: /static/images/talk/slide-21.webp
source: https://mastodon.gougere.fr/@DNSresolver
status: published
updated: 2026-10-18T00:00:00Z
---

Stéphane Bortzmeyer’s experiment connects DNS activity with Mastodon. The bot reports whether the DNS answer passed DNSSEC validation; that check applies to DNS data, not to a person’s social identity.

The example combines a federated social network with DNS queries and makes the validation status of the returned data visible in the social message.
