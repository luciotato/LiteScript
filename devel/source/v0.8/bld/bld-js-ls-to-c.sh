#!/bin/bash
# use v08-js compiler to
#
# generate: js code for v08-lite-to-c compiler 
#
# (v0.8-js self-compilation to v08-js lite-to-c compiler)

cd ..
OUT="../../generated-js/v0.8/lite-to-c"

#create js code
targetLang="js"

#for the lite-to-c compiler
targetTarget="c"

_lite="_lite"
LITE_TO=$(echo $targetTarget | tr '[:lower:]' '[:upper:]')

echo "----------------------"
echo "using litec (fast) v0.8-to-$targetLang to generate ($targetLang code) v0.8 lite-to-$targetTarget compiler"
echo "----------------------"

if node $DBRK ../../util/liteVersion -use v0.8/lite-to-$targetLang $targetLang$_lite -perf 1 -v 1 -D PROD_$LITE_TO -o $OUT; then 
#echo "(fast compiler)"
#if litec $targetLang$_lite -v 1 -D PROD_$LITE_TO -o $OUT; then 

    echo "generated OK ($targetLang code) lite-to-$targetTarget v0.8"
    echo "at $OUT"

    echo COPY ALSO: interfaces
    cp -r interfaces/ ${OUT}

fi
