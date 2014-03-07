PREV="0.6"
VERSION="0.6"
node lite-js -debug -use v${PREV} -noval -nomap -comments 0 -compile ../source-v${VERSION}/Compiler -o ${out}/lib
