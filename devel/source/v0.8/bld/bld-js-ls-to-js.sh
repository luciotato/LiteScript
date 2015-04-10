#!/bin/bash
# use v08-js compiler to
#
# generate: js code for v08-lite-to-js compiler 
#
# (v0.8-js self-compilation to itself)
# if no errors before production, this script replaces the same .js executing as compiler
# at: 

cd ..
pwd
OUT="../../generated-js/v0.8/lite-to-js"
#OUT="../../out/by-js-v08/js/lite-to-js-compiler"

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

#if lite $targetLang$_lite -perf 1 -v 1 -D PROD_$LITE_TO -o $OUT; then 
if node $DBRK ../../util/liteVersion -use v0.8/lite-to-$targetLang $targetLang$_lite -perf 1 -v 1 -D PROD_$LITE_TO -o $OUT; then 
#echo "(fast compiler)"
#if litec $targetLang$_lite -perf 1 -v 1 -D PROD_$LITE_TO -o $OUT; then 

    echo "generated OK ($targetLang code) lite-to-$targetTarget v0.8"
    echo "at $OUT"
    
    echo "COPY /interfaces to out dir"
    cp -r interfaces/ ${OUT}

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

