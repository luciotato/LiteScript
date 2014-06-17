
if [ $1 = "lite-cli.lite.md" ]; then 
    . ./build-cli.sh
    exit
fi

if node  ../util/lite-js -use v0.6  -compile Compiler -o ../liteCompiler-v0.7 -nomap; then 
    echo compiled v0.7 OK
    #echo copy to ../../lib
    #cp -u ../liteCompiler-v0.6/* ../../lib/
fi

