#copy latest compiled compiler
cp -uv ../../liteCompiler-v0.6/* ../out/lib/

LOCAL=$(pwd)
echo $LOCAL

#cd ~/LiteScript_online_playground/playground/js
#PARAMS="-browser -compile online $*"

cd ~/LiteScript_online_playground/playground/examples
PARAMS="-browser -compile Preprocessor $*"

#cd ~/LiteScript/devel/source-v0.6
#PARAMS="-compile lite-cli $*"

#cd ../test-v0.6/nice-function
#PARAMS="-compile dns $*"

CALL="node --debug-brk $LOCAL/lite-debug $PARAMS"
echo $CALL 
$CALL

cd -
