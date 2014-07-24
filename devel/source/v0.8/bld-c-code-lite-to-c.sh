#!/bin/bash
#this bash script compiles code using v0.8 compiler

echo "using (js)v0.8-to-c to generate (c code) v0.8 lite-to-c compiler"
OUT="../../generated/c/v0.8/lite-to-c/generated"
if node ../../util/liteVersion -use v0.8/lite-to-c c_lite -v 2 -D PROD_C -o $OUT; then 
    echo "generated OK (c code) lite-to-c v0.8"
    echo "at $OUT"
    cp -uv lib/GlobalScopeC.interface.md $OUT/../lib
fi
