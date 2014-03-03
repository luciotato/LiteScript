LOCAL=$(pwd)
echo $LOCAL

cd ~/LiteScript_online_playground/playground/js
PARAMS="-browser -compile online $*"

CALL="node --debug-brk $LOCAL/lite-debug $PARAMS"
echo $CALL 
$CALL

cd -
