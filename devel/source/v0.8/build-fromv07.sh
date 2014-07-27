#!/bin/bash
#this bash script compiles code using v0.7 compiler
#storing generated file at OUT="../../generated/js/v0.8/lite-to-js"
#so v0.8 can self-compile

_lite="_lite"

targetLang="js"
targetTarget="js"
up3=$(echo $targetTarget | tr '[:lower:]' '[:upper:]')
echo "----------------------"
echo "using v0.7-to-$targetLang to generate ($targetLang code) v0.8 lite-to-$targetTarget compiler"
echo "----------------------"
OUT="../../generated/js/v0.8/lite-to-js"
if node ../../util/liteVersion -use v0.7/lite-to-$targetLang $targetLang$_lite -v 1 -D PROD_$up3 -o $OUT; then 
    echo "v07 generated OK ($targetLang code) lite-to-$targetTarget v0.8"
    echo "at $OUT"
    echo .
    OTHER="../../generated/byV07/$targetLang/lite-to-$targetTarget"
    mkdir -p $OTHER
    echo "ALSO COPY TO $OTHER"
    echo "for comparision"
    echo "cp -r $OUT/* $OTHER/*"
    cp -r $OUT/* $OTHER
fi

