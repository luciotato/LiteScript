basename=$1
dirname=$2

extension=".${basename##*.}"

pwd
echo "$*"
echo "script:$0  dirname:$dirname  basename:$basename  extension:$extension"

if [ $basename != $0 ] && [ $extension = ".sh" ]; then
    . $dirname/$basename $*

elif [ $basename = "js_lite.lite.md" ]; then
    pwd
    . ./bld-js-to-js.sh

elif [ $basename = "c_lite.lite.md" ]; then
    . ./bld-c-to-js.sh

else
    echo "select a file bld-*.sh to determine compilation options" 
fi
