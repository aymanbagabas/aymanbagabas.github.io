---
published: true
layout: "post"
title: "Suspend then hibernate in systemd 239"
comments: true
tags: linux systemd
---

In _systemd_ 239, they have added a new service that handles suspending then hibernating after a given amount of time. This is easier than using external scripts since it comes built-in with this version of _systemd_. You can check _systemd_ version with `systemctl --version`.

First, you have to define the delay time before the system wakes up and go into hibernation and that should be defined in _/etc/systemd/sleep.conf_

```conf
[Sleep]
HibernateDelaySec=15min
```

Here, what we care about is the last line `HibernateDelaySec` where you can define delayed time. As you see, I have it set to 15 minutes after suspending.

Lastly, we need to override the default suspend to execute suspend-then-hibernate instead of regular suspend:

```sh
ln -s /usr/lib/systemd/system/systemd-suspend-then-hibernate.service /etc/systemd/system/systemd-suspend.service
```

This will make systemd executes _suspend-then-hibernate_ instead of _suspend_ every time suspend is invoked.

#### Reference

[systemd-sleep.conf](https://www.freedesktop.org/software/systemd/man/systemd-sleep.conf.html "systemd-sleep.conf"){:target="\_blank"}

[systemd-suspend-then-hibernate.service](https://www.freedesktop.org/software/systemd/man/systemd-suspend-then-hibernate.service.html "systemd-suspend-then-hibernate.service"){:target="\_blank"}
