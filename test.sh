#test.sh

VERSION=0.6

set -e
cd devel/util

#run tests
node test

#self-compile
CWD=$(pwd) 
out='out'

#--------------------------------------
# MAIN

echo ----------------------------------------------
echo TEST- self-compile LiteScript ${VERSION} 
echo ----------------------------------------------
echo cwd: ${CWD}
echo dest dir: ${out}

mkdir -p ${out}

#compile lite-cli (command line interface) v${VERSION} using ${PREV} version, w/o comments or mapsource
node lite-js -use v${VERSION} -noval -nomap -comments 0 -compile ../source-v${VERSION}/lite-cli -o ${out}/lib

#compile main Compiler 
node lite-js -use v${VERSION} -noval -nomap -comments 0 -compile ../source-v${VERSION}/Compiler -o ${out}/lib
