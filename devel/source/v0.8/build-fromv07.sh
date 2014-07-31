#!/bin/bash
#
# (use v07 compiler to) generate js code for v08-lite-to-js compiler
# after this compilation, v0.8 can self-compile

OUT="../../generated-js/v0.8/lite-to-js"

#create js code
targetLang="js"

#for the lite-to-js compiler
targetTarget="js"

DBRK="$3"

_lite="_lite"
TO_LITE=$(echo $targetTarget | tr '[:lower:]' '[:upper:]')
echo "----------------------"
echo "using v0.7-to-$targetLang to generate ($targetLang code) v0.8 lite-to-$targetTarget compiler"
echo "----------------------"
if node $DBRK ../../util/liteVersion -use v0.7/lite-to-$targetLang $targetLang$_lite -v 1 -D PROD_$TO_LITE -o $OUT; then 
    echo "v07 generated OK ($targetLang code) lite-to-$targetTarget v0.8"
    echo "at $OUT"
    OTHER="../../out/byV07/$targetLang/lite-to-$targetTarget"
    mkdir -p $OTHER
    echo "ALSO COPY TO $OTHER for comparision"
    #echo "cp -r $OUT/* $OTHER/*"
    cp -r $OUT/* $OTHER
fi

