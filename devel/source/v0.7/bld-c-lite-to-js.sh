##!/bin/bash
# use v08-js compiler to
# generate: c code for (STABLE)v07-lite-to-js compiler 
#
# (v0.8-js compile v07-source to v07-c lite-to-js compiler)

OUT="../../litec/litec-to-js"

#create c code
targetLang="c"

#for the lite-to-js compiler
targetTarget="js"

#uncomment to debug compiler
DBRK="$3"

_lite="_lite"
LITE_TO=$(echo $targetTarget | tr '[:lower:]' '[:upper:]')
echo "----------------------"
echo "using v0.8-to-$targetLang to generate ($targetLang code) v0.7 lite-to-$targetTarget compiler"
echo "----------------------"
if node $DBRK ../../util/liteVersion -use v0.8/lite-to-$targetLang $targetLang$_lite -v 1 -D PROD_$LITE_TO -o $OUT/generated-c; then 
    echo "generated OK ($targetLang code) lite-to-$targetTarget v0.8"
    echo "at $OUT/generated-c"
    #copy also all global scope interfaces
    mkdir -p $OUT/interfaces
    cp interfaces/GlobalScope*.interface.md $OUT/interfaces
fi
