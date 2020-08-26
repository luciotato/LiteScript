basename=$1
dirname=$2
DBRK=$3

extension=".${basename##*.}"

cd bld
pwd

#echo "$*"
#echo "script:$0  dirname:$dirname  basename:$basename  extension:$extension"

if [ $basename != $0 ] && [ $extension = ".sh" ]; then
    . $dirname/$basename $*

elif [ $basename = "c_lite.lite.md" ]; then
    . ./bld-c-ls-to-js.sh

#on Producer_c generate js-code for the lite-to-c compiler
elif [ $basename = "Producer_c.lite.md" ]; then
    . ./bld-js-ls-to-c.sh

elif [ $basename = "js_lite.lite.md" ]; then
    pwd
    . ./bld-js-ls-to-js.sh

else
    #default: use litec-to-js
    #. ./bld-c-ls-to-js.sh

    #default: instruct to select a bld/
    #echo "select a file from bld/*.sh to determine compilation options" 

    #other: use recently compiled (js)v0.8-ls-to-js
    cd ..
    OUT=../../generated-js/v0.8/lite-to-js
    if node $DBRK ../../util/liteVersion -use v0.8/lite-to-js js_lite -perf 1 -v 2 -D PROD_JS -o ${OUT}; then 
        echo "COPY /interfaces to out dir"
        cp -r interfaces/ ${OUT}
    fi

fi
