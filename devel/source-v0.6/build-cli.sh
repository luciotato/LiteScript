#compile lite-cli (command line interface) v${VERSION} using ${PREV} version, w/o comments or mapsource

if lite -c lite-cli -o ../liteCompiler-v0.6 -noval -nomap -comments 0; then 
    echo copy to ../../lib
    cp -u ../liteCompiler-v0.6/lite-cli.js ../../lib/
    cp -u ../liteCompiler-v0.6/Args.js ../../lib/
fi
