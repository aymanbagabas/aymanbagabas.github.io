---
layout: "post"
title: "Suspend then hibernate in systemd 239"
comments: true
tags: linux systemd
---

In *systemd* 239, they have added a new service that handles suspending then hibernating after a given amount of time. This is easier than using external scripts since it comes built-in with this version of *systemd*. You can check *systemd* version with `systemctl --version`.

First, you have to define the delay time before the system wakes up and go into hibernation and that should be defined in */etc/systemd/sleep.conf*
{% highlight conf %}
[Sleep]
HibernateDelaySec=15min
{% endhighlight %}

Here, what we care about is the last line `HibernateDelaySec` where you can define delayed time. As you see, I have it set to 15 minutes after suspending.

Lastly, we need to override the default suspend to execute suspend-then-hibernate instead of regular suspend:
```
# ln -s /usr/lib/systemd/system/systemd-suspend-then-hibernate.service /etc/systemd/system/systemd-suspend.service
```
This will make systemd executes *suspend-then-hibernate* instead of *suspend* every time suspend is invoked.

#### Reference
[systemd-sleep.conf](https://www.freedesktop.org/software/systemd/man/systemd-sleep.conf.html "systemd-sleep.conf"){:target="_blank"}

[systemd-suspend-then-hibernate.service](https://www.freedesktop.org/software/systemd/man/systemd-suspend-then-hibernate.service.html "systemd-suspend-then-hibernate.service"){:target="_blank"}

