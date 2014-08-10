basename=$1
dirname=$2
DBRK=$3

extension=".${basename##*.}"

pwd
echo "$*"
echo "script:$0  dirname:$dirname  basename:$basename  extension:$extension"

if [ $basename != $0 ] && [ $extension = ".sh" ]; then
    . $dirname/$basename $*

elif [ $basename = "c_lite.lite.md" ]; then
    . ./bld-c-ls-to-js.sh

#on Producer_c generate js-code for the lite-to-c compiler
elif [ $basename = "Producer_c.lite.md" ]; then
    . ./bld-js-ls-to-c.sh

#test compiler with 1.lite.md
elif [ $basename = "1.lite.md" ]; then
    node $DBRK ../../util/liteVersion -use v0.8/lite-to-js $basename -v 1 -o $OUT

#elif [ $basename = "js_lite.lite.md" ]; then
#    pwd
#    . ./bld-js-ls-to-js.sh

else
    . ./bld-js-ls-to-js.sh
    #echo "select a file bld-*.sh to determine compilation options" 
fi
