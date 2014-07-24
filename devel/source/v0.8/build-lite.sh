basename=$1
dirname=$2

extension=".${basename##*.}"

echo "$0 $basename $basename $extension"

if [ $basename != $0 ] && [ $extension = ".sh" ]; then
    . $dirname/$basename

else
    echo "select a file bld-*.sh to determine compilation options" 
fi
