#copy latest compiled compiler
cp ../../liteCompiler-v0.7/* ../out/lib/

LOCAL=$(pwd)
echo $LOCAL

PARAMS="-compile simple.lite.md $*"

#cd ~/LiteScript_online_playground/playground/js
#PARAMS="-browser -compile online $*"

#cd ~/LiteScript_online_playground/playground/examples
#PARAMS="-browser -compile Preprocessor $*"

#cd ~/LiteScript-reception-demo/www/js
#PARAMS="-browser -compile index $*"

#cd ~/LiteScript/devel/source-v0.6
#PARAMS="-compile lite-cli $*"

#cd ../test-v0.6/nice-function
#PARAMS="-compile dns $*"

#cd ~/dataDesigner/client/app
#PARAMS="-browser -compile Bienvenido $*"

#cd ~/dataDesigner/client/app
#PARAMS="-browser -compile Gr.interface.md $*"

#DIR=~/LiteScript/devel/liteC
#cd $DIR
#PARAMS="-use $DIR/lib -compile test-Core2 -o Ctest $*"

cd ~/LiteScript/devel/source-v0.8
PARAMS="-compile Compiler $*"

CALL="node --debug-brk $LOCAL/lite-debug -v 1 $PARAMS"
echo $CALL 
$CALL

cd $LOCAL
