---
published: true
layout: post
comments: true
date: 2025-03-11
title: A Brief History of Terminal Emulators
tags:
  - terminal

canonical_url: https://charm.sh/blog/intro-to-terminals/
---

If you're reading this, you've probably used a terminal emulator before. But
have you ever wondered how this modern—yet archaic—tool came to be?


In this post, we'll explore the history of terminal emulators, from the
earliest typewriters and teleprinters to modern video terminals and the
terminal emulators of today. Let's go!


## Early Terminals and Typewriters


![This Olivetti Lettera 22 typewriter is not a terminal, but terminals were totally based on typewriters. The new line and carriage return lever is on the left. On the right, the paper roller and the paper release lever. The cursor is the horizontal line on the paper where the next character will be typed.](https://charm.sh/typewriter.84227b29dbcbcea4.jpg)


No, people did not use typewriters to interact with computers, but the first
terminals evolved from typewriters. In case you are not familiar with
typewriters (wink wink, kids) typewriters started as mechanical devices
introduces in the 1840s to type text on paper. They feature a keyboard for
input and paper for output. A cursor indicated the current text position,
moving as the user typed. Special components such as levers, handles, and keys
enabled cursor movement, space insertion, and paper scrolling.


Now with typewriters, communication was simple: type a letter, and it appears
on the paper, and later on, you would mail it to someone. After the invention
of telegraphs and telephones, people wanted to send messages faster. This need
prompted the development of teleprinters, which could send and receive messages
over telegraph and phone lines.


### Teletype Writers (TTYs)


![The infamous low-cost all mechanical Model 33.](https://charm.sh/Teletype_model_33_asr.80233f95c693bbe9.jpg)


The Teletype Corporation trademarked the term "teletype" for its teleprinters
back in 1928. The name then became a synonym for all teleprinters especially in
the field of computers. The basic idea behind a teleprinter is simple, you
have two machines linked together by a wire or wirelessly. When you type a
letter on one machine, the other machine prints the same letter. This way, you
can send messages back and forth between the two machines. It's like a
typewriter, but instead of typing on paper, you're typing on a machine that
sends the message to another machine that prints it out to paper [^1](https://www.howtogeek.com/727213/what-are-teletypes-and-why-were-they-used-with-computers/).


The Teletype Model 33, shown above, was one of the most popular teleprinters in
the 1960s and 1970s. It was a low-cost all-mechanical teleprinter that could
send and receive messages over phone lines. What made it special was that it
could understand the ASCII standard which made it compatible with computers.


Later on with the advent of interactive computing, people started connecting
ASCII aware teleprinters to computers. This way, they could type commands on
the teleprinter, and the computer would execute them and send the results back
to the teleprinter. This setup allowed users to interact with computers in real
time, enabling a wide range of applications and use cases.


Slowly, in the 1960s and 1970s, companies such as IBM, HP, and DEC started
experimenting with computer terminals. These terminals replaced the teleprinters
which significantly reduced paper waste and improved user experience. However,
many computer operators stuck with the teleprinters because they were more
affordable and familiar.


> Fun Fact: The term "TTY" (short for TeleTYpe) is still used today to refer  
> to text-based terminals and terminal emulators in Unix-like operating systems.


## Computer Terminals


![VT100 was one of the first terminals to support ANSI escape codes and colors.](https://charm.sh/DEC_VT100_terminal.309584cced5167e.jpg)


The introduction of computer terminals marked a significant advancement in
terminal and computing technology. A terminal is a device that allows users to
interact with computers, execute commands, and manage files and systems. Video
terminals come with a keyboard that is connected to electromechanical CRT
displays. They replaced teleprinters connected to computers. Above is the
legendary DEC VT100 released in 1978 was one of the first video terminals that
supported ANSI escape codes and colors.


Unlike mechanical teleprinters and typewriters, computer terminals needed a way
to communicate with computers in a backward-compatible fashion. Think about it,
how would you tell the computer to move the paper up? Or instruct it to move
the cursor to the next line? In a non-mechanical world, they needed a way to
send these commands from and to the computer. This is where ANSI standards and
escape codes came into play.


Because of the popularity, features, and adoption of the DEC VT100, and because
it adhered to many ANSI standards, it influenced many other terminals to adopt
the ANSI standards as well which later became the de facto standard for
terminal emulators.


> Did you know? These standards are still relevant today, and they are the  
> reason why you can change the color of your terminal text, move the cursor  
> around, and clear the screen. The American Nation Standards Institute (ANSI),  
> formerly known as the American Standards Association (ASA), standardized the  
> ASCII character encoding which carried over to other standards such as X3.64,  
> ECMA-48, and ISO/IEC 6429 that are used today in terminal emulators.


## Terminal Emulators


As the name suggests, a terminal emulator is a software application that
"emulates" the functionality of a traditional computer terminal. Instead of
being a physical device connected to an external computer, a terminal emulator
is a software program that runs on a computer and provides a text-based
interface for interacting with the operating system.


Back in the day, computers were big, heavy, and expensive. They were usually
located in separate rooms, and users would interact with them using terminals
in a time-sharing fashion. With the advancement of personal computers and
operating systems, terminal emulators became popular as a way to interact with
the computer directly. It also provides users with a backward-compatible way to
run legacy applications and systems that were designed for the old days of
computers and traditional terminals.


### The Amazing XTerm


![XTerm was one of the early modern terminal emulators.](https://charm.sh/xterm-menus.af521a074c1bae30.gif)


Created in 1984, XTerm is a terminal emulator for the X Window System. It
started based on the DEC VT102 terminal specs and later incorporated features
from other DEC terminals like the VT220, VT320, VT420, VT520, and Tektronix 4014. Over time, XTerm introduced its own proprietary escape sequences, enabling
new features and enhanced functionality while adhering to most
ANSI, ECMA, and ISO standards.


As XTerm evolved and became more popular with new features, it influenced other
terminal emulators to adopt similar features and standards. This made XTerm a
kind of a standard when it comes to developing new terminal emulators. The
popular [Xterm.js](https://xtermjs.org/), no pun intended, gets its name from
the original XTerm but has no affiliation with it.


Today, XTerm is still being updated and improved, making it one of the oldest
still maintained terminal emulator out there.


### Modern Terminal Emulators


![Yes, this is Rio Terminal.](https://charm.sh/rioterm.a2cd97cf345db2af.png)


Nowadays, terminal emulators have evolved significantly from their early
predecessors. Modern terminal emulators offer a wide range of features and
customization options, allowing users to tailor their terminal experience to
their needs and preferences. These tools provide a powerful interface for
interacting with operating systems, executing commands, and managing files and
systems efficiently.


Some notable terminal emulators used today include:

- [Alacritty](https://alacritty.org/)
- [Apple Terminal](https://support.apple.com/guide/terminal/welcome/mac)
- [Ghostty](https://ghostty.org/)
- [GNOME Terminal](https://gitlab.gnome.org/GNOME/gnome-terminal) and other [VTE based terminals](https://gitlab.gnome.org/GNOME/vte)
- [iTerm2](https://iterm2.com/)
- [KiTTY](https://sw.kovidgoyal.net/kitty/)
- [Konsole](https://konsole.kde.org/)
- [Linux console](https://en.wikipedia.org/wiki/Linux_console)
- [PuTTY](https://www.putty.org/)
- [Rio Terminal](https://rioterm.com/)
- [Rxvt](https://rxvt.sourceforge.net/)
- [St](https://st.suckless.org/) (a.k.a. simple terminal)
- [Windows Terminal](https://learn.microsoft.com/en-us/windows/terminal/)
- [Xterm.js](https://xtermjs.org/) (not affiliated with XTerm)
- [XTerm](https://invisible-island.net/xterm/)

## ’Till Next Time


Terminal emulators have come a long way since the early days of typewriters and
teleprinters. It's fascinating to see how these tools have evolved over time,
adapting to new technologies and user needs. Stay tuned for more posts on
terminal emulators and escape sequences, where we'll explore these topics in
greater detail.

