basename=$1
dirname=$2

#uncomment to debug compiler
#DBRK="--debug-brk"

node $DBRK ../../../util/liteVersion -use v0.8/lite-to-js mkInterface -v 1 -o .
