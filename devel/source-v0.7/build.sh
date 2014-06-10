OUT=../liteC/lib
if node  ../util/lite-js -use v0.6 -D PROD_C -compile Compiler -o $OUT -nomap; then 
    echo compiled OK $(pwd) 
    echo compiled at $OUT
fi

#node  ../util/lite-js -use v0.6 -D PROD_C -compile producer_c.lite.md -single -o $OUT -nomap
