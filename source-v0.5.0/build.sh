#lite -c sourceMap -o ~/cofee
if node ../util/lite-js -use v0.4.0 -compile Compiler -o ../liteCompiler-v0.5.0; then 
    echo compiled v0.5 OK
#    cp -u ../liteCompiler-v0.5.0/* ../util/litescript-npm/lib
#    cd ../util/src
#    lite -run make-litescript-package
fi
