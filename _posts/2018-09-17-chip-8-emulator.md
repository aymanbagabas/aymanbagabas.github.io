---
layout: post
title: Writing a Chip-8 emulator
comments: true
tags: cpp sdl2 chip8 emulation
---

If you ever played retro games on modern computers, then you probably know what an emulator is. Chip-8 is an interpreted programming language that was created originally by [Joseph Weisbecker](https://en.wikipedia.org/wiki/Joseph_Weisbecker){:target="_blank"}. Chip-8 programs get interpreted by a virtual machine. It offers a very simple monochrome graphics and uses a 4Kb of memory. It has the "8" part because all the system's components, like CPU registers, have a size of 8 bits or 1 byte.

## What is an Emulator?

The idea of an emulator is the same across any operating system. You basically try to translate the instructions of one system to another. The process of translation is done in three main parts:

* Fetching opcodes
* Decoding opcodes
* Executing opcodes

These three steps happen in the CPU which is the main component of a system. The first step is to read operation codes from the program, then the CPU tries to decode these codes and then executes them accordingly.

## Chip-8

<div class="center-image" style="width:50%;">
![Space Invaders](https://github.com/aymanbagabas/C8emu/raw/master/shot1.png){: .center-image .img-thumbnail .img-responsive}
</div>

Before you get very excited, you really have to understand how the system works and behaves. Get familiar with your binary and hexadecimal conversions. A hex viewer may come handy when debugging a program.

### CPU and Memory

Chip-8 is a simple system that has 16 CPU registers, each takes information up to 8 bits (1 byte). The program counter, I register, opcode placeholder, and a stack pointer, all have a size of 16 bits (2 bytes). Memory is a 4Kb memory where the first 512Kb is reserved for the interpreter which, this makes most programs written for the Chip-8 start at location 512. A minimal of 16 level stack pointer is required and it is used to store return locations from the program counter register.

### Timers

There are two timers both countdown from 60 to 0. Delay timer is used for program events and its value can be set and read. And a sound timer which plays a beep whenever it reaches 0. After every operation execution, both timers get subtracted by 1.

### Input
The Chip-8 uses 16 keys of input, (0x0-0xF) which are usually mapped to:

```
1 2 3 C        1 2 3 4
4 5 6 D   --\  Q W E R
7 8 9 E   --/  A S D F
A 0 B F        Z X C V
```

Usually '2', '4', '8', and '6' are used for directions.

### Graphics

The Chip-8 has a 32x64 pixels monochrome display. It draws graphics on the screen using sprites. "A sprite is a group of bytes which are a binary representation of the desired picture." And they may take up to 15 bytes. Chip-8 provides a set of predefined sprites for representing hexadecimal digits from 0 to F. For example:

```
  "1" |	Binary   | Hex
------+----------+-----
  *   | 00100000 | 0x20
 **   | 01100000 | 0x60
  *   | 00100000 | 0x20
  *   | 00100000 | 0x20
 ***  | 01110000 | 0x70

  "F" | Binary   | Hex
------+----------+-----
****  | 11110000 | 0xF0
*     | 10000000 | 0x80
****  | 11110000 | 0xF0
*     | 10000000 | 0x80
*     | 10000000 | 0x80
```

These sprites should be stored in the reserved interpreter area 0-512 of memory.

## Implementation

Start with the big picture, how does your computer works? After you boot your computer it starts initializing components and devices. This includes inputs, outputs, graphics, CPU, etc. Then it loads the system and starts executing instructions sequentially. The main loop should look something like this:

``` cpp

#include // Chip-8 system
#include // Input
#include // Graphics

int main(int argc, char **argv) {
    initChip8();
    initInput();
    initGraphics();

    loadROM("INVADERS");

    while(systeIsRunning) {
        // Execute instruction
        executeOP();

        // Refresh display if flag is set
        if (drawFlag)
            drawGraphics();

        // Play beep if flag is set
        if (playSound)
            playBeep();

        // Set input and set keys states
        setInput();
    }
    return 0;
}

```

Chip-8 should implement ways to load and execute instructions:

``` cpp

void initChip8() {
    // initialize system
    // memory
    // registers
    // stack
    // graphics
}

void loadROM(file) {
    // read file into memory
    // starting from location 512Kb
    // or 0x200 in hex
}

void executeOP() {
    // fetch opcode
    opcode = (memory[pc] << 8) + memory[pc + 1];
    // decode opcode
    switch (opcode & 0xF000) {
        // execute opcode
        case 0x0:
            if (opcode == 0x00E0)
                clearDisplay();
            elseif (opcode == 0x00EE)
                // return from subroutine
        case 0x1:
        .
        .
        .
        case 0xF:
    }

    // timers
    if (delay_timer > 0)
        --delay_timer;
    if (sound_timer > 0) {
        if (sound_timer == 1)
            playSound();
        --sound_timer;
    }
}

```

Input and graphics depend on the libraries you will be using. I went with [SDL2](https://www.libsdl.org/) for these two since it is cross-platform, very well known, and has a lot of documentation. You can refer to my Chip-8 implementation [here](https://github.com/aymanbagabas/C8emu).

## What next?

Well, I really learned a lot from this project. Next, I want to extend this project to have a terminal based UI using [ncurses](https://www.gnu.org/s/ncurses/). Or maybe work on a more complex system like the NES?

## References

* [How to write an emulator](http://www.multigesture.net/articles/how-to-write-an-emulator-chip-8-interpreter/)
* [Cowgod's Chip-8 Technical Reference v1.0](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM)
* [CHIP-8](https://en.wikipedia.org/wiki/CHIP-8)
* [Lazy Foo' SDL2 Tutorial](http://lazyfoo.net/tutorials/SDL/index.php)
