if node  ../util/lite-js -use v0.6  -compile Compiler -o ../liteCompiler-v0.6 -nomap; then 
#if lite -target js -compile Compiler -o ../liteCompiler-v0.6 -nomap; then 
    echo compiled v0.6 OK
    echo copy to ../../lib
    cp -u ../liteCompiler-v0.6/* ../../lib/
fi

