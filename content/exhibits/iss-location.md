---
title: ISS location
summary: A DNS LOC record publishes an approximate location for the International Space Station, updated every 15 minutes on a best-effort basis.
category: Tools and toys
tags: ISS, LOC records, geolocation
image: /static/images/talk/slide-30.webp
source: https://shkspr.mobi/blog/2025/07/get-the-location-of-the-iss-using-dns/
status: published
updated: 2026-10-18T00:00:00Z
---

Terence Eden’s example publishes the location of the International Space Station in DNS LOC records. It uses a DNS record type designed for geographic coordinates.

The result is a periodically updated approximate location that can be read with normal DNS tooling. The source says updates occur every 15 minutes on a best-effort basis. It also gives LOC records a rare moment in the foreground.
