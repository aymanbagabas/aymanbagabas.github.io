---
layout: post
comments: true
date: 2023-04-13
title: Simple Vim Session Management
tags:
  - vim
  - nvim

---

Recently I switched back to using Neovim after being a VSCode user for a while. One of the things I miss in VSCode is the session management that comes bundled in. My brain became wired to doing things like `code <projectDir>` to open the editor with all files loaded just like the way I left them. Luckily in Vim, you can use `:mksession` to create sessions.


# The Problem


Just like VSCode, I want Neovim to save the session file under the project root directory. Specifically in `.nvim/session.vim`. I want Neovim to detect whether the opened file is a directory, and based on that, load the session file if exists. Before exiting Neovim, save the session file under the project root directory.


You see, I tried different plugins including [persistence.nvim](https://github.com/folke/persistence.nvim), [persisted.nvim](https://github.com/olimorris/persisted.nvim), [auto-session](https://github.com/rmagatti/auto-session), [sessions.nvim](https://github.com/natecraddock/sessions.nvim), and [project.nvim](https://github.com/ahmedkhalf/project.nvim). None of them achieved what I wanted.


# How?


Neovim supports sessions. You can use `:mksession` to create session files, and `:source <file>` or `nvim -S <file>` to restore a session. And with the `sessionoptions` option, we can tell Neovim exactly what to save in the session file. Simple just like that. Pairing that with `autocmd`s on startup and exit we can get what we want. Read more about this [`:h session`](https://neovim.io/doc/user/usr_21.html#21.4).


## The Config


First, we need to tell Neovim what to save in the session file. We do so using the `sessionoptions` option. In your `init.lua` add the list of session options you want to save and restore:


```lua
vim.opt.sessionoptions = "buffers,curdir,folds,help,tabpages,winsize,winpos,terminal,localoptions"
```


Here I’m choosing almost everything 🙂 Make sure to avoid adding `options` to the list since it will interfere with other plugins you might have. Read more about this [`:h sessionoptions`](https://neovim.io/doc/user/options.html#%27sessionoptions%27).


Now, we need to add out `autocmd`s on `VimEnter` and `VimLeave`. 


```lua
-- Simple session management on directory open
-- Here we check if the opened file is a directory.
-- Then we load the sessionfile if exists.
-- Set a global flag to save session later.
-- And lastly, we delete the extra directory buffer.
vim.api.nvim_create_autocmd("VimEnter", {
  callback = function(data)
    -- buffer is a directory
    local isdirectory = vim.fn.isdirectory(data.file) == 1
    if not isdirectory then
      return
    end

    -- save session before exit
    vim.g.save_session = false

    -- check if directory is a project directory
    for _, root in ipairs({ ".git", ".hg", ".bzr", ".svn" }) do
      if vim.fn.isdirectory(data.file .. "/" .. root) == 1 then
        vim.g.save_session = true
        break
      end
    end

    if vim.g.save_session then
      -- source session.vim if it exists
      local sessionfile = vim.fn.resolve(data.file .. "/.nvim/session.vim")
      if vim.fn.filereadable(sessionfile) == 1 then
        vim.cmd("source " .. sessionfile)
      end
    end

    -- wipe the directory buffer
    vim.cmd("bw " .. data.buf)
  end,
  nested = true,
})

-- Check if we are in the project root.
-- If we are, save the session file.
vim.api.nvim_create_autocmd("VimLeave", {
  callback = function(data)
    -- only save session if vim started on a directory
    if not vim.g.save_session then
      return
    end

    local sessionfile = ".nvim/session.vim"
    if vim.v.this_session ~= "" then
      sessionfile = vim.v.this_session
    end

    vim.fn.mkdir(".nvim", "p")
    vim.cmd("mksession! " .. sessionfile)
  end,
})
```


## Bonus


When using `git`, it can be annoying to see the `.nvim` directory in every project you have. You can ignore the file by adding it to a `~/.gitignore` and exclude the file contents from git.


```shell
echo '.nvim' >> '~/.gitignore'
git config --global core.excludesFile '~/.gitignore'
```


That’s it, hope this helps 😃.

