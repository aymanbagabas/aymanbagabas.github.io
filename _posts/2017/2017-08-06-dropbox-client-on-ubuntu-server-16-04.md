---
layout: post
title: Dropbox client on Ubuntu server 16.04
date: '2017-08-06 23:19'
comments: true
---

Dropbox, in my opinion, is the best cloud service available. I wanted to have one shared dropbox folder that is accessible from all my virtual machines running on the server. I am using a ZFS drive as a storage drive, the dropbox folder is located in the ZFS drive. Dropbox service is running as a normal user, not the root, and the server is using systemd to start the service after booting the system.

First, you have to have the `libxxf86vm` library, in Ubuntu 16.04 you can install it using `sudo apt install libxxf86vm1` then download Dropbox.
```
wget -O dropbox-x86_64.tar.gz https://www.dropbox.com/download?plat=lnx.x86_64
```
and if you are running a 32-bit system use:
```
wget -O dropbox-x86.tar.gz https://www.dropbox.com/download?plat=lnx.x86
```

Now choose where you want to put Dropbox binaries and extract the files, in my case I used `/opt/dropbox`
```
sudo mkdir -p /opt/dropbox
sudo tar xzfv dropbox-x86_64.tar.gz --strip 1 -C /opt/dropbox
```
and because we are using a `/opt/dropbox` we have to link it to `~/.dropbox-dist`
```
ln -s /opt/dropbox ~/.dropbox-dist
```

Run dropbox as a normal user `/opt/dropbox/dropboxd` this will give you a link to login to your account or if you are running a GUI it will open your default browser with a link to authenticate your account. Ctrl-c to stop dropboxd.
As I said earlier, I want to put my Dropbox files on my storage drive. In my case I am using a ZFS drive located at `/pool/shared/` I moved the Dropbox folder from my home folder to `/pool/shared/Dropbox` then linked the Dropbox folder to my home folder.
```
mv ~/Dropbox /pool/shared/Dropbox
ln -s /pool/shared/Dropbox ~/Dropbox
```

Now if you want to control dropbox from the command-line you can use this tool
```
wget -O dropbox-cli.py https://www.dropbox.com/download?dl=packages/dropbox.py
```
You can move it to your PATH for easy access. You have to have `~/.dropbox-dist`, `~/.dropbox`, and `~/Dropbox` to use this tool. You can start/stop and check the status of the Dropbox service. The `~/.dropbox` folder is created after you start `dropboxd`.
For systemd to autostart Dropbox service simply create a new service at `/etc/systemd/system/dropbox@.service` with these configurations:
```
[Unit]
Description=Dropbox
After=local-fs.target network.target

[Service]
Type=simple
ExecStart=/opt/dropbox/dropboxd -p /home/%I/.dropbox/dropbox.pid
ExecReload=/bin/kill -HUP $MAINPID
KillMode=process
Restart=on-failure
User=%I

[Install]
WantedBy=multi-user.target
```
This is basically a systemd service that can control Dropbox daemon from command-line. You can enable/start Dropbox from systemd `sudo systemctl start dropbox@$USER.service` or if you want to enable it to start on boot `sudo systemctl enable dropbox@$USER.service`
