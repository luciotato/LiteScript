#!/bin/bash
# use v08-js compiler to
#
# generate: js code for v08-lite-to-js compiler 
#
# (v0.8-js self-compilation to itself)
# if no errors before production, this script replaces the same .js executing as compiler
# at: 

OUT="../../generated-js/v0.8/lite-to-js"

#create js code
targetLang="js"

#for the lite-to-js compiler
targetTarget="js"

echo "if no compiler errors, .js files at $OUT (actually executing) will be replaced with the result of compilation"

DBRK=$3

_lite="_lite"
LITE_TO=$(echo $targetTarget | tr '[:lower:]' '[:upper:]')
echo "----------------------"
echo "using v0.8-to-$targetLang to generate ($targetLang code) v0.8 lite-to-$targetTarget compiler"
echo "----------------------"
if node $DBRK ../../util/liteVersion -use v0.8/lite-to-$targetLang $targetLang$_lite -perf 1 -v 1 -D PROD_$LITE_TO -o $OUT; then 
    echo "generated OK ($targetLang code) lite-to-$targetTarget v0.8"
    echo "at $OUT"
fi

