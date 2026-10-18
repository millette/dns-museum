---
title: File transfer over DNS
summary: FToDNS transfers files through DNS queries and answers, splitting data across a transport with strict size and timing limits. It does not implement the FTP protocol.
category: Tunnelling
tags: tunnelling, file transfer
image: /static/images/talk/slide-45.webp
source: https://github.com/neitzert/FToDNS
status: published
updated: 2026-10-18T00:00:00Z
---

FToDNS means “File Transfer over Domain Name Service”. It turns the small pieces available in DNS traffic into a path for moving files; it does not use the FTP protocol.

It sits beside HTTP, IP, and VPN examples as another answer to the same question: what happens when DNS is the only usable channel?
