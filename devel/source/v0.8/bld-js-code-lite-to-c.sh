#!/bin/bash
#this bash script compiles code using v0.8 compiler

echo "using v0.8-to-js to generate (js code) v0.8 lite-to-c compiler"
OUT="../../generated/js/v0.8/lite-to-c"
if node ../../util/liteVersion -use v0.8/lite-to-js js_lite -D PROD_C -v 1 -o $OUT; then 
    echo "generated OK (js code) lite-to-c v0.8"
    echo "at $OUT"
fi
