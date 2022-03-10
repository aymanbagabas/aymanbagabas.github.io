---
layout: "post"
title: "Arch Linux on Matebook X Pro"
comments: true
tags: linux huawei archlinux
---

Recently, I got a new laptop, Huawei Matebook X Pro. It has an i7 8th Gen. Intel CPU, 16Gib of RAM, 512Gib of SSD storage, Nvidia MX150 GPU with 2Gib of DRAM, and a beautiful HiDPI and touchscreen. It also comes with a fingerprint sensor. The first thing I did was installing Arch Linux, because well I am a Linux user! In the end, everything was working properly except:

1. ~~Two out of four speakers.~~ See UPDATE1 down below
2. The fingerprint sensor.
3. ~~Some keys in the Fn row.~~ See UPDATE2

The installation was very straightforward and like every other Arch Linux installation process. I followed their [installation guide](https://wiki.archlinux.org/index.php/Installation_guide "installation guide"){:target="_blank"}. After the installation is complete, everything was working properly except for some minor issues.

### Installation

First, disable secure boot from the BIOS menu by pressing F2 while booting. Then have your Arch Linux installation media ready, then you can access the boot menu by holding F12 while booting. Once you boot into Arch Linux live boot image, you will notice that the font is too small, you can change that to use a large font with `setfont latarcyrheb-sun32`, or you could use any other font you like.

### Multi-lib repositories

You probably want to enable multi-lib repos to support 32-bit software. Just uncomment that in `/etc/pacman.conf` or add the following:
```conf
[multilib]
Include = /etc/pacman.d/mirrorlist
```

### Grub

I used [Grub](https://wiki.archlinux.org/index.php/GRUB "GRUB"){:target="_blank"} for the bootloader. Obviously, you want to use Grub for UEFI systems. For the ESP location, I had mine set to `/boot/efi` just to follow other Linux distors approach. Because of the HiDPI screen that comes with this laptop, Grub would very tiny to see, a quick fix is to set the `GRUB_GFXMODE` variable to something like `1600x1200x32`. The available values can be fetched from Grub command line by executing `videoinfo`. Edit your `/etc/default/grub` file to include these lines:
```conf
GRUB_GFXMODE=1600x1200x32
GRUB_GFXPAYLOAD_LINUX=keep
```
If you are dual-booting you should install the package `os-prober` to make Grub detect Windows partitions.
don't forget to regenerate `grub.cfg` using:
```sh
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

### After Installation

Because I have a dual-boot setup with Windows, I ran into a little problem after partitioning Windows partition. However, it was easily fixed using `ntfs-3g` package which includes the tool `ntfsfix`. After you complete the installation and boot into Arch, just run the tool with `-b` to fix bad sectors and `-d` to clear dirty flag:
```sh
sudo ntfsfix -b -d /dev/nvme0n1p3
```
In my case, my Windows partition was `/dev/nvme0n1p3`, you should change that based on your partition name. You can use `lsblk` or `blkid` to list all your partitions.

### AUR helper

One of Arch Linux beauties is AUR, where you can easily get any Linux package installed with ease. I used the tool `aurman` which is IMO one of the safest ones out there. Here is the full list of [AUR helpers](https://wiki.archlinux.org/index.php/AUR_helpers "AUR helpers"){:target="_blank"}. To install aurman:
```sh
git clone https://aur.archlinux.org/aurman.git
cd aurman
makepkg -si
```

### Desktop Environment

Since this device comes with a touch-enabled and HiDPI screen, I decided to go with Gnome because it supports these two things pretty well.
```sh
sudo pacman -S gnome gnome-extra
```
This would automatically install Gnome with Wayland. Wayland doesn't require any further configuration or drivers.

### Nvidia driver & Bumblebee

The MBXP comes with Intel UHD Graphics 620 and NVIDIA Geforce MX150. If you are planning to use the [Nvidia](https://wiki.archlinux.org/index.php/NVIDIA){:target="_blank"} card for gaming, rendering, or anything your best two options are using Prime technology with [Nouveau](https://wiki.archlinux.org/index.php/Nouveau){:target="_blank"} (open source NVIDIA driver), or use NVIDIA proprietary driver with [Bumblebee](https://wiki.archlinux.org/index.php/Bumblebee){:target="_blank"}. I decided to go with the later because it offers better performance. Install Bumblebee
```sh
sudo pacman -S bumblebee bbswitch nvidia mesa acpi_call lib32-virtualgl lib32-nvidia-utils
```
Enable Bumblebee service and add user to Bumblebee group:
```sh
sudo systemctl enable bumblebeed.service
sudo gpasswd -a $USER bumblebee
```
You probably need to [Enable NVIDIA card during shutdown](https://wiki.archlinux.org/index.php/Bumblebee#Default_power_state_of_NVIDIA_card_using_bbswitch){:target="_blank"} to avoid issues with using it.
Now we need to tell Bumblebee to use bbswitch for card switching. Edit `/etc/bumblebee/bumblebee.conf` to include this:
```conf
[driver-nvidia]
PMMethod=bbswitch
```
Sometimes Bumblebee doesn't detect the card which results in an error. You need to define the card BusID in `/etc/bumblebee/xorg.conf.nvidia`, just uncomment the line where it has "BusID" and set it to the actual device ID. You can get that using `lspci`. In my case, it was "PCI:01:00:0".

### Power Saving

I was able to get a great 8-10 hours of battery with low brightness. I am using [TLP](https://wiki.archlinux.org/index.php/TLP){:target="_blank"} for managing [power saving](https://wiki.archlinux.org/index.php/Power_management){:target="_blank"}.

#### TLP

Install TLP:
```sh
sudo pacman -S tlp tlp-rdw
```
Enable TLP:
```sh
sudo systemctl enable tlp.service
sudo systemctl enable tlp-sleep.service
sudo systemctl mask systemd-rfkill.service
sudo systemctl mask systemd-rfkill.socket
sudo systemctl enable NetworkManager-dispatcher.service
```
And since TLP enables NetworkManager by default, there is no need to enable that. You want to set TLP default mode to the battery. Edit `/etc/default/tlp` to have these settings:
```conf
# Operation mode when no power supply can be detected: AC, BAT.
TLP_DEFAULT_MODE=BAT

# Operation mode select: 0=depend on power source, 1=always use TLP_DEFAULT_MODE
TLP_PERSISTENT_DEFAULT=1
```
Also since we are using Bumblebee with Nvidia you have to make sure that TLP doesn't enable power management for the card which can break auto switching with Bumblebee. You should avoid using `powertop --auto-tune` since it enables power management resulting in breaking Bumblebee. Make sure you have these lines in `/etc/default/tlp` to exclude the Nvidia card from power management:
```conf
RUNTIME_PM_BLACKLIST="01:00.0"
RUNTIME_PM_DRIVER_BLACKLIST="amdgpu nouveau nvidia radeon"
```
Again make sure that you have the correct bus id for your card.

#### Audio

In `/etc/modprobe.d/audio_powersave.conf` add to enable audio power saving:
```conf
options snd_hda_intel power_save=1
```

#### WiFi

Since this laptop comes with Intel Wireless 8265, we can use `iwlwifi` power saving options. Add these options in `/etc/modprobe.d/iwlwifi.conf`:
```conf
options iwlwifi power_save=1 d0i3_disable=0 uapsd_disable=0
options iwldvm force_cam=0
```

#### Intel GPU

Power saving options for Intel GPU, just stick this line in `/etc/modprobe.d/i915.conf`.
```conf
options i915 enable_guc=3 enable_fbc=1
```

#### Suspend and Hibernate

Personally, I prefer hibernating my machine whenever I do not use it for a long time, that is why I use [suspend-then-hibernate](https://aymanbagabas.com/2018/07/18/suspend-then-hibernate.html){:target="_blank"}. Suspend to RAM works out of the box, but [hibernate](https://wiki.archlinux.org/index.php/Power_management/Suspend_and_hibernate#Hibernation){:target="_blank"} requires some work. First, make sure you have either a swap partition or [swap file](https://wiki.archlinux.org/index.php/Swap#Swap_file){:target="_blank"}. I went with swap file just because it does not require partitioning. According to Redhat [Recommended System Swap Space](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/installation_guide/sect-disk-partitioning-setup-x86#sect-recommended-partitioning-scheme-x86){:target="_blank"}, 1.5 of system RAM is the recommended amount of swap for hibernation which is 24Gb in this case.
```sh
sudo fallocate -l 24G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```
Now define that within `/etc/fstab` for auto mounting:
```conf
/swapfile none swap defaults 0 0
```
In order for hibernate to work, you have to define where the system should look for the resume image in your Linux partition. You can define that in the kernel parameter in your bootloader `resume=UUID=ce6dd35a-08d5-4b49-a46c-eff1de8937ce`. Here I am using partition UUID, you can get that with `sudo blkid`. Since I am using a swap file, I also have to define a `resume_offset=645120` which is the location of the swap file in the partition. You can get that using `sudo filefrag -v /swapfile`. Finally, add `resume` hook after `udev` and `i915` module in `/etc/mkinitcpio.conf`. Regenerate initramfs `sudo mkinitcpio -P`.

#### MISC

* Add `pcie_aspm=force` kernel parameter to enable ASPM (Active State Power Management).
* Disable watchdog, add `blacklist iTCO_wdt` to `/etc/modprobe.d/nowatchdog.conf`.
* Take a look at [Improving Performance](https://wiki.archlinux.org/index.php/Improving_performance){:target="_blank"} and [Power Management](https://wiki.archlinux.org/index.php/Power_management){:target="_blank"}.
* Regenerate initramfs `sudo mkinitcpio -P`.
* Regenerate grub.cfg `sudo grub-mkconfig -o /boot/grub/grub.cfg`.
* Install Plymouth.
* Enable auto-brightness `aurman -S iio-sensor-proxy`.

### Files

* Config files used in this post [etc.zip]({{ "/assets/stuff/etc.zip" | absolute_url }}){:target="_blank"}.

### UPDATE 1 - fix sound

You can fix the sound issue with `hdajackretask` which is part of `alsa-tools` package then follow this picture and click on "Install boot override":

{% include image.html file="/assets/images/hdajackretask.png" caption="HDAJackReTask" max-width="100%" %}

You might need to set "connectivity" to "internal" to get it working. Finally, recreate your initramfs `sudo mkinitcpio -P` and reboot.

### UPDATE 2

* Missing hotkeys `micmute, wlan, and pc manager` now work using [this](https://github.com/aymanbagabas/Huawei-WMI) driver. It will be part of linux 4.21 along with the speakers fix and micmute LED.
* Some people reported slow network connection with the above settings. To fix that, drop `uapsd_disable=0` from `/etc/modprobe.d/iwlwifi.conf`.
* Also if you were using full disk encryption, don't forget to add the speakers fix firmware files to `/etc/mkiniticpio.conf` like this: `FILES=(/usr/lib/firmware/hda-jack-retask.fw)`.
