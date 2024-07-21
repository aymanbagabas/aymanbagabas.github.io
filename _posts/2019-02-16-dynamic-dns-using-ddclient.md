---
published: true
layout: post
comments: true
title: Dynamic DNS using DDclient
tags: linux dns
---

[DDclient](http://ddclient.sf.net/) is a service used to update dynamic DNS entries on many services. It is useful if you need a DDNS client that can work with pretty much any DNS service. Most distributions provide `DDclient` in their official repositories. It is available on Debian-based systems, Fedora, Archlinux, and many more.

In my case, I need `DDclient` for my [NextcloudPi](https://ownyourbits.com/nextcloudpi/) server that runs on a Raspberry Pi 3B hooked up to a storage device. This server gives me access to my files anywhere anytime as long as it has a working internet connection. I'm using a free DNS service from [Dynu](https://www.dynu.com/) and in their [website](https://www.dynu.com/DynamicDNS/IPUpdateClient/DDClient), they go in details of how you would set up dynamic DNS using `DDclient`. It turns out that they use a `dyndns2` protocol by www.dyndns.com to provide this service.

Now after installing `DDclient`, the client can configure it under `/etc/ddclient.conf` where you can set the update interval, server address (in this case dynu.com), username and password, etc.

```
protocol=dyndns2
pid=/var/run/ddclient.pid
ssl=yes
use=web, web=checkip.dynu.com/, web-skip='IP Address'
server=api.dynu.com
login=[YOUR_DYNU_USERNAME]
password='[YOUR_PASSWORD]'
[YOUR_DNS_ADDRESS]
```

As you can see I'm using dynu.com server. Different DNS services would have different configurations.
