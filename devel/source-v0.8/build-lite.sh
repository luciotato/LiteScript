basename=$1
dirname=$2

if [ $basename = "litec.lite.md" ]; then 
    echo compile LiteC
    cd ../liteC
    pwd
    node lite-js -v 1 -D PROD_C -compile ../source-v0.8/litec -o ../liteC/Ctest/generated
else
    echo compile v0.8
    if node  ../util/lite-js -v 1 -use v0.7 -D PROD_C -compile Compiler -o ../liteC/lib -nomap; then 
        echo compiled OK $(pwd) 
    fi
fi
