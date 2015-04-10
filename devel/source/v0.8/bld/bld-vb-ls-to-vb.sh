#!/bin/bash
# use v08-js compiler to
#
# generate: VB.NET code for v08-lite-to-js compiler 
#

cd ..
pwd
OUT="../../generated-vb/v0.8/lite-to-vb"

#create vb code
targetLang="vb"

#for the lite-to-vb compiler
targetTarget="vb"

echo "if no compiler errors, .$targetLang files at $OUT will be replaced with the result of compilation"

DBRK=$3

_lite="_lite"
LITE_TO=$(echo $targetTarget | tr '[:lower:]' '[:upper:]')
echo "----------------------"
echo "using v0.8-to-$targetLang to generate ($targetLang code) v0.8 lite-to-$targetTarget compiler"
echo "----------------------"

if node $DBRK ../../util/liteVersion -use v0.8/lite-to-$targetLang $targetLang$_lite -perf 1 -v 2 -D PROD_$LITE_TO -o $OUT; then 
#if lite $targetLang$_lite -perf 1 -v 1 -D PROD_$LITE_TO -o $OUT; then 
#if node $DBRK ../../util/liteVersion -use v0.8/lite-to-$targetLang $targetLang$_lite -perf 1 -v 2 -D PROD_$LITE_TO -o $OUT; then 
#echo "(fast compiler)"
#if litec $targetLang$_lite -perf 1 -v 1 -D PROD_$LITE_TO -o $OUT; then 

    echo "generated OK ($targetLang code) lite-to-$targetTarget v0.8"
    echo "at $OUT"
    
    # echo "COPY /interfaces to out dir"
    # cp -r interfaces/ ${OUT}

    # OTHER="../../out/by-js-v08/js/lite-to-js-compiler"
    # mkdir -p $OTHER
    # echo "ALSO COPY TO $OTHER for output comparision"
    # #echo "cp -r $OUT/* $OTHER/*"
    # cp -r $OUT/* $OTHER

    # OTHER="../../util/out/lib"
    # mkdir -p $OTHER
    # echo "ALSO COPY TO $OTHER to run tests"
    # #echo "cp -r $OUT/* $OTHER/*"
    # cp -r $OUT/* $OTHER

    # MAIN="../../.."
    # echo "ALSO COPY TO MAIN for PRODUCTION"
    # echo "COPY /out/lib to main dir /lib"
    # rm -rf ${MAIN}/lib/
    # mkdir -p ${MAIN}/lib
    # cp -r $OUT/* ${MAIN}/lib/

    # rm -rf ${MAIN}/lib/*.map
    # rm -rf ${MAIN}/lib/lib/*.map
    
    # cp -r interfaces/ ${MAIN}/lib/

    # cp -r lite ${MAIN}/lib/ #bash entry-point

fi

