#!/bin/bash
#this bash script compiles code using v0.8 compiler

echo "--------------------------"
echo "bld-combine compiler-run-lang=$1 target-lang=$2 target-target-lang=$3"
echo "--------------------------"

if [ "$1" != "c" ] && [ "$1" != "js" ]; then 
    echo "usage:"
    echo "bld-combine compiler-run-lang target-lang target-target-lang"
    echo "   where compiler-run-lang is (c|js): (run the v08(c-native-exe)-compiler|run the v08(js-code)compiler)"
    echo "   and target-lang is (c|js): (generate source (.c) for the v08(c-code)-compiler|generate source(.js) for the v08(js-code)compiler)"
    echo "   and target-target-lang is (c|js): (generate lite-to-c compiler source|generate lite-to-js compiler source)"
    echo "   "
    exit
fi

targetLang=$3
targetTarget=$3
up3=$(echo $targetTarget | tr '[:lower:]' '[:upper:]')

if [ "$1" = "c" ]; then 
    runCmdDir="../../generated/c/v0.8/lite-to-$targetLang/"
    runCmd="lite$targetLang"
else
    #run the js version
    runCmdDir=""
    runCmd="node ../../util/liteVersion -use v0.8/lite-to-$targetLang"
fi

_lite="_lite"

echo "using ($1)v0.8-to-$targetLang to generate ($targetLang code) v0.8 lite-to-$targetTarget compiler"
OUT="../../generated/byV08in$1/$targetLang/lite-to-$targetTarget"
if $runCmdDir$runCmd $targetLang$_lite -v 1 -D PROD_$up3 -o $OUT; then 
    echo "generated OK ($targetLang code) lite-to-$targetTarget v0.8"
    echo "at $OUT"
fi
