#!/bin/bash
# use v08 compiler to
#
# generate: c code for v08-lite-to-c compiler 
#
# (v0.8 self-compilation, generate (c-code) litec-to-c compiler

cd ..
OUT="../../litec/litec-to-c/generated-c"
#OUT="../../out/by-c-v08/c/lite-to-c-compiler"

#create c code
targetLang="c"

#for the lite-to-c compiler
targetTarget="c"

#uncomment to debug compiler
#DBRK="--debug-brk"

_lite="_lite"
up3=$(echo $targetTarget | tr '[:lower:]' '[:upper:]')

echo "----------------------"
echo "using v0.8-ls-to-$targetLang to generate ($targetLang code) v0.8 lite-to-$targetTarget compiler"
echo "----------------------"

if node $DBRK ../../util/liteVersion -use v0.8/lite-to-$targetLang $targetLang$_lite -v 1 -D PROD_$up3 -o $OUT; then 
#if litecc $targetLang$_lite -v 1 -D PROD_$up3 -o $OUT; then     

    echo "generated OK ($targetLang code) lite-to-$targetTarget v0.8"
    echo "at $OUT"

fi
