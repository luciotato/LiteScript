if node  ../util/lite-js -use v0.5 -compile Compiler -o ../liteCompiler-v0.6 -nomap; then 
#if lite -compile Compiler -nomap -o ../liteCompiler-v0.6; then 
    echo compiled v0.6 OK
    echo copy to ../../lib
    cp -u ../liteCompiler-v0.6/* ../../lib/
fi
