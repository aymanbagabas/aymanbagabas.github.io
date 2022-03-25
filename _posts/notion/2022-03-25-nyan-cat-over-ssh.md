---
layout:    "post"
title:     "Nyan Cat Over SSH"
comments:  yes
tags: ssh tui terminal
---

Everyone knows the Nyan Cat meme that started in 2011. The meme started from a [YouTube](https://www.youtube.com/watch?v=QH2-TGUlwu4) video that merged a Japanese pop song with an animated cartoon cat. Then a Telnet Nyan Cat server was created by [klange/nyancat](https://github.com/klange/nyancat). And now, in 2022, after 11 years of nyaning, it got ported to SSH!

# The Why

Well, to put it simply, why not port it to SSH! SSH is a safe and more modern protocol than Telnet is.

# The How

For this, I went with [charmbracelet/wish](https://github.com/charmbracelet/wish), which makes it easier to build SSH servers in Golang. Given it already has a middleware for the awesome [charmbracelet/bubbletea](https://github.com/charmbracelet/bubbletea) TUI framework, this just made the port much easier to implement. On top of that, I used [charmbracelet/lipgloss](https://github.com/charmbracelet/lipgloss) to do the styling and coloring.

# Implementation

Nyan Cat C implementation consists of multiple [frames](https://github.com/klange/nyancat/blob/master/src/animation.c) that then get translated to ANSI256 colors. Each character in these frames represents a color which then gets rendered as a background for 2 whitespace characters within a [90-millisecond](https://github.com/klange/nyancat/blob/master/src/nyancat.c#L385) interval (the default).

All that is done after the program determines the terminal size and whether or not to crop the frames before they are being rendered. Thankfully, I didn’t need to do any of those calculations, thanks to [NARKOZ](https://github.com/NARKOZ) port of [Nyan Cat in Golang](https://github.com/NARKOZ/go-nyancat).

[Bubbletea](https://github.com/charmbracelet/bubbletea) is a framework based on [The ELM Architecture](https://guide.elm-lang.org/architecture/) which basically means there are 3 main components, a model struct, an update function, and a view function. In this case, the model will have the terminal size (number of rows and columns), the program start time, and the frame index that should be rendered next. The update function waits for the 90-millisecond interval to pass before it can increment the frame index in the model. Which then triggers the view function to draw the contents in the terminal window.

## SSH Server

Here comes [charmbracelet/wish](https://github.com/charmbracelet/wish) into play. It makes creating SSH applications in Golang super easy. Just wrap your application in a Wish middleware that handles SSH operations like commands, public key or password access, users, etc.

The server works by receiving requests from clients, reading the client’s terminal window size, creating a Bubbletea program for that session with the given window size, and finally rendering the program to the SSH session.

# Where To Find?

You can find this project on Github [aymanbagabas/nyancatsh](https://github.com/aymanbagabas/nyancatsh). Or you could install it using `go install github.com/aymanbagabas/nyancatsh@latest`. If you want the non-ssh version that only uses Bubbletea `go install github.com/aymanbagabas/nyancatsh/cmd/nyancat@latest`

# Credits

This wouldn’t happen without these awesome projects:

- https://github.com/klange/nyancat
- https://github.com/NARKOZ/go-nyancat
- https://github.com/charmbracelet/wish
- https://github.com/charmbracelet/bubbletea
- https://github.com/charmbracelet/lipgloss
