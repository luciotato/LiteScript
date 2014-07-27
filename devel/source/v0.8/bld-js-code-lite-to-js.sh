#!/bin/bash
#this bash script compiles code using v0.8 compiler

echo "using v0.8-to-js to generate (js code) v0.8 lite-to-js compiler"
OUT="../../generated/js/v0.8/lite-to-js"

#DBRK="--debug-brk"

if node $DBRK ../../util/liteVersion -use v0.8/lite-to-js js_lite  -v 1 -o $OUT; then 
    echo "generated OK (js code) lite-to-js v0.8"
    echo "at $OUT"
fi
