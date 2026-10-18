---
title: DNS over IRC
summary: IRC carries hostname and IP mappings that a local cache and libc Name Service Switch use to resolve names without publishing them through DNS.
category: DNS over something else
tags: IRC, name resolution, libc Name Service Switch
image: /static/images/talk/slide-18.webp
source: https://purpleidea.com/blog/2020/09/01/inexpensive-dns-over-irc/
status: published
updated: 2026-10-18T00:00:00Z
---

This design exchanges hostname and IP mappings over IRC. A local cache and libc Name Service Switch make those mappings available to local applications as name-resolution results.

It is unusual because it uses a chat network for name resolution without sending DNS update requests or publishing the mappings in normal DNS.
