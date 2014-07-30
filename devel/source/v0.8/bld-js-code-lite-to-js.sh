#!/bin/bash
# use v08-js compiler to
#
# generate: js code for v08-lite-to-js compiler 
#
# (v0.8-js self-compilation to itself)

OUT="../../generated-js/v0.8/lite-to-js"

#create js code
targetLang="js"

#for the lite-to-js compiler
targetTarget="js"

echo "using v0.8-to-js to generate (js code) v0.8 lite-to-js compiler (v08 self compilation)"

#DBRK="--debug-brk"

if node $DBRK ../../util/liteVersion -use v0.8/lite-to-js js_lite  -v 1 -o $OUT; then 
    echo "generated OK (js code) lite-to-js v0.8"
    echo "at $OUT"
fi
