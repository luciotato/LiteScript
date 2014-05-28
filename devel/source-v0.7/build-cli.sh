#compile lite-cli (command line interface) v${VERSION} using ${PREV} version, w/o comments or mapsource

if lite -c lite-cli -o ../liteCompiler-v0.6 -noval -nomap -comments 0; then 
    echo copy to [home]/lib
    cp -u ../liteCompiler-v0.6/lite-cli.js ../../lib/
    cp -u ../liteCompiler-v0.6/Args.js ../../lib/
    echo copy to ../../devel/util/out/lib
    cp -u ../liteCompiler-v0.6/lite-cli.js ../../devel/util/out/lib
    cp -u ../liteCompiler-v0.6/Args.js ../../devel/util/out/lib
fi
