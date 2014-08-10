basename=$1
dirname=$2
DBRK=$3

extension=".${basename##*.}"

#if it is a .sh and not this one, exec the sh
if [ $basename != $0 ] && [ $extension = ".sh" ]; then
    . $dirname/$basename $*

elif [ $1 = "lite-cli.lite.md" ]; then 
    echo "use installed lite compiler to compile v0.7/lite-cli"
    if lite lite-cli -o -o ../../generated-js/v0.7/lite-to-js -noval -nomap -comments 0; then 
        echo "compiled lite-cli v0.7 at ../../generated/js/v0.7/lite-to-js"
        #echo copy to [home]/lib
        #cp -u ../liteCompiler-v0.7/lite-cli.js ../../lib/
        #cp -u ../liteCompiler-v0.7/Args.js ../../lib/
        #echo copy to ../../devel/util/out/lib
        #cp -u ../liteCompiler-v0.7/lite-cli.js ../../devel/util/out/lib
        #cp -u ../liteCompiler-v0.7/Args.js ../../devel/util/out/lib
    fi
else
    echo "use v0.6 to compile v0.7"
    if node  ../../util/liteVersion -use v0.6/lite-to-js Compiler -o ../../generated-js/v0.7/lite-to-js -nomap; then 
        echo "compiled OK v0.7 lite-to-js (js code)"
        #echo copy to ../../lib
        #cp -u ../liteCompiler-v0.6/* ../../lib/
    fi
fi
