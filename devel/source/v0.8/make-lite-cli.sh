#!/bin/bashcd lib
#compile the cli to js, using actual cli
node ../../../lib/js_lite.js js_lite.lite.md
#copy the compiled cli to replace actual cli /lib
cp generated/js/js_lite.js ../../../lib
ll ../../../lib/js_lite.js
