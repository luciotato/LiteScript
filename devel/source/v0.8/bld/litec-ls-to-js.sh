#!/bin/bash
#
# use liteC (fast) compiler to generate js code for v08-lite-to-js compiler
#

cd ..
OUT="../../generated-js/v0.8/lite-to-js"

#create js code
targetLang="js"

#for the lite-to-js compiler
targetTarget="js"

DBRK="$3"

_lite="_lite"
TO_LITE=$(echo $targetTarget | tr '[:lower:]' '[:upper:]')
echo "----------------------"
echo "using litec (fast compiler) to generate ($targetLang code) v0.8 lite-to-$targetTarget compiler"
echo "----------------------"

if litec $targetLang$_lite -v 1 -D PROD_$TO_LITE -o $OUT; then 

    OTHER="../../out/by-c-v08/$targetLang/lite-to-$targetTarget-compiler"
    mkdir -p $OTHER
    echo "ALSO COPY TO $OTHER for comparision"
    #echo "cp -r $OUT/* $OTHER/*"
    cp -r $OUT/* $OTHER
    
    OTHER="../../util/out/lib"
    mkdir -p $OTHER
    echo "ALSO COPY TO $OTHER for tests"
    #echo "cp -r $OUT/* $OTHER/*"
    cp -r $OUT/* $OTHER

    MAIN="../../.."
    echo "ALSO COPY TO MAIN for PRODUCTION"
    echo "COPY /out/lib to main dir /lib"
    rm -rf ${MAIN}/lib/
    mkdir -p ${MAIN}/lib
    cp -r $OUT/* ${MAIN}/lib/

    rm -rf ${MAIN}/lib/*.map
    rm -rf ${MAIN}/lib/lib/*.map
    
    cp -r interfaces/ ${MAIN}/lib/

    cp -r lite ${MAIN}/lib/ #bash entry-point
fi

