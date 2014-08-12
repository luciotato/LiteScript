basename=$1
dirname=$2
DBRK=$3

extension=".${basename##*.}"

pwd
echo "$*"
echo "script:$0  dirname:$dirname  basename:$basename  extension:$extension"

if [ $basename != $0 ] && [ $extension = ".sh" ]; then
    . $dirname/$basename $*

else
    echo "select a bld-*.sh file to determine compilation options" 
fi
