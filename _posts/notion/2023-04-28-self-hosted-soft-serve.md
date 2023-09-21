---
layout: post
comments: true
date: 2023-04-28
title: Self-hosted Soft Serve
tags:
  - ssh
  - terminal
  - golang
  - tui

canonical_url: https://charm.sh/blog/self-hosted-soft-serve/
---

[Soft Serve](https://github.com/charmbracelet/soft-serve) is a self-hostable Git server for the command-line. It supports Git over HTTP(s), SSH, and the [Git Protocol](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols#_the_git_protocol). [Soft Serve](https://github.com/charmbracelet/soft-serve) also comes with a simple straight-forward user management interface for teams.


In this post, we will go through how to set up your [Soft Serve](https://github.com/charmbracelet/soft-serve) instance. This includes setting up SSH access, HTTPS using [Certbot](https://certbot.eff.org/), and how to manage your [Soft Serve](https://github.com/charmbracelet/soft-serve) instance.


## Prerequisites


In this post, we are assuming that you have a basic knowledge of networking, a general understanding of how to use Linux and the command-line, and are comfortable using `git` commands.


You will need:

- A server to run [Soft Serve](https://github.com/charmbracelet/soft-serve) on.
- A domain name to access your server (optional).

If you're using a cloud provider, make sure you have the right access settings before proceeding i.e. access tokens. Running [Soft Serve](https://github.com/charmbracelet/soft-serve) locally or on-premise will vary depending on your setup. This post will only cover setting up [Soft Serve](https://github.com/charmbracelet/soft-serve) on the host server using Systemd, reroute OpenSSH traffic, and set up [Certbot](https://certbot.eff.org/) for HTTPS.


We will be using a virtual machine running Ubuntu 22.04 hosted on the cloud. Many cloud providers provide virtual machine services. DigitalOcean calls them Droplets. EC2 if you're using AWS.


> Note: make sure you enable access to the server and add any firewall rules. Soft Serve uses ports 23231/tcp (SSH), 23232/tcp (HTTP), and 9418/tcp (Git). We will reconfigure Soft Serve to run on port 22/tcp (SSH) and 443/tcp (HTTPS), then use port 2200/tcp for OpenSSH shell access.


## Setting Up Soft Serve


We will start by installing [Soft Serve](https://github.com/charmbracelet/soft-serve) from Charm's APT repository, setting up a Systemd service, getting a [Let's Encrypt](https://letsencrypt.org/) certificate using [Certbot](https://certbot.eff.org/), and lastly, reconfiguring OpenSSH to access the shell on an alternate port (since Soft Serve will be using the default SSH port). Let the fun begin!


### Installing Soft Serve


[Soft Serve](https://github.com/charmbracelet/soft-serve) and all other Charm tools can be installed via APT/RPM repositories. Check out the [installation section](https://github.com/charmbracelet/soft-serve#installation) for more options. Since we're using Ubuntu, we can install [Soft Serve](https://github.com/charmbracelet/soft-serve) from the Charm APT repository:


```text
# Retrieve and import repository key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL <https://repo.charm.sh/apt/gpg.key> | sudo gpg --dearmor -o /etc/apt/keyrings/charm.gpg
# Add APT repository source
echo "deb [signed-by=/etc/apt/keyrings/charm.gpg] <https://repo.charm.sh/apt/> * *" | sudo tee /etc/apt/sources.list.d/charm.list
# Install Soft Serve & git
sudo apt update && sudo apt install soft-serve git

```


You're all set! You should now be able to run the `soft` binary.


```text
soft --version

```


Now that we have [Soft Serve](https://github.com/charmbracelet/soft-serve) installed, let's run it locally.


```text
soft

```


```text
Soft Serve is a self-hostable Git server for the command line.

Usage:
  soft [command]

Available Commands:
  help           Help about any command
  serve          Start the server

Flags:
  -h, --help      help for soft
  -v, --version   version for soft

Use "soft [command] --help" for more information about a command.

```


To start the server, we can run `soft serve`. This will create a data directory that will store the repositories and database.


```text
2023-04-28 server: Starting Git daemon addr=:9418
2023-04-28 server: Starting HTTP server addr=:23232
2023-04-28 server: Starting SSH server addr=:23231
2023-04-28 server: Starting Stats server addr=:23233

```


Well, well, we now have a running [Soft Serve](https://github.com/charmbracelet/soft-serve) instance! But, this would be tedious to run each time our server restarts. Luckily, systemd can help us start the process on boot.


### Systemd


Create a file under `/etc/systemd/system/soft-serve.service` and put your Systemd service configuration. Here we will be running [Soft Serve](https://github.com/charmbracelet/soft-serve) as `root` to simplify things. We will place the server's data under `/var/local/lib/soft-serve`. Make sure you have added your SSH authorized key to the `SOFT_SERVE_INITIAL_ADMIN_KEYS` environment variables. You can remove this later once the "admin" user is created and has your key.


For a full list of [Soft Serve](https://github.com/charmbracelet/soft-serve) server settings and environment variables refer to the [Server Settings](https://github.com/charmbracelet/soft-serve#server-settings) section.


```text
[Unit]
Description=Soft Serve git server 🍦
Documentation=https://github.com/charmbracelet/soft-serve
Requires=network-online.target
After=network-online.target

[Service]
Type=simple
Restart=always
RestartSec=1
ExecStartPre=mkdir -p /var/local/lib/soft-serve
ExecStart=/usr/bin/soft serve
Environment=SOFT_SERVE_DATA_PATH=/var/local/lib/soft-serve
Environment=SOFT_SERVE_INITIAL_ADMIN_KEYS='ssh-ed25519 AAAAC3NzaC1lZDI1...'

[Install]
WantedBy=multi-user.target

```


Now, reload Systemd configuration, enable and start the service.


```text
sudo systemctl daemon-reload
sudo systemctl enable soft-serve.service
sudo systemctl start soft-serve.service

```


We can check the logs using `journalctl -u soft-serve.service`.


> Tip: add -f flag to "tail" the logs as they appear. Useful when using tmux to keep an eye on logs journalctl -fu soft-serve.service.


### HTTPS Certificate


To be able to use HTTPS in [Soft Serve](https://github.com/charmbracelet/soft-serve), we will need to set up TLS certificates so that [Soft Serve](https://github.com/charmbracelet/soft-serve) can use an encrypted connection to communicate with the world. We will be using [Certbot](https://certbot.eff.org/) to issue us [Let's Encrypt](https://letsencrypt.org/) certificates. Following [Certbot instructions](https://certbot.eff.org/instructions), we will choose `Other` and `Ubuntu 20` for the instruction options.


> Note: if you're not using a domain name, you won't be able to issue an HTTPS certificate since Let's Encrypt doesn't allow the use of bare IP addresses. ZeroSSL is a great alternative that supports bare IP addresses.


![](https://stuff.charm.sh/blog/self-hosted-soft-serve/certbot-options.png)


Now, make sure you have updated your DNS records to point your server's IP address to your custom domain. This is typically done using a `A` record. This will vary depending on your DNS domain provider. We will be using `git.example.com` to demonstrate issuing a certificate for the subdomain `git`.


Install the `certbot` cli tool using `snapd` to issue the certificate for our domain.


```text
# Stop Soft Serve
sudo systemctl stop soft-serve.service
# Install certbot from snapd
sudo snap install --classic certbot
# Issue certificate
sudo certbot certonly --standalone
# Enter your email address
# Agree for terms of service
# Enter your domain(s): git.example.com

```


Voilà, we have an HTTPS certificate!


```text
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/git.example.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/git.example.com/privkey.pem
This certificate expires on 2023-07-28.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   <https://letsencrypt.org/donate>
 * Donating to EFF:                    <https://eff.org/donate-le>
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

```


Once we have our certificate, we will need to update our [Soft Serve](https://github.com/charmbracelet/soft-serve) configuration to use them and point to our new https:// address.


### Server Configuration


[Soft Serve](https://github.com/charmbracelet/soft-serve) stores its server configuration in the `config.yaml` file under the _data directory_. By default, it uses the relative path `data` as a _data directory_. You can override this by defining a `SOFT_SERVE_DATA_PATH` environment variable (as seen above in the systemd service file). This means that our `config.yaml` file lives under `/var/local/lib/soft-serve` since we have that as our _data directory_ path.


To use HTTPS default port (443), we have to tell [Soft Serve](https://github.com/charmbracelet/soft-serve) about our [Let's Encrypt](https://letsencrypt.org/) certificates. And since we are using a custom domain now, we need to update the server's public URL. This is the address that will you will be using to manage user access and `git clone` repositories. Lastly, we will make OpenSSH use a different port, so we can still have shell access on our remote host.


> Info: you can override configuration settings using environment variables. For example, to override the server's name add SOFT_SERVE_NAME='Git Melon' to your soft-serve.service file.


Let's edit the file and see what's in there 🤔


```text
# Make sure you have $EDITOR defined
# Use vim <3
# export EDITOR=vim
sudo $EDITOR /var/local/lib/soft-serve/config.yaml

```


Here, we can see the default [server configurations](https://github.com/charmbracelet/soft-serve/tree/newbase#server-settings).

- Change the `ssh.listen_addr` to use the default SSH port (22).
- Use `ssh://git.example.com` as our `ssh.public_url` (this will be used for clones over SSH e.g. `git clone git@git.example.com:repo.git`).
- Change the `http.listen_addr` to use HTTPS default port (443).
- Update `http.public_url` to point to use https:// and point to our custom domain `https://git.example.com`.
- Set `http.tls_key_path` and `http.tls_cert_path` to use the generated [Let's Encrypt](https://letsencrypt.org/) certificates.

The final configurations look like this:


```text
# Soft Serve Server configurations

# The name of the server.
# This is the name that will be displayed in the UI.
name: "Soft Serve"

# Log format to use. Valid values are "json", "logfmt", and "text".
log_format: "text"

# The SSH server configuration.
ssh:
  # The address on which the SSH server will listen.
  listen_addr: ":22"

  # The public URL of the SSH server.
  # This is the address that will be used to clone repositories.
  public_url: "ssh://git.example.com"

  # The path to the SSH server's private key.
  key_path: "ssh/soft_serve_host"

  # The path to the server's client private key.
  # This key will be used to authenticate the server to make git requests to
  # ssh remotes.
  client_key_path: "ssh/soft_serve_client_ed25519"

  # The maximum number of seconds a connection can take.
  # A value of 0 means no timeout.
  max_timeout: 0

  # The number of seconds a connection can be idle before it is closed.
  idle_timeout: 0

# The Git daemon configuration.
git:
  # The address on which the Git daemon will listen.
  listen_addr: ":9418"

  # The maximum number of seconds a connection can take.
  # A value of 0 means no timeout.
  max_timeout: 0

  # The number of seconds a connection can be idle before it is closed.
  idle_timeout: 3

  # The maximum number of concurrent connections.
  max_connections: 32

# The HTTP server configuration.
http:
  # The address on which the HTTP server will listen.
  listen_addr: ":443"

  # The path to the TLS private key.
  tls_key_path: "/etc/letsencrypt/live/git.example.com/privkey.pem"

  # The path to the TLS certificate.
  tls_cert_path: "/etc/letsencrypt/live/git.example.com/fullchain.pem"

  # The public URL of the HTTP server.
  # This is the address that will be used to clone repositories.
  # Make sure to use https:// if you are using TLS.
  public_url: "<https://git.example.com>"

# The stats server configuration.
stats:
  # The address on which the stats server will listen.
  listen_addr: "localhost:23233"
# Additional admin keys.
#initial_admin_keys:
#  - "ssh-rsa AAAAB3NzaC1yc2..."

```


This looks good so far. Now before we start [Soft Serve](https://github.com/charmbracelet/soft-serve) up again, we need to change the port that OpenSSH uses. This is specified in `/etc/ssh/sshd_config`.


```text
sudo $EDITOR /etc/ssh/sshd_config
# Uncomment `#Port 22`
# Change `Port 22` to `Port 2200`
# Or use the power of `sed` :)
sudo sed -i 's/^#Port 22/Port 2200/g' /etc/ssh/sshd_config
# Restart sshd
sudo systemctl restart sshd

```


You can now access your server's shell on port `2200`. Try it out: `ssh -i <my-precious-key> -p 2200 git.example.com`.


Now, let's start our [Soft Serve](https://github.com/charmbracelet/soft-serve) server again.


```text
sudo systemctl start soft-serve.service

```


View logs using `journalctl -fu soft-serve.service`. Verify the server is indeed running on `:22` and `:443`.


```text
Apr 28 20:33:39 ip-172-31-84-249 soft[7594]: 2023-04-28 server: Starting Git daemon addr=:9418
Apr 28 20:33:39 ip-172-31-84-249 soft[7594]: 2023-04-28 server: Starting HTTP server addr=:443
Apr 28 20:33:39 ip-172-31-84-249 soft[7594]: 2023-04-28 server: Starting SSH server addr=:22
Apr 28 20:33:39 ip-172-31-84-249 soft[7594]: 2023-04-28 server: Starting Stats server addr=localhost:23233

```


## Manage Soft Serve


Now that we successfully set up our [Soft Serve](https://github.com/charmbracelet/soft-serve) server, we want to manage users, server access, and repositories. Since we added our authorized key as an environment variable above, we should be able to see all the admin commands when `ssh -i <my-precious-key> git.example.com help`.


```text
Soft Serve is a self-hostable Git server for the command line.

Usage:
  ssh git.example.com [command]

Available Commands:
  help         Help about any command
  info         Show your info
  pubkey       Manage your public keys
  repo         Manage repositories
  set-username Set your username
  settings     Manage server settings
  user         Manage users

Flags:
  -h, --help   help for this command

Use "ssh git.example.com [command] --help" for more information about a command.

```


### Users and Access


You can manage users using the `user` command. For example, [Soft Serve](https://github.com/charmbracelet/soft-serve) creates a default `admin` user on the first run that uses the keys defined in `SOFT_SERVE_INITIAL_ADMIN_KEYS`. Let's verify that using the `info` command.


```text
$ ssh -i <my-precious-key> git.example.com info
Username: admin
Admin: true
Public keys:
  ssh-ed25519 AAAAC3NzaC1lZDI1...

```


We can add more keys using the `pubkey` command.


```text
ssh -i <my-precious-key> git.example.com pubkey add ssh-rsa AAAAB3NzaC1yc2...

```


Use the `user` command to create more users. Add `-a` to mark user as admin.


```text
ssh -i <my-precious-key> git.example.com user create lemon -a
ssh -i <my-precious-key> git.example.com user add-pubkey lemon ssh-rsa AAAAB3NzaC1yc2...

```


To change the current username, use the `set-username` command.


```text
ssh -i <my-precious-key> git.example.com set-username melon

```


### Repositories


Using the `repo` command, you can create, delete, import, and manage repository settings. You can add/remove collaborators using `repo collab`. Let's go through an example of creating a new repository, pushing code, and adding a new collaborator who can access the repo.


First, we will create a new repository.


```text
ssh -i <my-precious-key> git.example.com repo create hula-hoop

```


If you ssh into the server (without any arguments) you should see the TUI and the new repository.


![](https://stuff.charm.sh/blog/self-hosted-soft-serve/hula-hoop-tui-selected.png)


### Push to Repository


Now, let's push some files to the repository.


```text
# Clone the repository
git clone git@git.example.com:hula-hoop.git
cd hula-hoop
# Change default branch
git branch -M main
# Add content
$EDITOR README.md
git add README.md
git commit -m "Add README.md"
git push origin main

```


### Collaborators


Let's add the user `lemon` that we created earlier as a collaborator. The command `add` takes a _repository_ name and a _username_ as arguments. `repo collab add REPOSITORY USERNAME`.


```text
# Add user as a collaborator
ssh -i <my-precious-key> git.example.com repo collab add hula-hoop lemon
# List repository collaborators
ssh -i <my-precious-key> git.example.com repo collab list hula-hoop

```


### Nested Repositories


[Soft Serve](https://github.com/charmbracelet/soft-serve) also supports nested repositories, you can create repositories with any arbitrary path. Go wild!


```text
ssh -i <my-precious-key> git.example.com repo create my/super/nested/new
ssh -i <my-precious-key> git.example.com repo create my/super/nested/new/repository

```


### Mirrors


You can also _import_ repositories from _any_ public remote. Use the `repo import` command.


```text
ssh -i <my-precious-key> git.example.com repo import soft-serve <https://github.com/charmbracelet/soft-serve>

```


Use `--mirror` or `-m` to mark the repository as a _pull_ mirror.


### Metadata


In [Soft Serve](https://github.com/charmbracelet/soft-serve), a repository has different properties. Repositories can be _hidden_, _private_, or _mirrored_. Repositories can also have their own descriptions and a _project name_ different from the repository's name. For example, we want the repository we imported above to be presented as `Soft Serve` rather than `soft-serve`. To do so, let's set the repository _project name_.


```text
ssh -i <my-precious-key> git.example.com repo project-name soft-serve 'Soft Serve'

```


Let's also add a description to this repository.


```text
ssh -i <my-precious-key> git.example.com repo description soft-serve 'The hackable self-hosted Git server!'

```


![](http://stuff.charm.sh/blog/self-hosted-soft-serve/soft-serve-in-da-house-tui-nested.png)


For more info on repository commands try `repo help`.


## What's Next?


That's it for now. Check out [Soft Serve's README](https://github.com/charmbracelet/soft-serve/blob/main/README.md) for more information on how to use [Soft Serve](https://github.com/charmbracelet/soft-serve).


Till next time, happy hacking!

