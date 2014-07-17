basename=$1
dirname=$2

if [ $basename = "litec.lite.md" ]; then 
    echo compile LiteC
    cd ../liteC
    pwd
    node lite-js -v 2 -D PROD_C -compile ../source-v0.8/litec -o ../liteC/Ctest/generated
else
    if node  ../lite-js -v 2 -D PROD_C -compile $1 -o . ; then 
        echo compiled OK $(pwd)$1
    fi
fi
