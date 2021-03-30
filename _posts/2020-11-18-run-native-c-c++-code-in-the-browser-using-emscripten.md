---
title: Run native C/C++ code in the browser using Emscripten
layout: post
comments: true
tags: c cpp emscripten wasm webassembly wmi acpi
---

While working on [WMIDumpper](https://aymanbagabas.com/wmidumpper/), a simple tool that analyzes ACPI WMI blocks, I had to figure out how to implement [bmfdec](https://github.com/pali/bmfdec) in JavaScript. My first thought was to port it to JavaScript and put in the time and effort to rewrite ~1500 lines of C code in JS. But then a light bulb went on in my head, WebAssembly! A quick search showed that [Emscripten](https://emscripten.org/) is exactly what I need. It can compile C/C++ native code into WebAssembly and run it on the web.

## Building native code into WebAssembly/JS

I cloned [bmfdec](https://github.com/pali/bmfdec) and followed Emscripten [documentation](https://emscripten.org/docs/index.html) on how to compile the project into `wasm`. Building [bmfdec](https://github.com/pali/bmfdec) was straightforward using Emscripten compiler.

``` sh
emcc bmfdec/bmf2mof.c -o bmf2mof.js
```

There was one problem though, [bmfdec](https://github.com/pali/bmfdec) was written to take input from stdin as a binary file. I had to modify `bmfdec.c` and change the `main()` function to take a buffer instead of reading binary from stdin and called it `parse_data()`.

``` c
int parse_data(uint8_t *pin, ssize_t lin) {
  static char pout[0x40000];
  int lout;
  if (lin < 0) {
    fprintf(stderr, "Failed to read data: %s\n", strerror(errno));
    return 1;
  } else if (lin == sizeof(pin)) {
    fprintf(stderr, "Failed to read data: %s\n", strerror(EFBIG));
    return 1;
  }
  if (lin <= 16 || ((uint32_t*)pin)[0] != 0x424D4F46 || ((uint32_t*)pin)[1] != 0x01 || ((uint32_t*)pin)[2] != (uint32_t)lin-16 || ((uint32_t*)pin)[3] > sizeof(pout)) {
    fprintf(stderr, "Invalid input\n");
    return 1;
  }
  lout = ((uint32_t*)pin)[3];
  if (ds_dec((char *)pin+16, lin-16, pout, lout, 0) != lout) {
    fprintf(stderr, "Decompress failed\n");
    return 1;
  }
  return process_data(pout, lout);
}
```

## Exporting native functions to JavaScript

To be able to call C functions within JavaScript, we have to compile `bmf2mof` with some extra flags to modularize, and export symbols to the JS output file.

Using `MODULARIZE` compiler flag makes the generated JavaScript modular where you can use promises and `require()` in Node. `EXPORT_NAME='bmf2mof'` compiler flag changes the exported module name, in this case, it would be named `bmf2mof()`. `WASM=1` specifies that we want a wasm output. And finally `"EXPORTED_FUNCTIONS=['_parse_data']"` exports the function `parse_data` from the C code. We also want to [optimize](https://emscripten.org/docs/optimizing/Optimizing-Code.html) the output JS code so we will use `-O2`.

``` sh
emcc bmfdec/bmf2mof.c -s "EXPORTED_FUNCTIONS=['_parse_data']" -s "MODULARIZE=1" -s "EXPORT_NAME='bmf2mof'" -s "WASM=1" -O2 -o bmf2mof.js
```

Now the generated `bmf2mof.js` will have a `_parse_data` function that maps to the C function and can be called from the JavaScript code.

``` javascript
const bmf2mof = require('bmf2mof.js')

const buf = new Uint8Array([0x46, 0x4F, 0x4D, 0x42, ..., 0x20, 0xEC, 0xFF, 0x0F])

bmf2mof().then(instance => {
    function arrayToPtr(array) {
        var ptr = instance._malloc(array.length)
        instance.HEAPU8.set(array, ptr)
        return ptr
    }

    instance._parse_data(arrayToPtr(buf), buf.length)
})
```

Everything works as expected, running the code above `node [filename].js` outputs the data to stdout. However, if we want to use this in the browser, the output would go to the console. So we have to figure out a way to catch the output and redirect it to where we want, in this case, it would be a textarea in [WMIDumpper](https://github.com/aymanbagabas/wmidumpper).

Emscripten documentation was a bit lacking when it comes to this, the generated JS file, so I took the time to try and understand what it does. It turned out that the generated JS defines some default functions to handle the mapping from C/C++ to JS. For example, it defines a `printErr` function that binds to `console.warn` meaning C/C++ code that prints to stderr would use `console.warn` in the JS. See [Create the Module object](https://emscripten.org/docs/api_reference/module.html#creating-the-module-object) for more technical details.

The generated JS takes an object that overrides the default module functions. To redirect our output from stdout to the textarea in the HTML, all we need to do is define our own `print` function.

``` javascript
const textarea = document.getElementById('textarea')

bmf2mof({
    print: function (text) {
        textarea.value += text + '\n'
    }
}).then(instance => ...)
```

And of course, we need to source the generated JS script in the HTML before we can use this code in the browser.

## Reference

You can find the WebAssembly forked version of [bmfdec](https://github.com/pali/bmfdec) at [bmf2mof.wasm](https://github.com/aymanbagabas/bmf2mof.wasm).

[WMIDumpper](https://github.com/aymanbagabas/wmidumpper) really is just a web clone of [wmidump](https://github.com/iksaif/wmidump) and [bmfdec](https://github.com/pali/bmfdec) so kudos to [iksaif](https://github.com/iksaif) and [pali](https://github.com/pali) for their awesome work.