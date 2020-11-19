---
layout   : "post"
title    : "Sync Google calendar using Vdirsyncer and Orage"
date     : 2018-04-08
comments : true
tags: google-calendar vdirsyncer caldav xfce linux
---

For a long time I wanted to have all my calendars and todo lists synchronized with my current desktop setup. Currently, I am using XFCE software, like Thunar, with Openbox to manage everyday stuff. Yes, I know with Gnome DE you can achieve that easily, but Gnome has a HUGE package dependencies. XFCE on the other hand is very light-weight and simple.

The other wonderful piece of software is [vdirsyncer](https://vdirsyncer.pimutils.org). It supports CalDAV protocol which is also supported by Google calendar. With simple configurations we can synchronize Google calendar locally. Then we can use Orage to view/modify our calendar files. Orage is a time-managing application that can manage your calendars, appointments, alarms, and todo lists.

First, make sure we have all the needed packages. Orage and Vdirsyncer should exist in most distros official repositories. In Archlinux, the installation can be done with `sudo pacman -S vdirsyncer orage`. It would be similar for other distros as well. Ubuntu/Debian `sudo apt-get install vdirsyncer orage`.

![orage]({{ "/images/orage1.png" }}){: .center-image }

Here you can see how orage highlights dates with events attached to them. For example, April 1st is Easter Sundy. That was pulled from my Google United States holidays calendar.

![orage]({{ "/images/orage2.png" }}){: .center-image}

### Vdirsyncer setup

First, we start by configuring Vdirsyncer to sync Google calendars. My configuration file looks like this:

{% highlight conf %}
[general]
status_path = "~/.vdirsyncer/status/"

[pair calendar]
a = "google_calendar"
b = "local_calendar"
collections = ["from a", "from b"]
metadata = ["color"]

[storage local_calendar]
type = "singlefile"
path = "~/.calendars/%s.ics"

[storage google_calendar]
type = "google_calendar"
token_file = "~/.vdirsyncer/google_token"
client_id = "CLIENT_ID"
client_secret = "CLIENT_SECRET"
{% endhighlight %}

Here, we specified were the status for Vdirsyncer should be located. Mine is located under ~/.vdirsyncer/status. Then we tell Vdirsyncer to create a pair of calendars for bidirectional syncing, where **a** is the actual Google calendar, and **b** is the local files pulled from the cloud. Then we define the two calendars as storages.

* storage local_calendar, here we specify what the type of this storage which is "singlefile" meaning Vdirsyncer would have a single file for each calendar that you have.
* storage google_calendar, here where it gets interested. The type here is "google_calendar" which means use Google cloud to fetch the calendars. With this type you have to specify a token file, client id, and client secret. All of these are essential for synchronizing.

Now we have to enable CalDAV API for our Google account.

1. Go [here](https://console.developers.google.com) and create a new project. This is required so that you can enable CalDAV API for that project.
2. Click on "Enable APIs and Services" or on the left side click on Library, then search for "CalDAV" and enable it.
3. Now we need to get our credentials, client secret and id, for the API. Click on "create credentials" then choose "CalDAV API" for your API and select "Other" for Application type. Click next and choose a name e.g. "vdirsyncer" then click continue.
4. You will get your client id, stick it into your configuration file.
5. We still missing the client secret. Click done after you get the client id then click on the credentials name and get the client secret from there.

Now we have Vdirsyncer config setup, we need to authorize it to access our Google account.

```
$ vdirsyncer discover calendar
```

This will try to authorize the pair 'calendar' defined in the config file. A browser window or a link should pop up to complete the authorization and that would create the access token defined in the config.
Now we can synchronize Google calendar by

```
$ vdirsyncer sync
```
Read more about [Vdirsyncer](https://vdirsyncer.pimutils.org/en/stable/index.html).

### Orage setup

Now we need to tell Orage where are the calendar ics files so that we can view them in Orage. Run Orage then go to File -> Exchange data, and add all the pulled ics files from ~/.calendar. Notice the read only check mark, if you want to modify your Google calendar you have to make sure to uncheck that when you add your calendar file which is the same as your Google account name "google@gmail.com.ics".
You should see all your calendars events highlighted within Orage. You can play with Orage settings to hide the window borders and tray icon. When double click on a date an events window should pop up then you can add events, todo, etc, but make sure you select your Google account file from the top bar in order to have it synchronized.

### Using Cron to synchronize periodically

You can add a cron to automate the sync command. `crontab -e`

```
MAILTO=""
@hourly vdirsyncer sync
```

This will sync calendars every hour. Make sure you have a cron service running. I am using "cronie" for my setup and with Archlinux, I had to enable the cronie service for that to happen.

```
$ sudo systemctl enable cronie
$ sudo systemctl start cronie
```

