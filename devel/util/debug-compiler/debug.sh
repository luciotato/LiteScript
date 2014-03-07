LOCAL=$(pwd)
echo $LOCAL

#cd ~/LiteScript_online_playground/playground/js
#PARAMS="-browser -compile online $*"

cd ~/LiteScript/devel/source-v0.6
PARAMS="-compile lite-cli $*"


CALL="node --debug-brk $LOCAL/lite-debug $PARAMS"
echo $CALL 
$CALL

cd -
