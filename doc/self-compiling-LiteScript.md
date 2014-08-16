## Self-compiling Litescript

[LiteScript](https://github.com/luciotato/LiteScript) compiler is written in LiteScript. 
Since we can generate js-code or c-code
from the LiteScript sources, here's a comparision of LiteScript compiler, self-compiling
when using the generated-js-code vs using generated-c-code.

This is also a step-by-step explanation of how each version of the compiler can compile itself.

## Source
we start with LiteScript compiler v0.8 sources. Let's call this *input0*

## Phase 1
We use *the previous, executable version of the compiler* to compile this source.

We feed *input0* (v0.8 sources) to v0.7 compiler

Since v0.7 compiler is js-code, this compilation phase runs under node.js

        ----------------------
        using v0.7-to-js to generate (js code) v0.8 lite-to-js compiler
        ----------------------
        node /home/ltato/LiteScript/devel/util/liteVersion -use v0.7/lite-to-js js_lite -v 3 -D PROD_JS -o ../../generated-js/v0.8/lite-to-js
        compiler options: {"outDir":"/home/ltato/LiteScript/devel/generated-js/v0.8/lite-to-js","verboseLevel":3,"warningLevel":1,"debugEnabled":false,"skip":false,"generateSourceMap":true,"single":false,"browser":false,"comments":1,"perf":0,"defines":["PROD_JS"],"includeDirs":[],"mainModuleName":"js_lite"}
        compile: js_lite
        out: /home/ltato/LiteScript/devel/generated-js/v0.8/lite-to-js
        compiler path: ../generated-js/v0.7/lite-to-js
        LiteScript compiler version 0.7.9  - Build Date:  20140722
        Out Dir: /home/ltato/LiteScript/devel/generated-js/v0.8/lite-to-js
        preprocessor #defined [ 'PROD_JS', 'ENV_NODE', 'TARGET_JS' ]
        0 errors, 0 warnings.
        [Finished in 9.4s]

The v0.7 (js) took 9.4 seconds in compilig v.08 sources to-js

The output of this phase is ***(js)output1***, a js-executable version of v0.8 compiler

## Phase 2
Now that we have a executable version of the v0.8 compiler,
we check if the v0.8 compiler is able to compile itself

We feed **input0** (v0.8 sources) to **(js)output1** (v0.8 js-code compiler)

    ----------------------
    using v0.8-to-js to generate (js code) v0.8 lite-to-js compiler
    ----------------------
    node /home/ltato/LiteScript/devel/util/liteVersion -use v0.8/lite-to-js js_lite -perf 1 -v 1 -D PROD_JS -o ../../generated-js/v0.8/lite-to-js
    compiler options: {"outDir":"/home/ltato/LiteScript/devel/generated-js/v0.8/lite-to-js","verboseLevel":1,"warningLevel":1,"debugEnabled":false,"skip":false,"generateSourceMap":true,"single":false,"browser":false,"comments":1,"perf":1,"defines":["PROD_JS"],"includeDirs":[],"mainModuleName":"js_lite"}
    cwd: /home/ltato/LiteScript/devel/source/v0.8
    compile: js_lite
    out: /home/ltato/LiteScript/devel/generated-js/v0.8/lite-to-js
    compiler path: ../generated-js/v0.8/lite-to-js
    LiteScript compiler version 0.8.5  - Build Date:  Sat Aug 16 2014 05:59:39 GMT-0300 (ART)
    Project Dir: /home/ltato/LiteScript/devel/source/v0.8
    Main Module: js_lite
    Out Dir: /home/ltato/LiteScript/devel/generated-js/v0.8/lite-to-js
    preprocessor #defined [ 'PROD_JS', 'ENV_JS', 'ENV_NODE', 'TARGET_JS' ]
    Compiling js_lite
    Producing js
    Generated .js files (22) at /home/ltato/LiteScript/devel/generated-js/v0.8/lite-to-js
    0 errors, 0 warnings.
    Total Compile Project: 11383ms
    [Finished in 11.5s]

The v0.8(js-code-compiler) took 11.5 seconds to compile itself

The output of this phase, ***(js)output1-B*** is a js-executable version of v0.8 compiler by itself
*and should be equal to* ***(js)output1***, i.e.: the code making the compilation.

if ***(js)output1-B*** == ***(js)output1***, then the v0.8(js-code) compiler can compile itself

## Phase 3 - generating compile-to-C

To be able generate C-code we need first to obtain the 'compile-to-c'
variant of the 0.8 compiler.

We feed **input0** (v0.8 sources) to **(js)output1** (v0.8 js-code compiler) with the instruction to
import the "produce_c" module (#define PROD_C)

    ----------------------
    using litec v0.8-to-c to generate (js code) v0.8 lite-to-c compiler
    ----------------------
    node /home/ltato/LiteScript/devel/util/liteVersion -use v0.8/lite-to-js js_lite -perf 1 -v 1 -D PROD_C -o ../../generated-js/v0.8/lite-to-c
    compiler options: {"outDir":"/home/ltato/LiteScript/devel/generated-js/v0.8/lite-to-c","verboseLevel":1,"warningLevel":1,"debugEnabled":false,"skip":false,"generateSourceMap":true,"single":false,"browser":false,"comments":1,"perf":1,"defines":["PROD_C"],"includeDirs":[],"mainModuleName":"js_lite"}
    cwd: /home/ltato/LiteScript/devel/source/v0.8
    compile: js_lite
    out: /home/ltato/LiteScript/devel/generated-js/v0.8/lite-to-c
    compiler path: ../generated-js/v0.8/lite-to-js
    LiteScript compiler version 0.8.5  - Build Date:  Sat Aug 16 2014 05:59:53 GMT-0300 (ART)
    Project Dir: /home/ltato/LiteScript/devel/source/v0.8
    Main Module: js_lite
    Out Dir: /home/ltato/LiteScript/devel/generated-js/v0.8/lite-to-c
    preprocessor #defined [ 'PROD_C', 'ENV_JS', 'ENV_NODE', 'TARGET_JS' ]
    Compiling js_lite
    Producing js
    Generated .js files (21) at /home/ltato/LiteScript/devel/generated-js/v0.8/lite-to-c
    0 errors, 0 warnings.
    Total Compile Project: 12928ms
    generated OK (js code) lite-to-c v0.8
    at ../../generated-js/v0.8/lite-to-c
    COPY ALSO: interfaces
    [Finished in 13s]

The v0.8(js-code-compiler) took 13 seconds in compilig it's compile-to-c version (js code)

We'll call the output of this phase ***(js)output2(-to-c)***: a js-executable version of v0.8 *compile-to-c* compiler

## Phase 4 - Going C

now we can generate C-code for the v0.8 LiteScript Compiler

We feed **input0** (v0.8 sources) to **(js)output2(-to-c)** 

    ----------------------
    using v0.8-to-c to generate (c code) v0.8 lite-to-js compiler
    ----------------------
    node /home/ltato/LiteScript/devel/util/liteVersion -use v0.8/lite-to-c c_lite -v 1 -D PROD_JS -o ../../litec/litec-to-js/generated-c
    compiler options: {"outDir":"/home/ltato/LiteScript/devel/litec/litec-to-js/generated-c","verboseLevel":1,"warningLevel":1,"debugEnabled":false,"skip":false,"generateSourceMap":true,"single":false,"browser":false,"comments":1,"perf":0,"defines":["PROD_JS"],"includeDirs":[],"mainModuleName":"c_lite"}
    cwd: /home/ltato/LiteScript/devel/source/v0.8
    compile: c_lite
    out: /home/ltato/LiteScript/devel/litec/litec-to-js/generated-c
    compiler path: ../generated-js/v0.8/lite-to-c
    LiteScript compiler version 0.8.5  - Build Date:  Sat Aug 16 2014 06:11:10 GMT-0300 (ART)
    Project Dir: /home/ltato/LiteScript/devel/source/v0.8
    Main Module: c_lite
    Out Dir: /home/ltato/LiteScript/devel/litec/litec-to-js/generated-c
    preprocessor #defined [ 'PROD_JS', 'ENV_JS', 'ENV_NODE', 'TARGET_C' ]
    Compiling c_lite
    Producing c
    Generated .c files (21) at /home/ltato/LiteScript/devel/litec/litec-to-js/generated-c
    0 errors, 0 warnings.
    generated OK (c code) lite-to-js v0.8
    at ../../litec/litec-to-js/generated-c
    [Finished in 14s]

The (js)v0.8(-to-c) compiler took 14 seconds to compile a C-code version of itself

We'll call the output of this phase ***(c)output3(-to-js)***: a c-code version of v0.8 *compile-to-js* compiler


## Phase 4.1 - Compiling the C-code

Now that we have the C-code, we use gcc (Netbeans IDE) to compile to a native-exe

    "/usr/bin/make" -f nbproject/Makefile-Release.mk QMAKE= SUBPROJECTS= .build-conf
    make[1]: Entering directory `/home/ltato/LiteScript/devel/litec/litec-to-js'
    "/usr/bin/make"  -f nbproject/Makefile-Release.mk dist/Release/GNU-Linux-x86/litec-to-js
    make[2]: Entering directory `/home/ltato/LiteScript/devel/litec/litec-to-js'
    mkdir -p build/Release/GNU-Linux-x86/_ext/761097586
    ...
    make[1]: Leaving directory `/home/ltato/LiteScript/devel/litec/litec-to-js'
    BUILD SUCCESSFUL (total time: 15s)

GCC took 15s to compile ***(c)output3(-to-js)*** into a *native executable*

we call this native-exe *litec*, [Lite]Script [C]ompiler

## Phase 5 - Using the native exe to compile

Now that we have a native executable version of the v0.8 compiler,
we check if this version is able to compile itself

We feed **input0** (v0.8 sources) to *litec* (v0.8 native-exe compiler)

    LiteScript compile-to-js v0.8.5 Sat Aug 16 2014 06:21:50 GMT-0300 (ART) (standalone executable) 
    Project Dir: /home/ltato/LiteScript/devel/source/v0.8 
    Main Module: js_lite 
    Out Dir: /home/ltato/LiteScript/devel/out/by-c-v08/js/lite-to-js-compiler 
    preprocessor #defined PROD_JS, FROM_C, ENV_C, TARGET_JS 
    Compiling js_lite 
    Producing js 
    Generated .js files (22) at /home/ltato/LiteScript/devel/out/by-c-v08/js/lite-to-js-compiler 
    0 errors, 0 warnings. 
    Total Compile Project 1600  ms 

    RUN FINISHED; exit value 0; real time: 1s; user: 240ms; system: 1s

The v0.8(native-exe) took 1.6 seconds to compile itself

The output of this phase is ***(js)output1-B***: a js-executable version of v0.8 compiler by itself
*and should be equal to* ***(js)output1***

if ***(js)output1-B*** == ***(js)output1***, then the v0.8(native-exe) compiler can compile itself to js.

Now here's the important performance comparision, the js-version of the v0.8 compiler, took 
11.5 seconds to generate ***(js)output1-B***, and the native-exe took 1.6 seconds to do the same.

Here we have a 7x performance difference ***The native-exe runs 7 times faster than the js-version*** 
of the same source LitesScript code.

