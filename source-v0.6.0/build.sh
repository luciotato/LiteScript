
if node ../util/lite-js -use v0.5.0 -compile Compiler -nomap -o ../liteCompiler-v0.6.0; then 

    echo compiled v0.6 OK

    #copy to litescript-npm/lib (linked npm -g package)
    mkdir -p ../util/litescript-npm/lib
    cp -u ../liteCompiler-v0.6.0/*  ../util/litescript-npm/lib/

    #make-sure lite-cli is also there
    cp -u ../util/lib/* ../util/litescript-npm/lib/

    # update README, package.json, etc
    cd ../util/src
    lite -run make-litescript-package

fi
